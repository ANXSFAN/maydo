import { NextResponse, connection } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { toImageUrl } from "@/lib/menu-types";

// 菜单诊断：网站读不到菜单时打开 /api/menu-health，看是哪一环出了问题。
// 只返回数量和错误信息，不返回密钥、菜品内容或其他 tenant 的数据。

type Check = { count: number | null; error: string | null };

const toCheck = ({ count, error }: { count: number | null; error: { message: string; code?: string } | null }): Check => ({
  count: error ? null : count ?? 0,
  error: error ? [error.code, error.message].filter(Boolean).join(": ") : null,
});

const mask = (value: string) => (value.length <= 8 ? value : `${value.slice(0, 8)}…`);

export async function GET() {
  await connection();

  const url = process.env.ORDERLIX_SUPABASE_URL ?? "";
  const anonKey = process.env.ORDERLIX_SUPABASE_ANON_KEY ?? "";
  const tenantId = process.env.ORDERLIX_TENANT_ID ?? "";

  const env = {
    ORDERLIX_SUPABASE_URL: url ? safeHost(url) : null,
    ORDERLIX_SUPABASE_ANON_KEY: anonKey ? "set" : null,
    ORDERLIX_TENANT_ID: tenantId ? mask(tenantId) : null,
  };

  if (!url || !anonKey || !tenantId) {
    return respond({
      env,
      diagnosis: {
        code: "missing_env",
        hint: "Vercel 环境变量缺失：检查 ORDERLIX_SUPABASE_URL / ORDERLIX_SUPABASE_ANON_KEY / ORDERLIX_TENANT_ID，改完需重新部署。",
      },
    });
  }

  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  const count = (table: string) => db.from(table).select("id", { count: "exact", head: true });

  // 与 lib/menuService.ts 的查询保持一致（列名 + 过滤条件），列名变动会在这里报错
  const [visible, tenantRows, anyTenant] = await Promise.all([
    Promise.all([
      db
        .from("menu_category")
        .select("id, name, image_url, sort_order, station", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("is_active", true),
      db
        .from("menu_item")
        .select("id, category_id, name, description, price, image_url, allergens, options", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("is_available", true),
    ]),
    Promise.all([
      count("menu_category").eq("tenant_id", tenantId),
      count("menu_item").eq("tenant_id", tenantId),
    ]),
    Promise.all([count("menu_category"), count("menu_item")]),
  ]);

  const checks = {
    // 网站实际展示的数量
    shown: { categories: toCheck(visible[0]), items: toCheck(visible[1]) },
    // 本 tenant 全部数量（含停用 / 不可售）
    tenant: { categories: toCheck(tenantRows[0]), items: toCheck(tenantRows[1]) },
    // 不限 tenant、匿名 key 能看到的总数
    anyTenant: { categories: toCheck(anyTenant[0]), items: toCheck(anyTenant[1]) },
  };

  // 用完整数据再走一遍网站的取数，检查会让页面渲染出错的脏数据格式
  const started = Date.now();
  const [rawCats, rawItems] = await Promise.all([
    db.from("menu_category").select("id, name").eq("tenant_id", tenantId).eq("is_active", true),
    db
      .from("menu_item")
      .select("id, category_id, name, description, price, image_url, allergens, options")
      .eq("tenant_id", tenantId)
      .eq("is_available", true),
  ]);
  const fetchMs = Date.now() - started;
  const dataShape =
    rawCats.error || rawItems.error
      ? { error: (rawCats.error ?? rawItems.error)!.message }
      : inspectShapes(rawCats.data ?? [], rawItems.data ?? []);

  let diagnosis = diagnose(checks);
  const dirty = "issues" in dataShape
    ? Object.keys(dataShape.issues).filter((k) => !k.startsWith("item 所属分类"))
    : [];
  if (diagnosis.code === "ok" && dirty.length > 0) {
    diagnosis = {
      code: "dirty_data",
      hint: `菜单能读到，但有格式异常的数据（${dirty.join("、")}）。网站已做兼容不会再 500，建议在 Orderlix 后台修正 examples 里的菜品。`,
    };
  }

  return respond({ env, checks, fetchMs, dataShape, diagnosis });
}

type Row = Record<string, unknown>;

const isPlainObject = (v: unknown): v is Row => !!v && typeof v === "object" && !Array.isArray(v);
const isTextRecord = (v: unknown) =>
  isPlainObject(v) && Object.values(v).every((x) => x == null || typeof x === "string");

function inspectShapes(cats: Row[], items: Row[]) {
  const issues: Record<string, string[]> = {};
  const flag = (key: string, id: unknown) => (issues[key] ??= []).push(String(id));

  for (const c of cats) {
    if (!isTextRecord(c.name)) flag("category.name 格式异常", c.id);
  }

  const catIds = new Set(cats.map((c) => String(c.id)));
  const imageHosts: Record<string, number> = {};
  for (const i of items) {
    if (!isTextRecord(i.name)) flag("item.name 格式异常", i.id);
    if (i.description != null && !isTextRecord(i.description)) flag("item.description 格式异常", i.id);
    if (i.allergens != null && !(Array.isArray(i.allergens) && i.allergens.every((a) => typeof a === "string")))
      flag("item.allergens 不是字符串数组", i.id);
    if (i.options != null && !Array.isArray(i.options)) flag("item.options 不是数组", i.id);
    if (!Number.isFinite(Number(i.price)) || i.price == null) flag("item.price 不是数字", i.id);
    if (!catIds.has(String(i.category_id))) flag("item 所属分类未启用（不显示）", i.id);

    if (i.image_url != null && i.image_url !== "") {
      const url = toImageUrl(i.image_url);
      if (!url || url !== i.image_url) flag("item.image_url 格式异常", i.id);
      const host = url?.startsWith("/") ? "(站内路径)" : url ? new URL(url).host : "(无效)";
      imageHosts[host] = (imageHosts[host] ?? 0) + 1;
    }
  }

  return {
    issues: Object.fromEntries(
      Object.entries(issues).map(([k, ids]) => [k, { count: ids.length, examples: ids.slice(0, 3) }])
    ),
    imageHosts,
  };
}

function diagnose(c: {
  shown: { categories: Check; items: Check };
  tenant: { categories: Check; items: Check };
  anyTenant: { categories: Check; items: Check };
}) {
  const errors = [c.shown.categories, c.shown.items, c.tenant.items, c.anyTenant.items].filter((x) => x.error);
  if (errors.length > 0) {
    return {
      code: "query_error",
      hint: "查询报错：多半是 Orderlix 改了表结构（列名 / 表名）、Supabase 地址或 key 失效。看上面 error 字段。",
    };
  }
  if ((c.shown.items.count ?? 0) > 0 && (c.shown.categories.count ?? 0) > 0) {
    return { code: "ok", hint: "网站能读到菜单。若页面仍为空，检查菜品的 category_id 是否对应到启用的分类。" };
  }
  if ((c.anyTenant.items.count ?? 0) === 0) {
    return {
      code: "no_rows_visible",
      hint: "匿名 key 看不到任何菜品：多半是 Orderlix 收紧了 RLS，不允许 anon 读取 menu_item / menu_category。",
    };
  }
  if ((c.tenant.items.count ?? 0) === 0) {
    return {
      code: "wrong_tenant",
      hint: "数据库里有菜品，但不属于当前 ORDERLIX_TENANT_ID：新店可能是新的 tenant，需更新 Vercel 环境变量。",
    };
  }
  return {
    code: "all_inactive",
    hint: "本 tenant 有数据，但分类全部停用或菜品全部不可售：在 Orderlix 后台检查 is_active / is_available。",
  };
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "invalid URL";
  }
}

function respond(body: unknown) {
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

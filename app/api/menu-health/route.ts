import { NextResponse, connection } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  return respond({ env, checks, diagnosis: diagnose(checks) });
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

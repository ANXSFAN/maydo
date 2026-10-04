// 客户端安全的类型和工具函数（不引入任何服务端模块）

export type MenuCategoryData = {
  id: string;
  name: Record<string, string>;
  imageUrl: string | null;
  sortOrder: number;
  station: string;
};

export type MenuItemData = {
  id: string;
  categoryId: string;
  name: Record<string, string>;
  description: Record<string, string> | null;
  price: number;
  imageUrl: string | null;
  allergens: string[];
  options: unknown;
};

export type SetMealCourseOption = {
  menuItemId: string;
  priceDelta?: number;
};

export type SetMealCourse = {
  courseNumber: number;
  label: Record<string, string>;
  categoryIds: string[];
  maxChoices: number;
  options?: SetMealCourseOption[];
};

export type SetMealData = {
  id: string;
  name: Record<string, string>;
  price: number;
  courses: SetMealCourse[];
  /** "HH:MM"，null 表示全天可用 */
  availableFrom: string | null;
  availableTo: string | null;
  sortOrder: number;
};

export type MenuData = {
  categories: MenuCategoryData[];
  items: MenuItemData[];
  setMeals: SetMealData[];
};

/** 从多语言对象中取当前 locale 的文本，回退到 es → en */
export function getLocalizedText(
  obj: Record<string, string> | null | undefined,
  locale: string
): string {
  if (!obj || typeof obj !== "object") return typeof obj === "string" ? obj : "";
  const pick = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v) : "");
  return pick(obj[locale]) || pick(obj.es) || pick(obj.en) || Object.values(obj).map(pick).find(Boolean) || "";
}

// ---- Orderlix 原始数据规整：POS 端格式不受控，任何一条脏数据都不能让整页 500 ----

/** 多语言字段 → { locale: string }；兼容纯字符串和 JSON 字符串 */
export function toLocalizedRecord(raw: unknown): Record<string, string> {
  if (typeof raw === "string") {
    const s = raw.trim();
    if (s.startsWith("{")) {
      try {
        return toLocalizedRecord(JSON.parse(s));
      } catch {
        // 不是合法 JSON，按普通文本处理
      }
    }
    return s ? { es: s } : {};
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string" || typeof v === "number") out[k] = String(v);
  }
  return out;
}

/** 过敏原 → string[]；兼容 "fish,soy"、JSON 字符串、{ code/name } 对象、null 元素 */
export function toStringList(raw: unknown): string[] {
  if (typeof raw === "string") {
    const s = raw.trim();
    if (s.startsWith("[")) {
      try {
        return toStringList(JSON.parse(s));
      } catch {
        // 不是合法 JSON，按逗号分隔处理
      }
    }
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (typeof x === "string") return x.trim();
      if (x && typeof x === "object") {
        const o = x as Record<string, unknown>;
        const v = o.code ?? o.key ?? o.name ?? o.id;
        return typeof v === "string" ? v.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
}

/** 兼容 orderlix 旧数据：course.categoryId: string → course.categoryIds: [id] */
export function normalizeSetMealCourses(raw: unknown): SetMealCourse[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => {
    const obj = c as Record<string, unknown>;
    const categoryIds = Array.isArray(obj.categoryIds)
      ? (obj.categoryIds as string[])
      : typeof obj.categoryId === "string"
        ? [obj.categoryId as string]
        : [];
    return {
      courseNumber: (obj.courseNumber as number) ?? 1,
      label: (obj.label as Record<string, string>) ?? {},
      categoryIds,
      maxChoices: (obj.maxChoices as number) ?? 1,
      options: obj.options as SetMealCourseOption[] | undefined,
    };
  });
}

/** 判断套餐在当前时刻是否可用（按本地时间，忽略时区） */
export function isSetMealAvailableAt(
  sm: Pick<SetMealData, "availableFrom" | "availableTo">,
  now: Date
): boolean {
  if (!sm.availableFrom || !sm.availableTo) return true;
  const [fh, fm] = sm.availableFrom.split(":").map(Number);
  const [th, tm] = sm.availableTo.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= fh * 60 + fm && nowMin <= th * 60 + tm;
}

/** 图片地址 → 去空白的绝对 http(s) 地址或站内路径，否则 null（走无图占位） */
export function toImageUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

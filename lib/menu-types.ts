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
  if (!obj) return "";
  return obj[locale] || obj.es || obj.en || Object.values(obj)[0] || "";
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

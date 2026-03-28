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

export type MenuData = {
  categories: MenuCategoryData[];
  items: MenuItemData[];
};

/** 从多语言对象中取当前 locale 的文本，回退到 es → en */
export function getLocalizedText(
  obj: Record<string, string> | null | undefined,
  locale: string
): string {
  if (!obj) return "";
  return obj[locale] || obj.es || obj.en || Object.values(obj)[0] || "";
}

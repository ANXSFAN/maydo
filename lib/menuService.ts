import { orderlix, TENANT_ID } from "./orderlix";
import type { MenuCategoryData, MenuItemData, MenuData, SetMealData } from "./menu-types";
import { normalizeSetMealCourses, toImageUrl, toLocalizedRecord, toStringList } from "./menu-types";

// Re-export types for server-side consumers
export type { MenuCategoryData, MenuItemData, MenuData, SetMealData };
export { getLocalizedText } from "./menu-types";

// ---- Data fetching (server-only) ----

export async function getMenuData(): Promise<MenuData> {
  const [catResult, itemResult, setMealResult] = await Promise.all([
    orderlix
      .from("menu_category")
      .select("id, name, image_url, sort_order, station")
      .eq("tenant_id", TENANT_ID)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    orderlix
      .from("menu_item")
      .select("id, category_id, name, description, price, image_url, allergens, options")
      .eq("tenant_id", TENANT_ID)
      .eq("is_available", true)
      .order("sort_order", { ascending: true }),
    orderlix
      .from("set_meal")
      .select("id, name, price, courses, available_from, available_to, sort_order")
      .eq("tenant_id", TENANT_ID)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (catResult.error) throw catResult.error;
  if (itemResult.error) throw itemResult.error;
  // set_meal 表可能不存在（旧 tenant）—— 忽略错误，按空处理
  if (setMealResult.error) {
    console.warn("[menuService] set_meal query failed, skipping:", setMealResult.error.message);
  }

  const categories: MenuCategoryData[] = (catResult.data ?? []).map(
    (c: Record<string, unknown>) => ({
      id: String(c.id),
      name: toLocalizedRecord(c.name),
      imageUrl: toImageUrl(c.image_url),
      sortOrder: Number(c.sort_order) || 0,
      station: typeof c.station === "string" ? c.station : "",
    })
  );

  const items: MenuItemData[] = (itemResult.data ?? []).map(
    (i: Record<string, unknown>) => {
      const description = toLocalizedRecord(i.description);
      const price = Number(i.price);
      return {
        id: String(i.id),
        categoryId: String(i.category_id),
        name: toLocalizedRecord(i.name),
        description: Object.keys(description).length > 0 ? description : null,
        price: Number.isFinite(price) ? price : 0,
        imageUrl: toImageUrl(i.image_url),
        allergens: toStringList(i.allergens),
        options: Array.isArray(i.options) ? i.options : null,
      };
    }
  );

  const setMeals: SetMealData[] = (setMealResult.data ?? []).map(
    (s: Record<string, unknown>) => ({
      id: s.id as string,
      name: s.name as Record<string, string>,
      price: Number(s.price),
      courses: normalizeSetMealCourses(s.courses),
      availableFrom: (s.available_from as string | null) ?? null,
      availableTo: (s.available_to as string | null) ?? null,
      sortOrder: (s.sort_order as number) ?? 0,
    })
  );

  return { categories, items, setMeals };
}

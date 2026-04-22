import { orderlix, TENANT_ID } from "./orderlix";
import type { MenuCategoryData, MenuItemData, MenuData, SetMealData } from "./menu-types";
import { normalizeSetMealCourses } from "./menu-types";

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
      id: c.id as string,
      name: c.name as Record<string, string>,
      imageUrl: c.image_url as string | null,
      sortOrder: c.sort_order as number,
      station: c.station as string,
    })
  );

  const items: MenuItemData[] = (itemResult.data ?? []).map(
    (i: Record<string, unknown>) => ({
      id: i.id as string,
      categoryId: i.category_id as string,
      name: i.name as Record<string, string>,
      description: i.description as Record<string, string> | null,
      price: Number(i.price),
      imageUrl: i.image_url as string | null,
      allergens: (i.allergens as string[]) ?? [],
      options: i.options,
    })
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

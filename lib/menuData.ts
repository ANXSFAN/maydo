import menuJson from "./realMenuData.json";

export type MenuItem = {
  name: string;
  desc: string;
  price: number;
  image: string;
};

export type MenuCategory = {
  section: "sushi" | "cocina";
  items: MenuItem[];
};

export type MenuData = Record<string, MenuCategory>;

export const MENU_DATA: MenuData = menuJson as MenuData;

export const CATEGORY_NAMES = Object.keys(MENU_DATA);

export const SUSHI_CATEGORIES = CATEGORY_NAMES.filter(
  (c) => MENU_DATA[c].section === "sushi"
);

export const COCINA_CATEGORIES = CATEGORY_NAMES.filter(
  (c) => MENU_DATA[c].section === "cocina"
);

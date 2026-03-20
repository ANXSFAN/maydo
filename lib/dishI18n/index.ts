import esData from "./es.json";
import enData from "./en.json";
import caData from "./ca.json";
import zhData from "./zh.json";

type DishTranslation = {
  name: string;
  desc: string;
};

type CategoryTranslation = {
  label: string;
  items: DishTranslation[];
};

type DishI18nData = Record<string, CategoryTranslation>;

const translations: Record<string, DishI18nData> = {
  es: esData,
  en: enData,
  ca: caData,
  zh: zhData,
};

export function getDishI18n(locale: string): DishI18nData {
  return translations[locale] || translations.es;
}

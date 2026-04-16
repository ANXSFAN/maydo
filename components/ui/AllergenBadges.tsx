"use client";

import { useTranslations } from "next-intl";

const ALLERGEN_CONFIG: Record<string, { icon: string; color: string }> = {
  gluten: { icon: "\uD83C\uDF3E", color: "bg-amber-50 text-amber-700 border-amber-200" },
  crustaceans: { icon: "\uD83E\uDD80", color: "bg-red-50 text-red-700 border-red-200" },
  eggs: { icon: "\uD83E\uDD5A", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  fish: { icon: "\uD83D\uDC1F", color: "bg-blue-50 text-blue-700 border-blue-200" },
  peanuts: { icon: "\uD83E\uDD5C", color: "bg-orange-50 text-orange-700 border-orange-200" },
  soy: { icon: "\uD83C\uDF31", color: "bg-green-50 text-green-700 border-green-200" },
  milk: { icon: "\uD83E\uDD5B", color: "bg-sky-50 text-sky-700 border-sky-200" },
  nuts: { icon: "\uD83C\uDF30", color: "bg-amber-50 text-amber-800 border-amber-200" },
  celery: { icon: "\uD83E\uDD66", color: "bg-lime-50 text-lime-700 border-lime-200" },
  mustard: { icon: "\uD83D\uDFE1", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  sesame: { icon: "\u2B55", color: "bg-stone-50 text-stone-700 border-stone-200" },
  sulphites: { icon: "\uD83E\uDDEA", color: "bg-purple-50 text-purple-700 border-purple-200" },
  lupin: { icon: "\uD83C\uDF3B", color: "bg-violet-50 text-violet-700 border-violet-200" },
  molluscs: { icon: "\uD83D\uDC1A", color: "bg-teal-50 text-teal-700 border-teal-200" },
  vegetarian: { icon: "\uD83E\uDD57", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  vegan: { icon: "\uD83C\uDF3F", color: "bg-green-50 text-green-700 border-green-200" },
  spicy: { icon: "\uD83C\uDF36\uFE0F", color: "bg-red-50 text-red-700 border-red-200" },
};

type Props = {
  allergens: string[];
  compact?: boolean;
};

export default function AllergenBadges({ allergens, compact = false }: Props) {
  const t = useTranslations("Allergens");

  if (!allergens || allergens.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${compact ? "mt-1" : "mt-1.5"}`}>
      {allergens.map((a) => {
        const key = a.toLowerCase().trim();
        const cfg = ALLERGEN_CONFIG[key];
        const icon = cfg?.icon ?? "\u26A0\uFE0F";
        const color = cfg?.color ?? "bg-gray-50 text-gray-600 border-gray-200";

        return (
          <span
            key={key}
            title={t.has(key) ? t(key) : key}
            className={`inline-flex items-center gap-0.5 border rounded-full font-body leading-none ${color} ${
              compact
                ? "text-[9px] px-1.5 py-0.5"
                : "text-[10px] px-2 py-[3px]"
            }`}
          >
            <span className={compact ? "text-[10px]" : "text-[11px]"}>{icon}</span>
            {!compact && (
              <span>{t.has(key) ? t(key) : key}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

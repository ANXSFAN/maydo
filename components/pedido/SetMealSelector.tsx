"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import type {
  SetMealData,
  SetMealCourse,
  MenuItemData,
} from "@/lib/menu-types";
import { getLocalizedText } from "@/lib/menu-types";

export type SetMealSelection = {
  courseNumber: number;
  menuItemId: string;
  name: Record<string, string>;
  priceDelta: number;
};

export type SetMealResult = {
  setMealId: string;
  setMealName: Record<string, string>;
  /** basePrice + Σ priceDelta —— 每份套餐的最终单价 */
  unitPrice: number;
  selections: SetMealSelection[];
};

type Props = {
  setMeal: SetMealData;
  items: MenuItemData[];
  onClose: () => void;
  onConfirm: (result: SetMealResult) => void;
};

const formatPrice = (p: number) => `${p.toFixed(2).replace(".", ",")}€`;

export default function SetMealSelector({
  setMeal,
  items,
  onClose,
  onConfirm,
}: Props) {
  const t = useTranslations("Pedido");
  const locale = useLocale();

  const [step, setStep] = useState<"courses" | "summary">("courses");
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  // courseNumber -> menuItemId[]
  const [selections, setSelections] = useState<Record<number, string[]>>({});

  const itemMap = useMemo(() => {
    const map: Record<string, MenuItemData> = {};
    for (const it of items) map[it.id] = it;
    return map;
  }, [items]);

  const currentCourse: SetMealCourse | undefined = setMeal.courses[currentCourseIndex];

  // 当前 course 可选菜品：options 白名单优先，否则按 categoryIds 过滤
  const courseItems: MenuItemData[] = useMemo(() => {
    if (!currentCourse) return [];
    if (currentCourse.options && currentCourse.options.length > 0) {
      const allowed = new Set(currentCourse.options.map((o) => o.menuItemId));
      return items.filter((it) => allowed.has(it.id));
    }
    const cats = new Set(currentCourse.categoryIds);
    return items.filter((it) => cats.has(it.categoryId));
  }, [currentCourse, items]);

  const toggleItem = (menuItemId: string) => {
    if (!currentCourse) return;
    const courseNum = currentCourse.courseNumber;
    const current = selections[courseNum] || [];
    if (current.includes(menuItemId)) {
      setSelections((prev) => ({
        ...prev,
        [courseNum]: current.filter((id) => id !== menuItemId),
      }));
    } else {
      if (current.length >= currentCourse.maxChoices) {
        // 超过上限就替换最后一个
        const updated = [
          ...current.slice(0, currentCourse.maxChoices - 1),
          menuItemId,
        ];
        setSelections((prev) => ({ ...prev, [courseNum]: updated }));
      } else {
        setSelections((prev) => ({
          ...prev,
          [courseNum]: [...current, menuItemId],
        }));
      }
    }
  };

  const currentSelections = currentCourse
    ? selections[currentCourse.courseNumber] || []
    : [];

  const canGoNext = currentCourse && currentSelections.length > 0;

  const handleNext = () => {
    if (currentCourseIndex < setMeal.courses.length - 1) {
      setCurrentCourseIndex(currentCourseIndex + 1);
    } else {
      setStep("summary");
    }
  };

  const handlePrev = () => {
    if (step === "summary") {
      setStep("courses");
      setCurrentCourseIndex(setMeal.courses.length - 1);
      return;
    }
    if (currentCourseIndex > 0) {
      setCurrentCourseIndex(currentCourseIndex - 1);
    } else {
      onClose();
    }
  };

  // 汇总加价
  const supplementSum = useMemo(() => {
    let sum = 0;
    for (const course of setMeal.courses) {
      const courseSel = selections[course.courseNumber] || [];
      for (const menuItemId of courseSel) {
        const opt = course.options?.find((o) => o.menuItemId === menuItemId);
        sum += opt?.priceDelta ?? 0;
      }
    }
    return sum;
  }, [setMeal.courses, selections]);

  const unitPrice = Number((setMeal.price + supplementSum).toFixed(2));

  const handleConfirm = () => {
    const resolved: SetMealSelection[] = [];
    for (const course of setMeal.courses) {
      const courseSel = selections[course.courseNumber] || [];
      for (const menuItemId of courseSel) {
        const opt = course.options?.find((o) => o.menuItemId === menuItemId);
        const priceDelta = opt?.priceDelta ?? 0;
        const mi = itemMap[menuItemId];
        resolved.push({
          courseNumber: course.courseNumber,
          menuItemId,
          name: mi?.name ?? { es: menuItemId },
          priceDelta,
        });
      }
    }
    onConfirm({
      setMealId: setMeal.id,
      setMealName: setMeal.name,
      unitPrice,
      selections: resolved,
    });
  };

  const setMealName = getLocalizedText(setMeal.name, locale);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-maroon-dark/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-lg bg-cream border border-beige max-h-[90vh] overflow-hidden flex flex-col rounded-t-2xl sm:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b border-beige px-5 py-4 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <p className="font-body text-[10px] tracking-[2px] uppercase text-camel mb-0.5">
              {t("setMealHeaderHint")}
            </p>
            <h3 className="font-light text-maroon text-[18px] truncate">
              {setMealName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-maroon text-2xl leading-none cursor-pointer bg-transparent border-none px-1"
            aria-label="close"
          >
            ×
          </button>
        </div>

        {/* Progress bar */}
        {step === "courses" && (
          <div className="px-5 pt-4">
            <div className="flex gap-1.5">
              {setMeal.courses.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 transition-colors ${
                    i <= currentCourseIndex ? "bg-camel" : "bg-beige"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "courses" && currentCourse && (
            <>
              <div className="mb-4">
                <h4 className="text-[15px] text-maroon font-medium">
                  {t("courseLabel", { n: currentCourse.courseNumber })}
                  {" · "}
                  <span className="font-light">
                    {getLocalizedText(currentCourse.label, locale)}
                  </span>
                </h4>
                <p className="font-body text-[12px] text-gray mt-1">
                  {currentCourse.maxChoices === 1
                    ? t("chooseOne")
                    : t("chooseUpTo", { count: currentCourse.maxChoices })}
                </p>
              </div>

              {courseItems.length === 0 ? (
                <p className="font-body text-[13px] text-gray text-center py-8">
                  {t("setMealNoItemsInCourse")}
                </p>
              ) : (
                <div className="space-y-2">
                  {courseItems.map((item) => {
                    const isSelected = currentSelections.includes(item.id);
                    const opt = currentCourse.options?.find(
                      (o) => o.menuItemId === item.id
                    );
                    const priceDelta = opt?.priceDelta ?? 0;
                    const itemName = getLocalizedText(item.name, locale);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border transition-colors cursor-pointer ${
                          isSelected
                            ? "border-camel bg-camel/5"
                            : "border-beige bg-white hover:border-camel"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? "border-camel" : "border-beige"
                          }`}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-camel" />
                          )}
                        </span>
                        {item.imageUrl && (
                          <div className="w-10 h-10 shrink-0 relative overflow-hidden bg-white">
                            <Image
                              src={item.imageUrl}
                              alt={itemName}
                              fill
                              className="object-contain"
                              sizes="40px"
                            />
                          </div>
                        )}
                        <span className="flex-1 min-w-0 text-[14px] text-maroon truncate">
                          {itemName}
                        </span>
                        {priceDelta !== 0 && (
                          <span className="font-body text-[12px] text-camel shrink-0">
                            {priceDelta > 0 ? "+" : ""}
                            {formatPrice(priceDelta)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === "summary" && (
            <>
              <h4 className="text-[15px] text-maroon font-medium mb-4">
                {t("setMealSummary")}
              </h4>

              <div className="bg-white border border-beige p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[15px] text-maroon">{setMealName}</span>
                  <span className="font-body text-[13px] text-gray">
                    {formatPrice(setMeal.price)}
                  </span>
                </div>

                <div className="space-y-3">
                  {setMeal.courses.map((course) => {
                    const courseSel = selections[course.courseNumber] || [];
                    return (
                      <div key={course.courseNumber}>
                        <p className="font-body text-[10px] tracking-[1.5px] uppercase text-camel mb-1.5">
                          {getLocalizedText(course.label, locale)}
                        </p>
                        <ul className="space-y-1">
                          {courseSel.map((itemId) => {
                            const item = itemMap[itemId];
                            const opt = course.options?.find(
                              (o) => o.menuItemId === itemId
                            );
                            const pd = opt?.priceDelta ?? 0;
                            return (
                              <li
                                key={itemId}
                                className="flex justify-between font-body text-[13px] text-ink"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-1 h-1 bg-camel rounded-full shrink-0" />
                                  {item
                                    ? getLocalizedText(item.name, locale)
                                    : itemId}
                                </span>
                                {pd !== 0 && (
                                  <span className="text-camel">
                                    {pd > 0 ? "+" : ""}
                                    {formatPrice(pd)}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-3 mt-3 border-t border-beige">
                  <span className="font-body text-[12px] text-gray uppercase tracking-[1.5px]">
                    {t("total")}
                  </span>
                  <span className="text-[18px] text-maroon font-light">
                    {formatPrice(unitPrice)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-cream border-t border-beige px-5 py-4 flex gap-2">
          <button
            onClick={handlePrev}
            className="px-4 py-3 border border-beige text-maroon font-body text-[12px] tracking-[2px] uppercase cursor-pointer hover:border-maroon transition-colors bg-transparent"
          >
            {step === "summary" || currentCourseIndex > 0
              ? t("setMealBack")
              : t("setMealCancel")}
          </button>
          {step === "courses" ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="flex-1 h-12 bg-maroon text-white font-body text-[12px] tracking-[2px] uppercase border-none cursor-pointer hover:bg-maroon-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {currentCourseIndex < setMeal.courses.length - 1
                ? t("setMealNextCourse")
                : t("setMealReviewSummary")}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="flex-1 h-12 bg-maroon text-white font-body text-[12px] tracking-[2px] uppercase border-none cursor-pointer hover:bg-maroon-dark transition-colors flex items-center justify-center gap-3"
            >
              <span>{t("add")}</span>
              <span className="opacity-60">—</span>
              <span>{formatPrice(unitPrice)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

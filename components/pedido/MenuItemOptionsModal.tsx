"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import type { MenuItemData } from "@/lib/menu-types";
import { getLocalizedText } from "@/lib/menu-types";

export type MenuItemOption = {
  name: Record<string, string>;
  choices: { label: Record<string, string>; priceModifier: number }[];
};

export type SelectedOption = {
  name: string;
  choice: string;
  priceModifier: number;
};

type Props = {
  item: MenuItemData;
  onClose: () => void;
  onConfirm: (selections: SelectedOption[]) => void;
};

const formatPrice = (p: number) => `${p.toFixed(2).replace(".", ",")}€`;

export default function MenuItemOptionsModal({ item, onClose, onConfirm }: Props) {
  const t = useTranslations("Pedido");
  const locale = useLocale();
  const options = ((item.options as MenuItemOption[] | null) ?? []) as MenuItemOption[];
  const [selections, setSelections] = useState<Record<number, number | undefined>>({});

  const selected = useMemo<SelectedOption[]>(() => {
    return options
      .map((opt, optIdx) => {
        const ci = selections[optIdx];
        if (ci === undefined) return null;
        const c = opt.choices[ci];
        if (!c) return null;
        return {
          name: getLocalizedText(opt.name, locale),
          choice: getLocalizedText(c.label, locale),
          priceModifier: c.priceModifier,
        };
      })
      .filter((x): x is SelectedOption => x !== null);
  }, [options, selections, locale]);

  const extra = selected.reduce((s, o) => s + o.priceModifier, 0);
  const total = item.price + extra;
  const itemName = getLocalizedText(item.name, locale);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full sm:max-w-md bg-cream border border-beige max-h-[85vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-cream border-b border-beige px-5 py-4 flex items-center justify-between">
          <h3 className="font-light text-maroon text-[18px] truncate pr-4">{itemName}</h3>
          <button
            onClick={onClose}
            className="text-maroon text-2xl leading-none cursor-pointer bg-transparent border-none px-1"
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {item.imageUrl && (
            <div className="relative w-full h-40 bg-white overflow-hidden">
              <Image src={item.imageUrl} alt={itemName} fill className="object-contain" sizes="400px" />
            </div>
          )}

          {options.map((opt, optIdx) => {
            const optName = getLocalizedText(opt.name, locale);
            return (
              <div key={optIdx} className="space-y-2">
                <label className="font-body text-[11px] uppercase tracking-[1px] text-maroon block">
                  {optName}
                </label>
                <div className="space-y-1.5">
                  {opt.choices.map((choice, choiceIdx) => {
                    const label = getLocalizedText(choice.label, locale);
                    const isSelected = selections[optIdx] === choiceIdx;
                    return (
                      <button
                        key={choiceIdx}
                        onClick={() =>
                          setSelections((s) => ({
                            ...s,
                            [optIdx]: isSelected ? undefined : choiceIdx,
                          }))
                        }
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[14px] border transition-colors cursor-pointer ${
                          isSelected
                            ? "border-camel bg-camel/5 text-maroon"
                            : "border-beige bg-white text-ink hover:border-camel"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-camel" : "border-beige"
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-camel" />}
                          </span>
                          {label}
                        </span>
                        {choice.priceModifier !== 0 && (
                          <span className="font-body text-[12px] text-camel">
                            {choice.priceModifier > 0 ? "+" : ""}
                            {formatPrice(choice.priceModifier)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-cream border-t border-beige p-4">
          <button
            onClick={() => onConfirm(selected)}
            className="w-full h-12 bg-maroon text-white font-body text-[12px] tracking-[2px] uppercase border-none cursor-pointer hover:bg-maroon-dark transition-colors flex items-center justify-center gap-3"
          >
            <span>{t("add")}</span>
            <span className="opacity-60">—</span>
            <span>{formatPrice(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

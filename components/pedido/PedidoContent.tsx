"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { getDishI18n } from "@/lib/dishI18n";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";
import {
  MENU_DATA,
  CATEGORY_NAMES,
  SUSHI_CATEGORIES,
  COCINA_CATEGORIES,
} from "@/lib/menuData";
import type { MenuItem } from "@/lib/menuData";

type Section = "all" | "sushi" | "cocina";

type CartItem = {
  categoryKey: string;
  itemIndex: number;
  quantity: number;
};

const PICKUP_SLOTS = [
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
];

export default function PedidoContent() {
  const t = useTranslations("Pedido");
  const locale = useLocale();
  const dishI18n = getDishI18n(locale);
  const [activeSection, setActiveSection] = useState<Section>("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const catNavRef = useRef<HTMLDivElement>(null);

  const visibleCategories =
    activeSection === "all"
      ? CATEGORY_NAMES
      : activeSection === "sushi"
        ? SUSHI_CATEGORIES
        : COCINA_CATEGORIES;

  const addToCart = (categoryKey: string, itemIndex: number) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.categoryKey === categoryKey && c.itemIndex === itemIndex
      );
      if (existing) {
        return prev.map((c) =>
          c.categoryKey === categoryKey && c.itemIndex === itemIndex
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { categoryKey, itemIndex, quantity: 1 }];
    });
  };

  const updateQuantity = (
    categoryKey: string,
    itemIndex: number,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.categoryKey === categoryKey && c.itemIndex === itemIndex
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const getItem = (cartItem: CartItem): MenuItem | null =>
    MENU_DATA[cartItem.categoryKey]?.items[cartItem.itemIndex] ?? null;

  const getItemName = (categoryKey: string, itemIndex: number, fallback: string) =>
    dishI18n[categoryKey]?.items[itemIndex]?.name || fallback;

  const cartTotal = cart.reduce((sum, c) => {
    const item = getItem(c);
    return sum + (item?.price ?? 0) * c.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const formatPrice = (price: number) =>
    `${price.toFixed(2).replace(".", ",")}€`;

  const getCartQuantity = (categoryKey: string, itemIndex: number) =>
    cart.find(
      (c) => c.categoryKey === categoryKey && c.itemIndex === itemIndex
    )?.quantity ?? 0;

  // Scroll active category button into view in the horizontal nav
  useEffect(() => {
    if (activeCategory && catNavRef.current) {
      const btn = catNavRef.current.querySelector(`[data-cat="${activeCategory}"]`);
      btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategory]);

  return (
    <>
      {/* Sticky top nav for mobile: section tabs + category dropdown */}
      <div className="lg:hidden sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-beige/50">
        <div className="flex">
          {/* Section tabs */}
          {(["all", "sushi", "cocina"] as Section[]).map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setActiveSection(sec);
                setActiveCategory(null);
                setShowCatMenu(false);
              }}
              className={`
                flex-1 py-3.5 text-[12px] tracking-[2px] uppercase font-body font-light transition-all duration-200 cursor-pointer border-none
                ${
                  activeSection === sec
                    ? "bg-maroon text-white"
                    : "bg-transparent text-maroon active:bg-beige/50"
                }
              `}
            >
              {t(sec)}
            </button>
          ))}
          {/* Category dropdown trigger */}
          <button
            onClick={() => setShowCatMenu(!showCatMenu)}
            className="px-4 flex items-center gap-1.5 border-none bg-transparent text-maroon cursor-pointer active:bg-beige/30"
          >
            <span className="font-body text-[11px] tracking-[1px] uppercase">
              {(activeCategory && dishI18n[activeCategory]?.label) || t("catLabel")}
            </span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              className={`transition-transform duration-200 ${showCatMenu ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>
        </div>

        {/* Category dropdown menu */}
        <AnimatePresence>
          {showCatMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-beige/30"
            >
              <div className="max-h-[50vh] overflow-y-auto bg-white">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setShowCatMenu(false);
                      document
                        .getElementById(`cat-${cat}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`
                      w-full text-left px-5 py-3.5 font-body text-[14px] border-none cursor-pointer transition-colors flex items-center justify-between
                      ${
                        activeCategory === cat
                          ? "bg-camel/10 text-maroon font-medium"
                          : "bg-transparent text-ink/70 active:bg-beige/30"
                      }
                    `}
                  >
                    <span>{dishI18n[cat]?.label || cat}</span>
                    <span className="text-[12px] text-gray font-light">
                      {MENU_DATA[cat].items.length}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="py-[clamp(20px,8vw,100px)] px-[clamp(12px,4vw,40px)] bg-cream">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex gap-10 max-lg:flex-col">
            {/* Menu items */}
            <div className="flex-1 min-w-0">
              {/* Desktop-only section tabs (mobile ones are in sticky header) */}
              <FadeIn className="hidden lg:block">
                <div className="flex gap-3 mb-5">
                  {(["all", "sushi", "cocina"] as Section[]).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setActiveSection(sec);
                        setActiveCategory(null);
                      }}
                      className={`
                        px-5 py-2.5 text-[12px] tracking-[2px] uppercase font-body font-light border transition-all duration-300 cursor-pointer
                        ${
                          activeSection === sec
                            ? "bg-maroon text-white border-maroon"
                            : "bg-transparent text-maroon border-beige hover:border-maroon"
                        }
                      `}
                    >
                      {t(sec)}
                    </button>
                  ))}
                </div>
              </FadeIn>

              {/* Desktop-only category nav */}
              <div className="hidden lg:flex flex-wrap gap-2 mb-8">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(activeCategory === cat ? null : cat);
                      document
                        .getElementById(`cat-${cat}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`
                      px-3 py-1.5 text-[11px] tracking-[1px] font-body font-light border transition-all duration-200 cursor-pointer whitespace-nowrap
                      ${
                        activeCategory === cat
                          ? "bg-camel text-white border-camel"
                          : "bg-white text-gray border-beige hover:border-camel hover:text-camel"
                      }
                    `}
                  >
                    {dishI18n[cat]?.label || cat}
                  </button>
                ))}
              </div>

              {/* Category sections with items */}
              <div className="space-y-8 sm:space-y-10">
                {visibleCategories.map((catKey) => {
                  const category = MENU_DATA[catKey];
                  return (
                    <div key={catKey} id={`cat-${catKey}`} className="scroll-mt-[120px] lg:scroll-mt-24">
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                        <h3 className="text-[18px] sm:text-[22px] font-light text-maroon whitespace-nowrap">
                          {dishI18n[catKey]?.label || catKey}
                        </h3>
                        <div className="flex-1 h-px bg-beige" />
                        <span className="font-body text-[10px] sm:text-[11px] text-gray tracking-[1px]">
                          {category.items.length} {t("items")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                        {category.items.map((item, idx) => {
                          const qty = getCartQuantity(catKey, idx);
                          return (
                            <div
                              key={idx}
                              className="group bg-white border border-beige transition-all duration-300 hover:shadow-[0_8px_30px_rgba(122,66,66,0.1)] overflow-hidden flex flex-col"
                            >
                              {/* Image */}
                              {item.image ? (
                                <div className="relative aspect-square overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-square bg-beige/30 flex items-center justify-center">
                                  <span className="text-gray/30 text-4xl font-cjk">鮨</span>
                                </div>
                              )}

                              {/* Info */}
                              <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                                <h4 className="text-[20px] sm:text-[15px] font-medium sm:font-normal text-maroon leading-snug">
                                  {dishI18n[catKey]?.items[idx]?.name || item.name}
                                </h4>
                                {(dishI18n[catKey]?.items[idx]?.desc || item.desc) && (
                                  <p className="font-body text-[16px] sm:text-[12px] text-ink/60 mt-1 leading-relaxed line-clamp-2">
                                    {dishI18n[catKey]?.items[idx]?.desc || item.desc}
                                  </p>
                                )}
                                <div className="mt-auto pt-3">
                                  <span className="text-[24px] sm:text-[16px] font-light text-camel block mb-2.5 sm:mb-3">
                                    {formatPrice(item.price)}
                                  </span>
                                  {/* Add / Qty controls - always visible, full width on mobile */}
                                  {qty > 0 ? (
                                    <div className="flex items-center justify-between border border-beige">
                                      <button
                                        onClick={() => updateQuantity(catKey, idx, -1)}
                                        className="w-10 h-10 sm:w-8 sm:h-8 text-maroon font-body text-base sm:text-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-beige/50 bg-transparent border-none"
                                      >
                                        −
                                      </button>
                                      <span className="font-body text-[15px] sm:text-[14px] text-maroon font-medium">
                                        {qty}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(catKey, idx, 1)}
                                        className="w-10 h-10 sm:w-8 sm:h-8 text-maroon font-body text-base sm:text-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-beige/50 bg-transparent border-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => addToCart(catKey, idx)}
                                      className="w-full h-10 sm:h-9 bg-maroon text-white font-body text-[12px] sm:text-[11px] tracking-[2px] uppercase border-none cursor-pointer transition-all duration-300 hover:bg-maroon-dark active:scale-[0.97] flex items-center justify-center gap-2"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M8 3v10M3 8h10" />
                                      </svg>
                                      {t("add")}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop cart sidebar - hidden on mobile */}
            <div className="w-[340px] shrink-0 max-lg:hidden">
              <div className="sticky top-[100px]">
                <div className="bg-white border border-beige">
                  <div className="p-6 pb-4 border-b border-beige">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[20px] font-light text-maroon">
                        {t("cart")}
                      </h3>
                      {cartCount > 0 && (
                        <span className="bg-maroon text-white font-body text-[11px] w-6 h-6 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 max-h-[400px] overflow-y-auto">
                    {cart.length === 0 ? (
                      <p className="font-body text-sm text-gray text-center py-8 font-light">
                        {t("emptyCart")}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((cartItem) => {
                          const item = getItem(cartItem);
                          if (!item) return null;
                          return (
                            <div
                              key={`${cartItem.categoryKey}-${cartItem.itemIndex}`}
                              className="flex items-center gap-3"
                            >
                              {item.image && (
                                <div className="w-10 h-10 shrink-0 relative overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-[14px] text-maroon font-light truncate">
                                  {getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)}
                                </div>
                                <div className="font-body text-[12px] text-gray">
                                  {formatPrice(item.price)} × {cartItem.quantity}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(cartItem.categoryKey, cartItem.itemIndex, -1)
                                  }
                                  className="w-7 h-7 border border-beige text-maroon font-body text-xs flex items-center justify-center cursor-pointer hover:border-maroon bg-transparent"
                                >
                                  −
                                </button>
                                <span className="font-body text-[13px] text-maroon w-4 text-center">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(cartItem.categoryKey, cartItem.itemIndex, 1)
                                  }
                                  className="w-7 h-7 border border-beige text-maroon font-body text-xs flex items-center justify-center cursor-pointer hover:border-maroon bg-transparent"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-[14px] text-maroon font-light w-16 text-right">
                                {formatPrice(item.price * cartItem.quantity)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-6 pt-4 border-t border-beige">
                      <div className="flex justify-between items-baseline mb-5">
                        <span className="font-body text-[13px] text-gray uppercase tracking-[2px]">
                          {t("total")}
                        </span>
                        <span className="text-[28px] font-light text-maroon">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowCheckout(true)}
                        className="w-full px-8 py-[16px] bg-maroon text-white border-none font-heading text-[15px] tracking-[3px] uppercase cursor-pointer transition-all duration-300 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)]"
                      >
                        {t("checkout")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile floating cart bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-beige shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Expand cart */}
              <button
                onClick={() => setShowMobileCart(!showMobileCart)}
                className="flex items-center gap-3 flex-1 min-w-0 bg-transparent border-none cursor-pointer p-0 text-left"
              >
                <div className="relative">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-maroon">
                    <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="absolute -top-1.5 -right-1.5 bg-maroon text-white font-body text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-body text-gray font-light truncate">
                    {cart.length} {t("items")}
                  </div>
                </div>
                <span className="text-[20px] font-light text-maroon">
                  {formatPrice(cartTotal)}
                </span>
              </button>
              {/* Checkout button */}
              <button
                onClick={() => setShowCheckout(true)}
                className="px-5 py-3 bg-maroon text-white border-none font-body text-[12px] tracking-[2px] uppercase cursor-pointer shrink-0 active:scale-95 transition-transform"
              >
                {t("checkout")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile cart drawer */}
      <AnimatePresence>
        {showMobileCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
          >
            <div
              className="absolute inset-0 bg-maroon-dark/50 backdrop-blur-sm"
              onClick={() => setShowMobileCart(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-cream border-t border-beige max-h-[70vh] overflow-y-auto rounded-t-2xl"
            >
              <div className="p-5">
                {/* Drag handle */}
                <div className="w-10 h-1 bg-beige rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] font-light text-maroon">
                    {t("cart")}
                  </h3>
                  <button
                    onClick={() => setShowMobileCart(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray hover:text-maroon cursor-pointer bg-transparent border-none text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((cartItem) => {
                    const item = getItem(cartItem);
                    if (!item) return null;
                    return (
                      <div
                        key={`m-${cartItem.categoryKey}-${cartItem.itemIndex}`}
                        className="flex items-center gap-3 bg-white border border-beige p-3"
                      >
                        {item.image && (
                          <div className="w-12 h-12 shrink-0 relative overflow-hidden">
                            <Image
                              src={item.image}
                              alt={getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] text-maroon font-light truncate">
                            {getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)}
                          </div>
                          <div className="font-body text-[12px] text-camel">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(cartItem.categoryKey, cartItem.itemIndex, -1)}
                            className="w-7 h-7 border border-beige text-maroon font-body text-sm flex items-center justify-center cursor-pointer bg-transparent"
                          >
                            −
                          </button>
                          <span className="font-body text-[14px] text-maroon w-4 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItem.categoryKey, cartItem.itemIndex, 1)}
                            className="w-7 h-7 border border-beige text-maroon font-body text-sm flex items-center justify-center cursor-pointer bg-transparent"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-[14px] text-maroon font-light w-14 text-right">
                          {formatPrice(item.price * cartItem.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-baseline mt-5 pt-4 border-t border-beige">
                  <span className="font-body text-[13px] text-gray uppercase tracking-[2px]">
                    {t("total")}
                  </span>
                  <span className="text-[26px] font-light text-maroon">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowMobileCart(false);
                    setShowCheckout(true);
                  }}
                  className="w-full mt-4 px-8 py-4 bg-maroon text-white border-none font-heading text-[14px] tracking-[3px] uppercase cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {t("checkout")}
                </button>
              </div>
              {/* Extra padding for safe area */}
              <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
          >
            <div
              className="absolute inset-0 bg-maroon-dark/60 backdrop-blur-sm"
              onClick={() => setShowCheckout(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="relative bg-cream border border-beige w-full sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-none"
            >
              <div className="p-5 sm:p-[clamp(24px,4vw,40px)]">
                {/* Drag handle on mobile */}
                <div className="w-10 h-1 bg-beige rounded-full mx-auto mb-4 sm:hidden" />

                <button
                  onClick={() => setShowCheckout(false)}
                  className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-gray hover:text-maroon transition-colors cursor-pointer bg-transparent border-none text-xl"
                >
                  ×
                </button>

                <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-2">
                  {t("checkoutSub")}
                </p>
                <h3 className="text-[24px] sm:text-[28px] font-light text-maroon mb-2">
                  {t("checkoutTitle")}
                </h3>
                <DiamondDivider />

                <div className="my-5 sm:my-6 p-3 sm:p-4 bg-white border border-beige">
                  {cart.map((cartItem) => {
                    const item = getItem(cartItem);
                    if (!item) return null;
                    return (
                      <div
                        key={`co-${cartItem.categoryKey}-${cartItem.itemIndex}`}
                        className="flex justify-between py-1.5 font-body text-[13px] text-gray font-light"
                      >
                        <span className="truncate mr-2">
                          {getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)} × {cartItem.quantity}
                        </span>
                        <span className="text-maroon shrink-0">
                          {formatPrice(item.price * cartItem.quantity)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between pt-3 mt-3 border-t border-beige">
                    <span className="font-body text-[13px] text-gray uppercase tracking-[2px]">
                      {t("total")}
                    </span>
                    <span className="text-[22px] font-light text-maroon">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>

                <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-3">
                  {t("pickupTime")}
                </label>
                <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 mb-6">
                  {PICKUP_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      className="px-3 sm:px-4 py-2 border border-beige text-[12px] sm:text-[13px] font-body text-maroon cursor-pointer transition-all hover:border-maroon focus:bg-maroon focus:text-white focus:border-maroon bg-transparent"
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <div className="space-y-0">
                  <input
                    className="w-full py-3.5 sm:py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray"
                    placeholder={t("name")}
                  />
                  <input
                    type="tel"
                    className="w-full py-3.5 sm:py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray"
                    placeholder={t("phone")}
                  />
                  <input
                    type="email"
                    className="w-full py-3.5 sm:py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray"
                    placeholder={t("email")}
                  />
                  <textarea
                    rows={2}
                    className="w-full py-3.5 sm:py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray resize-none"
                    placeholder={t("orderNotes")}
                  />
                </div>

                <button className="w-full mt-6 sm:mt-8 px-12 py-4 sm:py-[18px] bg-maroon text-white border-none font-heading text-[14px] sm:text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark active:scale-[0.98]">
                  {t("placeOrder")}
                </button>
                <p className="font-body text-xs text-gray text-center mt-3 font-light">
                  {t("orderNote")}
                </p>
              </div>
              {/* Safe area bottom padding */}
              <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer for mobile floating bar */}
      {cartCount > 0 && <div className="lg:hidden h-[68px]" />}
    </>
  );
}

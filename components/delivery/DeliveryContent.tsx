"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

type OrderStatus = "idle" | "loading" | "success" | "error";

const DELIVERY_CART_KEY = "sushi-maydo-delivery-cart";
const MIN_ORDER = 40;
const DELIVERY_FEE = 3.5;

export default function DeliveryContent() {
  const t = useTranslations("Delivery");
  const tPedido = useTranslations("Pedido");
  const locale = useLocale();
  const dishI18n = getDishI18n(locale);
  const [activeSection, setActiveSection] = useState<Section>("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const catNavRef = useRef<HTMLDivElement>(null);

  // Checkout form state
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("L'Hospitalet de Llobregat");
  const [postcode, setPostcode] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, boolean>>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DELIVERY_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_CART_KEY, JSON.stringify(cart));
    } catch { /* ignore */ }
  }, [cart]);

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

  const updateQuantity = (categoryKey: string, itemIndex: number, delta: number) => {
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

  const getItem = useCallback(
    (cartItem: CartItem): MenuItem | null =>
      MENU_DATA[cartItem.categoryKey]?.items[cartItem.itemIndex] ?? null,
    []
  );

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

  const meetsMinOrder = cartTotal >= MIN_ORDER;
  const grandTotal = Math.max(0, cartTotal - couponDiscount) + (meetsMinOrder ? DELIVERY_FEE : 0);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus("loading");
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), order_total: cartTotal }),
      });
      const data = await res.json();

      if (data.valid) {
        setCouponDiscount(data.discount_amount);
        setCouponStatus("valid");
      } else {
        setCouponDiscount(0);
        setCouponStatus("invalid");
        if (data.error === "min_order_not_met") {
          setCouponError(t("couponMinOrder", { amount: formatPrice(data.min_order) }));
        } else {
          setCouponError(t("couponInvalid"));
        }
      }
    } catch {
      setCouponStatus("invalid");
      setCouponError(t("couponInvalid"));
    }
  };

  useEffect(() => {
    if (activeCategory && catNavRef.current) {
      const btn = catNavRef.current.querySelector(`[data-cat="${activeCategory}"]`);
      btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategory]);

  const validateCheckout = () => {
    const errs: Record<string, boolean> = {};
    if (!checkoutName.trim()) errs.name = true;
    if (!checkoutPhone.trim()) errs.phone = true;
    if (!checkoutEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutEmail))
      errs.email = true;
    if (!street.trim()) errs.street = true;
    if (!number.trim()) errs.number = true;
    if (!postcode.trim()) errs.postcode = true;
    setCheckoutErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!meetsMinOrder || !validateCheckout()) return;
    setOrderStatus("loading");

    try {
      const orderItems = cart.map((c) => {
        const item = getItem(c);
        return {
          categoryKey: c.categoryKey,
          itemIndex: c.itemIndex,
          quantity: c.quantity,
          name: getItemName(c.categoryKey, c.itemIndex, item?.name ?? ""),
          price: item?.price ?? 0,
        };
      });

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: checkoutName.trim(),
          phone: checkoutPhone.trim(),
          email: checkoutEmail.trim(),
          notes: checkoutNotes.trim() || null,
          items: orderItems,
          total: grandTotal,
          order_type: "delivery",
          delivery_address: {
            street: street.trim(),
            number: number.trim(),
            city: city.trim(),
            postcode: postcode.trim(),
          },
          delivery_fee: DELIVERY_FEE,
          discount_code: couponStatus === "valid" ? couponCode.trim() : null,
          discount_amount: couponDiscount,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setOrderNumber(data.order_number);
      setOrderStatus("success");
      setCart([]);
      localStorage.removeItem(DELIVERY_CART_KEY);
    } catch {
      setOrderStatus("error");
    }
  };

  const resetCheckout = () => {
    setShowCheckout(false);
    setOrderStatus("idle");
    setOrderNumber(null);
    setCheckoutName("");
    setCheckoutPhone("");
    setCheckoutEmail("");
    setCheckoutNotes("");
    setStreet("");
    setNumber("");
    setPostcode("");
    setCheckoutErrors({});
    setCouponCode("");
    setCouponStatus("idle");
    setCouponDiscount(0);
    setCouponError("");
  };

  return (
    <>
      {/* Info banner */}
      <div className="bg-maroon text-white py-4 px-6 text-center">
        <p className="font-body text-[13px] font-light tracking-wide">
          {t("minOrderNotice", { amount: MIN_ORDER })} · {t("deliveryFeeNotice", { fee: formatPrice(DELIVERY_FEE) })}
        </p>
      </div>

      {/* Sticky top nav for mobile */}
      <div className="lg:hidden sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-beige/50">
        <div className="flex">
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
                ${activeSection === sec ? "bg-maroon text-white" : "bg-transparent text-maroon active:bg-beige/50"}
              `}
            >
              {tPedido(sec)}
            </button>
          ))}
          <button
            onClick={() => setShowCatMenu(!showCatMenu)}
            className="px-4 flex items-center gap-1.5 border-none bg-transparent text-maroon cursor-pointer active:bg-beige/30"
          >
            <span className="font-body text-[11px] tracking-[1px] uppercase">
              {(activeCategory && dishI18n[activeCategory]?.label) || tPedido("catLabel")}
            </span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              className={`transition-transform duration-200 ${showCatMenu ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>
        </div>

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
                      document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`w-full text-left px-5 py-3.5 font-body text-[14px] border-none cursor-pointer transition-colors flex items-center justify-between ${
                      activeCategory === cat ? "bg-camel/10 text-maroon font-medium" : "bg-transparent text-ink/70 active:bg-beige/30"
                    }`}
                  >
                    <span>{dishI18n[cat]?.label || cat}</span>
                    <span className="text-[12px] text-gray font-light">{MENU_DATA[cat].items.length}</span>
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
              <FadeIn className="hidden lg:block">
                <div className="flex gap-3 mb-5">
                  {(["all", "sushi", "cocina"] as Section[]).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => { setActiveSection(sec); setActiveCategory(null); }}
                      className={`px-5 py-2.5 text-[12px] tracking-[2px] uppercase font-body font-light border transition-all duration-300 cursor-pointer ${
                        activeSection === sec
                          ? "bg-maroon text-white border-maroon"
                          : "bg-transparent text-maroon border-beige hover:border-maroon"
                      }`}
                    >
                      {tPedido(sec)}
                    </button>
                  ))}
                </div>
              </FadeIn>

              <div className="hidden lg:flex flex-wrap gap-2 mb-8">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(activeCategory === cat ? null : cat);
                      document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`px-3 py-1.5 text-[11px] tracking-[1px] font-body font-light border transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-camel text-white border-camel"
                        : "bg-white text-gray border-beige hover:border-camel hover:text-camel"
                    }`}
                  >
                    {dishI18n[cat]?.label || cat}
                  </button>
                ))}
              </div>

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
                          {category.items.length} {tPedido("items")}
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
                              {item.image ? (
                                <div className="relative aspect-square overflow-hidden">
                                  <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" />
                                </div>
                              ) : (
                                <div className="aspect-square bg-beige/30 flex items-center justify-center">
                                  <span className="text-gray/30 text-4xl font-cjk">鮨</span>
                                </div>
                              )}
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
                                  {qty > 0 ? (
                                    <div className="flex items-center justify-between border border-beige">
                                      <button onClick={() => updateQuantity(catKey, idx, -1)} className="w-10 h-10 sm:w-8 sm:h-8 text-maroon font-body text-base sm:text-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-beige/50 bg-transparent border-none">−</button>
                                      <span className="font-body text-[15px] sm:text-[14px] text-maroon font-medium">{qty}</span>
                                      <button onClick={() => updateQuantity(catKey, idx, 1)} className="w-10 h-10 sm:w-8 sm:h-8 text-maroon font-body text-base sm:text-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-beige/50 bg-transparent border-none">+</button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => addToCart(catKey, idx)}
                                      className="w-full h-10 sm:h-9 bg-maroon text-white font-body text-[12px] sm:text-[11px] tracking-[2px] uppercase border-none cursor-pointer transition-all duration-300 hover:bg-maroon-dark active:scale-[0.97] flex items-center justify-center gap-2"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                                      {tPedido("add")}
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

            {/* Desktop cart sidebar */}
            <div className="w-[340px] shrink-0 max-lg:hidden">
              <div className="sticky top-[100px]">
                <div className="bg-white border border-beige">
                  <div className="p-6 pb-4 border-b border-beige">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[20px] font-light text-maroon">{t("cart")}</h3>
                      {cartCount > 0 && (
                        <span className="bg-maroon text-white font-body text-[11px] w-6 h-6 flex items-center justify-center">{cartCount}</span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 max-h-[350px] overflow-y-auto">
                    {cart.length === 0 ? (
                      <p className="font-body text-sm text-gray text-center py-8 font-light">{tPedido("emptyCart")}</p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((cartItem) => {
                          const item = getItem(cartItem);
                          if (!item) return null;
                          return (
                            <div key={`${cartItem.categoryKey}-${cartItem.itemIndex}`} className="flex items-center gap-3">
                              {item.image && (
                                <div className="w-10 h-10 shrink-0 relative overflow-hidden">
                                  <Image src={item.image} alt={getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)} fill className="object-cover" sizes="40px" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-[14px] text-maroon font-light truncate">{getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)}</div>
                                <div className="font-body text-[12px] text-gray">{formatPrice(item.price)} × {cartItem.quantity}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(cartItem.categoryKey, cartItem.itemIndex, -1)} className="w-7 h-7 border border-beige text-maroon font-body text-xs flex items-center justify-center cursor-pointer hover:border-maroon bg-transparent">−</button>
                                <span className="font-body text-[13px] text-maroon w-4 text-center">{cartItem.quantity}</span>
                                <button onClick={() => updateQuantity(cartItem.categoryKey, cartItem.itemIndex, 1)} className="w-7 h-7 border border-beige text-maroon font-body text-xs flex items-center justify-center cursor-pointer hover:border-maroon bg-transparent">+</button>
                              </div>
                              <div className="text-[14px] text-maroon font-light w-16 text-right">{formatPrice(item.price * cartItem.quantity)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-6 pt-4 border-t border-beige">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="font-body text-[12px] text-gray">{t("subtotal")}</span>
                        <span className="text-[16px] font-light text-maroon">{formatPrice(cartTotal)}</span>
                      </div>
                      {meetsMinOrder && (
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="font-body text-[12px] text-gray">{t("deliveryFee")}</span>
                          <span className="text-[16px] font-light text-maroon">{formatPrice(DELIVERY_FEE)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline mb-4 pt-2 border-t border-beige">
                        <span className="font-body text-[13px] text-gray uppercase tracking-[2px]">{tPedido("total")}</span>
                        <span className="text-[28px] font-light text-maroon">{formatPrice(grandTotal)}</span>
                      </div>
                      {!meetsMinOrder && (
                        <p className="font-body text-[12px] text-red-500 text-center mb-3">
                          {t("minOrderWarning", { amount: formatPrice(MIN_ORDER), remaining: formatPrice(MIN_ORDER - cartTotal) })}
                        </p>
                      )}
                      <button
                        onClick={() => meetsMinOrder && setShowCheckout(true)}
                        disabled={!meetsMinOrder}
                        className="w-full px-8 py-[16px] bg-maroon text-white border-none font-heading text-[15px] tracking-[3px] uppercase cursor-pointer transition-all duration-300 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {t("orderDelivery")}
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
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-beige shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setShowMobileCart(!showMobileCart)} className="flex items-center gap-3 flex-1 min-w-0 bg-transparent border-none cursor-pointer p-0 text-left">
                <div className="relative">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-maroon">
                    <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="absolute -top-1.5 -right-1.5 bg-maroon text-white font-body text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-full">{cartCount}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-body text-gray font-light truncate">{cart.length} {tPedido("items")}</div>
                </div>
                <span className="text-[20px] font-light text-maroon">{formatPrice(grandTotal)}</span>
              </button>
              <button
                onClick={() => meetsMinOrder && setShowCheckout(true)}
                disabled={!meetsMinOrder}
                className="px-5 py-3 bg-maroon text-white border-none font-body text-[12px] tracking-[2px] uppercase cursor-pointer shrink-0 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("orderDelivery")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile cart drawer */}
      <AnimatePresence>
        {showMobileCart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-maroon-dark/50 backdrop-blur-sm" onClick={() => setShowMobileCart(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-cream border-t border-beige max-h-[70vh] overflow-y-auto rounded-t-2xl"
            >
              <div className="p-5">
                <div className="w-10 h-1 bg-beige rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] font-light text-maroon">{t("cart")}</h3>
                  <button onClick={() => setShowMobileCart(false)} className="w-8 h-8 flex items-center justify-center text-gray hover:text-maroon cursor-pointer bg-transparent border-none text-xl">×</button>
                </div>
                <div className="space-y-3">
                  {cart.map((cartItem) => {
                    const item = getItem(cartItem);
                    if (!item) return null;
                    return (
                      <div key={`m-${cartItem.categoryKey}-${cartItem.itemIndex}`} className="flex items-center gap-3 bg-white border border-beige p-3">
                        {item.image && <div className="w-12 h-12 shrink-0 relative overflow-hidden"><Image src={item.image} alt={getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)} fill className="object-cover" sizes="48px" /></div>}
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] text-maroon font-light truncate">{getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)}</div>
                          <div className="font-body text-[12px] text-camel">{formatPrice(item.price)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(cartItem.categoryKey, cartItem.itemIndex, -1)} className="w-7 h-7 border border-beige text-maroon font-body text-sm flex items-center justify-center cursor-pointer bg-transparent">−</button>
                          <span className="font-body text-[14px] text-maroon w-4 text-center">{cartItem.quantity}</span>
                          <button onClick={() => updateQuantity(cartItem.categoryKey, cartItem.itemIndex, 1)} className="w-7 h-7 border border-beige text-maroon font-body text-sm flex items-center justify-center cursor-pointer bg-transparent">+</button>
                        </div>
                        <div className="text-[14px] text-maroon font-light w-14 text-right">{formatPrice(item.price * cartItem.quantity)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 pt-4 border-t border-beige space-y-1">
                  <div className="flex justify-between"><span className="font-body text-[12px] text-gray">{t("subtotal")}</span><span className="text-[16px] font-light text-maroon">{formatPrice(cartTotal)}</span></div>
                  {meetsMinOrder && <div className="flex justify-between"><span className="font-body text-[12px] text-gray">{t("deliveryFee")}</span><span className="text-[16px] font-light text-maroon">{formatPrice(DELIVERY_FEE)}</span></div>}
                  <div className="flex justify-between items-baseline pt-2 border-t border-beige"><span className="font-body text-[13px] text-gray uppercase tracking-[2px]">{tPedido("total")}</span><span className="text-[26px] font-light text-maroon">{formatPrice(grandTotal)}</span></div>
                </div>
                {!meetsMinOrder && <p className="font-body text-[12px] text-red-500 text-center mt-3">{t("minOrderWarning", { amount: formatPrice(MIN_ORDER), remaining: formatPrice(MIN_ORDER - cartTotal) })}</p>}
                <button
                  onClick={() => { if (meetsMinOrder) { setShowMobileCart(false); setShowCheckout(true); } }}
                  disabled={!meetsMinOrder}
                  className="w-full mt-4 px-8 py-4 bg-maroon text-white border-none font-heading text-[14px] tracking-[3px] uppercase cursor-pointer active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("orderDelivery")}
                </button>
              </div>
              <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
            <div className="absolute inset-0 bg-maroon-dark/60 backdrop-blur-sm" onClick={() => orderStatus !== "loading" && resetCheckout()} />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="relative bg-cream border border-beige w-full sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-none"
            >
              <div className="p-5 sm:p-[clamp(24px,4vw,40px)]">
                <div className="w-10 h-1 bg-beige rounded-full mx-auto mb-4 sm:hidden" />
                {orderStatus !== "loading" && (
                  <button onClick={resetCheckout} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-gray hover:text-maroon transition-colors cursor-pointer bg-transparent border-none text-xl">×</button>
                )}

                {orderStatus === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </div>
                    <h3 className="text-[24px] font-light text-maroon mb-2">{t("orderSuccessTitle")}</h3>
                    {orderNumber && (
                      <div className="mb-4">
                        <span className="font-body text-[11px] tracking-[3px] uppercase text-camel">{t("orderNumberLabel")}</span>
                        <div className="text-[36px] font-light text-maroon">#{orderNumber}</div>
                      </div>
                    )}
                    <p className="font-body text-[14px] text-gray font-light mb-6">{t("orderSuccessMsg")}</p>
                    <button onClick={resetCheckout} className="px-8 py-3 bg-maroon text-white font-body text-[13px] tracking-[2px] uppercase border-none cursor-pointer hover:bg-maroon-dark transition-colors">{t("backToMenu")}</button>
                  </div>
                ) : (
                  <>
                    <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-2">{t("checkoutSub")}</p>
                    <h3 className="text-[24px] sm:text-[28px] font-light text-maroon mb-2">{t("checkoutTitle")}</h3>
                    <DiamondDivider />

                    {orderStatus === "error" && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-50 border border-red-200 text-center">
                        <p className="font-body text-[14px] text-red-700 font-light">{t("orderErrorMsg")}</p>
                      </motion.div>
                    )}

                    {/* Order summary */}
                    <div className="my-5 sm:my-6 p-3 sm:p-4 bg-white border border-beige">
                      {cart.map((cartItem) => {
                        const item = getItem(cartItem);
                        if (!item) return null;
                        return (
                          <div key={`co-${cartItem.categoryKey}-${cartItem.itemIndex}`} className="flex justify-between py-1.5 font-body text-[13px] text-gray font-light">
                            <span className="truncate mr-2">{getItemName(cartItem.categoryKey, cartItem.itemIndex, item.name)} × {cartItem.quantity}</span>
                            <span className="text-maroon shrink-0">{formatPrice(item.price * cartItem.quantity)}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between py-1.5 font-body text-[13px] text-gray font-light border-t border-beige mt-2 pt-2">
                        <span>{t("deliveryFee")}</span>
                        <span className="text-maroon">{formatPrice(DELIVERY_FEE)}</span>
                      </div>
                      {couponStatus === "valid" && couponDiscount > 0 && (
                        <div className="flex justify-between py-1.5 font-body text-[13px] text-green-600 font-light">
                          <span>{t("discount")}</span>
                          <span>-{formatPrice(couponDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 mt-2 border-t border-beige">
                        <span className="font-body text-[13px] text-gray uppercase tracking-[2px]">{tPedido("total")}</span>
                        <span className="text-[22px] font-light text-maroon">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>

                    {/* Coupon code */}
                    <div className="mb-6">
                      <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-3">{t("couponLabel")}</label>
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); if (couponStatus !== "idle") { setCouponStatus("idle"); setCouponDiscount(0); setCouponError(""); } }}
                          className={`flex-1 py-2.5 px-3 border font-body text-[14px] text-ink outline-none transition-colors bg-transparent ${couponStatus === "valid" ? "border-green-400" : couponStatus === "invalid" ? "border-red-400" : "border-beige focus:border-maroon"}`}
                          placeholder={t("couponPlaceholder")}
                        />
                        <button
                          onClick={validateCoupon}
                          disabled={couponStatus === "loading" || !couponCode.trim()}
                          className="px-4 py-2.5 bg-maroon text-white font-body text-[12px] tracking-[1px] uppercase border-none cursor-pointer hover:bg-maroon-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {couponStatus === "loading" ? "..." : t("couponApply")}
                        </button>
                      </div>
                      {couponStatus === "valid" && <p className="font-body text-[12px] text-green-600 mt-1 font-light">{t("couponApplied", { amount: formatPrice(couponDiscount) })}</p>}
                      {couponStatus === "invalid" && couponError && <p className="font-body text-[12px] text-red-500 mt-1 font-light">{couponError}</p>}
                    </div>

                    {/* Delivery address */}
                    <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-3">{t("deliveryAddress")}</label>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="col-span-2">
                        <input
                          value={street} onChange={(e) => { setStreet(e.target.value); setCheckoutErrors((p) => ({ ...p, street: false })); }}
                          className={`w-full py-3 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${checkoutErrors.street ? "border-b-red-400" : "border-b-beige"}`}
                          placeholder={t("street")}
                        />
                      </div>
                      <div>
                        <input
                          value={number} onChange={(e) => { setNumber(e.target.value); setCheckoutErrors((p) => ({ ...p, number: false })); }}
                          className={`w-full py-3 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${checkoutErrors.number ? "border-b-red-400" : "border-b-beige"}`}
                          placeholder={t("number")}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          value={city} onChange={(e) => setCity(e.target.value)}
                          className="w-full py-3 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray"
                          placeholder={t("city")}
                        />
                      </div>
                      <div>
                        <input
                          value={postcode} onChange={(e) => { setPostcode(e.target.value); setCheckoutErrors((p) => ({ ...p, postcode: false })); }}
                          className={`w-full py-3 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${checkoutErrors.postcode ? "border-b-red-400" : "border-b-beige"}`}
                          placeholder={t("postcode")}
                        />
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-0">
                      <input value={checkoutName} onChange={(e) => { setCheckoutName(e.target.value); setCheckoutErrors((p) => ({ ...p, name: false })); }}
                        className={`w-full py-3.5 sm:py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${checkoutErrors.name ? "border-b-red-400" : "border-b-beige"}`}
                        placeholder={tPedido("name")} />
                      <input type="tel" value={checkoutPhone} onChange={(e) => { setCheckoutPhone(e.target.value); setCheckoutErrors((p) => ({ ...p, phone: false })); }}
                        className={`w-full py-3.5 sm:py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${checkoutErrors.phone ? "border-b-red-400" : "border-b-beige"}`}
                        placeholder={tPedido("phone")} />
                      <input type="email" value={checkoutEmail} onChange={(e) => { setCheckoutEmail(e.target.value); setCheckoutErrors((p) => ({ ...p, email: false })); }}
                        className={`w-full py-3.5 sm:py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${checkoutErrors.email ? "border-b-red-400" : "border-b-beige"}`}
                        placeholder={tPedido("email")} />
                      <textarea value={checkoutNotes} onChange={(e) => setCheckoutNotes(e.target.value)} rows={2}
                        className="w-full py-3.5 sm:py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray resize-none"
                        placeholder={tPedido("orderNotes")} />
                    </div>

                    <button
                      onClick={handlePlaceOrder} disabled={orderStatus === "loading"}
                      className="w-full mt-6 sm:mt-8 px-12 py-4 sm:py-[18px] bg-maroon text-white border-none font-heading text-[14px] sm:text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {orderStatus === "loading" ? t("submitting") : t("placeDeliveryOrder")}
                    </button>
                    <p className="font-body text-xs text-gray text-center mt-3 font-light">{t("deliveryNote")}</p>
                  </>
                )}
              </div>
              <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {cartCount > 0 && <div className="lg:hidden h-[68px]" />}
    </>
  );
}

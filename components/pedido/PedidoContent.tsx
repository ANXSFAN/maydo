"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";
import type { MenuCategoryData, MenuItemData } from "@/lib/menu-types";
import { getLocalizedText } from "@/lib/menu-types";
import AllergenBadges from "@/components/ui/AllergenBadges";
import MenuItemOptionsModal, { type SelectedOption } from "@/components/pedido/MenuItemOptionsModal";

type Props = {
  categories: MenuCategoryData[];
  items: MenuItemData[];
};

type Section = "all" | "sushi" | "cocina";

type CartItem = {
  lineId: string;
  itemId: string;
  quantity: number;
  optionsSelected?: SelectedOption[];
  priceModifier: number;
};

const newLineId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const hasOptions = (item: MenuItemData) =>
  Array.isArray(item.options) && (item.options as unknown[]).length > 0;

type OrderStatus = "idle" | "loading" | "error";

const PICKUP_SLOTS = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "17:00", "18:00", "19:00",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
  "23:00", "23:30", "23:59",
];

const CART_STORAGE_KEY = "sushi-maydo-cart";

export default function PedidoContent({ categories, items }: Props) {
  const t = useTranslations("Pedido");
  const locale = useLocale();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [optionsModalItem, setOptionsModalItem] = useState<MenuItemData | null>(null);
  const catNavRef = useRef<HTMLDivElement>(null);

  // Checkout form state
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [selectedPickupTime, setSelectedPickupTime] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, boolean>>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  // ---- Derived data ----
  const itemMap = useMemo(() => {
    const map: Record<string, MenuItemData> = {};
    for (const item of items) map[item.id] = item;
    return map;
  }, [items]);

  const categoriesWithItems = useMemo(() => {
    return categories.map((cat) => ({
      category: cat,
      items: items.filter((i) => i.categoryId === cat.id),
    }));
  }, [categories, items]);

  const sushiCatIds = useMemo(
    () => new Set(categories.filter((c) => c.station === "sushi").map((c) => c.id)),
    [categories]
  );

  const visibleCategories = useMemo(() => {
    if (activeSection === "all") return categoriesWithItems;
    if (activeSection === "sushi")
      return categoriesWithItems.filter((c) => sushiCatIds.has(c.category.id));
    return categoriesWithItems.filter((c) => !sushiCatIds.has(c.category.id));
  }, [activeSection, categoriesWithItems, sushiCatIds]);

  // ---- Time slot filtering ----
  const [nowMinutes, setNowMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const availableSlots = useMemo(() => {
    return PICKUP_SLOTS.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      return h * 60 + m > nowMinutes;
    });
  }, [nowMinutes]);

  // ---- Cart helpers ----
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Migrate pre-options cart entries
          const migrated: CartItem[] = parsed.map((c: Partial<CartItem> & { itemId: string; quantity: number }) => ({
            lineId: c.lineId ?? newLineId(),
            itemId: c.itemId,
            quantity: c.quantity,
            optionsSelected: c.optionsSelected,
            priceModifier: c.priceModifier ?? 0,
          }));
          setCart(migrated);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch { /* ignore */ }
  }, [cart]);

  const addToCart = (item: MenuItemData) => {
    if (hasOptions(item)) {
      setOptionsModalItem(item);
      return;
    }
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.itemId === item.id && !c.optionsSelected?.length
      );
      if (existing) {
        return prev.map((c) =>
          c.lineId === existing.lineId ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        { lineId: newLineId(), itemId: item.id, quantity: 1, priceModifier: 0 },
      ];
    });
  };

  const addToCartWithOptions = (item: MenuItemData, selections: SelectedOption[]) => {
    const priceMod = selections.reduce((s, o) => s + o.priceModifier, 0);
    setCart((prev) => [
      ...prev,
      {
        lineId: newLineId(),
        itemId: item.id,
        quantity: 1,
        optionsSelected: selections.length ? selections : undefined,
        priceModifier: priceMod,
      },
    ]);
    setOptionsModalItem(null);
  };

  const updateLineQuantity = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.lineId === lineId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const decrementPlainItem = (itemId: string) => {
    const line = cart.find((c) => c.itemId === itemId && !c.optionsSelected?.length);
    if (line) updateLineQuantity(line.lineId, -1);
  };

  const getItem = useCallback(
    (cartItem: CartItem): MenuItemData | null => itemMap[cartItem.itemId] ?? null,
    [itemMap]
  );

  const getName = (item: MenuItemData) => getLocalizedText(item.name, locale);
  const getDesc = (item: MenuItemData) => getLocalizedText(item.description, locale);

  const cartTotal = cart.reduce((sum, c) => {
    const item = getItem(c);
    if (!item) return sum;
    return sum + (item.price + c.priceModifier) * c.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const formatPrice = (price: number) =>
    `${price.toFixed(2).replace(".", ",")}€`;

  const getCartQuantity = (itemId: string) =>
    cart.reduce((s, c) => (c.itemId === itemId ? s + c.quantity : s), 0);

  const getPlainLineQty = (itemId: string) =>
    cart.find((c) => c.itemId === itemId && !c.optionsSelected?.length)?.quantity ?? 0;

  // Scroll active category button into view
  useEffect(() => {
    if (activeCategory && catNavRef.current) {
      const btn = catNavRef.current.querySelector(`[data-cat="${activeCategory}"]`);
      btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategory]);

  // Auto-highlight category on scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    visibleCategories.forEach(({ category }) => {
      const el = document.getElementById(`cat-${category.id}`);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveCategory(category.id);
        },
        { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [visibleCategories]);

  const finalTotal = Math.max(0, cartTotal - couponDiscount);

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

  const validateCheckout = () => {
    const errs: Record<string, boolean> = {};
    if (!checkoutName.trim()) errs.name = true;
    if (!checkoutPhone.trim()) errs.phone = true;
    if (!checkoutEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutEmail))
      errs.email = true;
    if (!selectedPickupTime) errs.pickupTime = true;
    setCheckoutErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateCheckout()) return;
    setOrderStatus("loading");

    try {
      const orderItems = cart.map((c) => {
        const item = getItem(c);
        const basePrice = item?.price ?? 0;
        return {
          id: c.itemId,
          quantity: c.quantity,
          name: item ? getName(item) : "",
          price: basePrice + c.priceModifier,
          options: c.optionsSelected,
        };
      });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: checkoutName.trim(),
          phone: checkoutPhone.trim(),
          email: checkoutEmail.trim(),
          pickup_time: selectedPickupTime,
          notes: checkoutNotes.trim() || null,
          items: orderItems,
          total: finalTotal,
          discount_code: couponStatus === "valid" ? couponCode.trim() : null,
          discount_amount: couponDiscount,
          locale,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      const params = new URLSearchParams({
        name: checkoutName.trim(),
        pickup_time: selectedPickupTime,
        total: String(finalTotal),
      });
      if (data.orderId) params.set("order_id", data.orderId);
      localStorage.removeItem(CART_STORAGE_KEY);
      router.push(`/pedido/success?${params.toString()}`);
    } catch {
      setOrderStatus("error");
    }
  };

  const resetCheckout = () => {
    setShowCheckout(false);
    setOrderStatus("idle");
    setCheckoutName("");
    setCheckoutPhone("");
    setCheckoutEmail("");
    setCheckoutNotes("");
    setSelectedPickupTime("");
    setCheckoutErrors({});
    setCouponCode("");
    setCouponStatus("idle");
    setCouponDiscount(0);
    setCouponError("");
  };

  // ---- Shared cart item renderer ----
  const renderCartItem = (cartItem: CartItem, prefix: string, compact?: boolean) => {
    const item = getItem(cartItem);
    if (!item) return null;
    const imgSize = compact ? "w-12 h-12" : "w-10 h-10";
    const unitPrice = item.price + cartItem.priceModifier;
    const optsText = cartItem.optionsSelected?.map((o) => o.choice).join(" · ") ?? "";
    return (
      <div
        key={`${prefix}-${cartItem.lineId}`}
        className={`flex items-center gap-3 ${compact ? "bg-white border border-beige p-3" : ""}`}
      >
        {item.imageUrl && (
          <div className={`${imgSize} shrink-0 relative overflow-hidden bg-white`}>
            <Image src={item.imageUrl} alt={getName(item)} fill className="object-contain" sizes={compact ? "48px" : "40px"} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] text-maroon font-light truncate">{getName(item)}</div>
          {optsText && (
            <div className="font-body text-[11px] text-gray truncate">{optsText}</div>
          )}
          <div className={`font-body text-[12px] ${compact ? "text-camel" : "text-gray"}`}>
            {compact ? formatPrice(unitPrice) : `${formatPrice(unitPrice)} × ${cartItem.quantity}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateLineQuantity(cartItem.lineId, -1)}
            className="w-7 h-7 border border-beige text-maroon font-body text-xs flex items-center justify-center cursor-pointer hover:border-maroon bg-transparent"
          >−</button>
          <span className="font-body text-[13px] text-maroon w-4 text-center">{cartItem.quantity}</span>
          <button
            onClick={() => updateLineQuantity(cartItem.lineId, 1)}
            className="w-7 h-7 border border-beige text-maroon font-body text-xs flex items-center justify-center cursor-pointer hover:border-maroon bg-transparent"
          >+</button>
        </div>
        <div className="text-[14px] text-maroon font-light w-16 text-right">
          {formatPrice(unitPrice * cartItem.quantity)}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sticky top nav for mobile */}
      <div className="lg:hidden sticky top-[60px] z-40 bg-cream/95 backdrop-blur-md border-b border-beige/50">
        <div className="flex">
          {(["all", "sushi", "cocina"] as Section[]).map((sec) => (
            <button
              key={sec}
              onClick={() => { setActiveSection(sec); setActiveCategory(null); }}
              className={`flex-1 py-3 text-[12px] tracking-[2px] uppercase font-body font-light transition-all duration-200 cursor-pointer border-none ${
                activeSection === sec ? "bg-maroon text-white" : "bg-transparent text-maroon active:bg-beige/50"
              }`}
            >
              {t(sec)}
            </button>
          ))}
        </div>
        <div ref={catNavRef} className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide border-t border-beige/30">
          {visibleCategories.map(({ category }) => (
            <button
              key={category.id}
              data-cat={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setTimeout(() => {
                  document.getElementById(`cat-${category.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              className={`px-3 py-1.5 text-[11px] tracking-[0.5px] font-body font-light border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === category.id
                  ? "bg-camel text-white border-camel"
                  : "bg-white text-gray border-beige active:border-camel"
              }`}
            >
              {getLocalizedText(category.name, locale)}
            </button>
          ))}
        </div>
      </div>

      <section className="py-[clamp(20px,8vw,100px)] px-[clamp(12px,4vw,40px)] bg-cream">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex gap-10 max-lg:flex-col">
            {/* Menu items */}
            <div className="flex-1 min-w-0">
              {/* Desktop section tabs */}
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
                      {t(sec)}
                    </button>
                  ))}
                </div>
              </FadeIn>

              {/* Desktop category nav */}
              <div className="hidden lg:flex flex-wrap gap-2 mb-8">
                {visibleCategories.map(({ category }) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(activeCategory === category.id ? null : category.id);
                      document.getElementById(`cat-${category.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`px-3 py-1.5 text-[11px] tracking-[1px] font-body font-light border transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      activeCategory === category.id
                        ? "bg-camel text-white border-camel"
                        : "bg-white text-gray border-beige hover:border-camel hover:text-camel"
                    }`}
                  >
                    {getLocalizedText(category.name, locale)}
                  </button>
                ))}
              </div>

              {/* Category sections */}
              <div className="space-y-8 sm:space-y-10">
                {visibleCategories.map(({ category, items: catItems }) => (
                  <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-[170px] lg:scroll-mt-24">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                      <h3 className="text-[18px] sm:text-[22px] font-light text-maroon whitespace-nowrap">
                        {getLocalizedText(category.name, locale)}
                      </h3>
                      <div className="flex-1 h-px bg-beige" />
                      <span className="font-body text-[10px] sm:text-[11px] text-gray tracking-[1px]">
                        {catItems.length} {t("items")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                      {catItems.map((item) => {
                        const plainQty = getPlainLineQty(item.id);
                        const totalQty = getCartQuantity(item.id);
                        const itemHasOptions = hasOptions(item);
                        const itemName = getName(item);
                        const itemDesc = getDesc(item);
                        return (
                          <div
                            key={item.id}
                            className="group bg-white border border-beige transition-all duration-300 hover:shadow-[0_8px_30px_rgba(122,66,66,0.1)] overflow-hidden flex flex-col"
                          >
                            {item.imageUrl ? (
                              <div className="relative aspect-square overflow-hidden bg-white">
                                <Image
                                  src={item.imageUrl}
                                  alt={itemName}
                                  fill
                                  className="object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                />
                              </div>
                            ) : (
                              <div className="aspect-square bg-beige/30 flex items-center justify-center">
                                <span className="text-gray/30 text-4xl font-cjk">鮨</span>
                              </div>
                            )}

                            <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                              <h4 className="text-[20px] sm:text-[15px] font-medium sm:font-normal text-maroon leading-snug">
                                {itemName}
                              </h4>
                              {itemDesc && (
                                <p className="font-body text-[16px] sm:text-[12px] text-ink/60 mt-1 leading-relaxed line-clamp-2">
                                  {itemDesc}
                                </p>
                              )}
                              <AllergenBadges allergens={item.allergens} compact />
                              <div className="mt-auto pt-3">
                                <span className="text-[24px] sm:text-[16px] font-light text-camel block mb-2.5 sm:mb-3">
                                  {formatPrice(item.price)}
                                  {itemHasOptions && (
                                    <span className="text-[12px] sm:text-[10px] text-gray ml-1">+</span>
                                  )}
                                </span>
                                {itemHasOptions ? (
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="w-full h-10 sm:h-9 bg-maroon text-white font-body text-[12px] sm:text-[11px] tracking-[2px] uppercase border-none cursor-pointer transition-all duration-300 hover:bg-maroon-dark active:scale-[0.97] flex items-center justify-center gap-2"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                      <path d="M8 3v10M3 8h10" />
                                    </svg>
                                    {t("add")}
                                    {totalQty > 0 && (
                                      <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-[10px]">×{totalQty}</span>
                                    )}
                                  </button>
                                ) : plainQty > 0 ? (
                                  <div className="flex items-center justify-between border border-beige">
                                    <button
                                      onClick={() => decrementPlainItem(item.id)}
                                      className="w-10 h-10 sm:w-8 sm:h-8 text-maroon font-body text-base sm:text-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-beige/50 bg-transparent border-none"
                                    >−</button>
                                    <span className="font-body text-[15px] sm:text-[14px] text-maroon font-medium">{plainQty}</span>
                                    <button
                                      onClick={() => addToCart(item)}
                                      className="w-10 h-10 sm:w-8 sm:h-8 text-maroon font-body text-base sm:text-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-beige/50 bg-transparent border-none"
                                    >+</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(item)}
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
                ))}
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

                  <div className="p-6 max-h-[400px] overflow-y-auto">
                    {cart.length === 0 ? (
                      <p className="font-body text-sm text-gray text-center py-8 font-light">{t("emptyCart")}</p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((cartItem) => renderCartItem(cartItem, "d"))}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-6 pt-4 border-t border-beige">
                      <div className="flex justify-between items-baseline mb-5">
                        <span className="font-body text-[13px] text-gray uppercase tracking-[2px]">{t("total")}</span>
                        <span className="text-[28px] font-light text-maroon">{formatPrice(cartTotal)}</span>
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
                <span className="text-[20px] font-light text-maroon">{formatPrice(cartTotal)}</span>
              </button>
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
                <div className="w-10 h-1 bg-beige rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] font-light text-maroon">{t("cart")}</h3>
                  <button
                    onClick={() => setShowMobileCart(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray hover:text-maroon cursor-pointer bg-transparent border-none text-xl"
                  >×</button>
                </div>

                <div className="space-y-3">
                  {cart.map((cartItem) => renderCartItem(cartItem, "m", true))}
                </div>

                <div className="flex justify-between items-baseline mt-5 pt-4 border-t border-beige">
                  <span className="font-body text-[13px] text-gray uppercase tracking-[2px]">{t("total")}</span>
                  <span className="text-[26px] font-light text-maroon">{formatPrice(cartTotal)}</span>
                </div>

                <button
                  onClick={() => { setShowMobileCart(false); setShowCheckout(true); }}
                  className="w-full mt-4 px-8 py-4 bg-maroon text-white border-none font-heading text-[14px] tracking-[3px] uppercase cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {t("checkout")}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
          >
            <div
              className="absolute inset-0 bg-maroon-dark/60 backdrop-blur-sm"
              onClick={() => orderStatus !== "loading" && resetCheckout()}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="relative bg-cream border border-beige w-full sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-none"
            >
              <div className="p-5 sm:p-[clamp(24px,4vw,40px)]">
                <div className="w-10 h-1 bg-beige rounded-full mx-auto mb-4 sm:hidden" />

                {orderStatus !== "loading" && (
                  <button
                    onClick={resetCheckout}
                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-gray hover:text-maroon transition-colors cursor-pointer bg-transparent border-none text-xl"
                  >×</button>
                )}

                <>
                    <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-2">{t("checkoutSub")}</p>
                    <h3 className="text-[24px] sm:text-[28px] font-light text-maroon mb-2">{t("checkoutTitle")}</h3>
                    <DiamondDivider />

                    {orderStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-red-50 border border-red-200 text-center"
                      >
                        <p className="font-body text-[14px] text-red-700 font-light">{t("orderErrorMsg")}</p>
                      </motion.div>
                    )}

                    <div className="my-5 sm:my-6 p-3 sm:p-4 bg-white border border-beige">
                      {cart.map((cartItem) => {
                        const item = getItem(cartItem);
                        if (!item) return null;
                        return (
                          <div
                            key={`co-${cartItem.itemId}`}
                            className="flex justify-between py-1.5 font-body text-[13px] text-gray font-light"
                          >
                            <span className="truncate mr-2">
                              {getName(item)} × {cartItem.quantity}
                            </span>
                            <span className="text-maroon shrink-0">
                              {formatPrice(item.price * cartItem.quantity)}
                            </span>
                          </div>
                        );
                      })}
                      {couponStatus === "valid" && couponDiscount > 0 && (
                        <div className="flex justify-between py-1.5 font-body text-[13px] text-green-600 font-light border-t border-beige mt-2 pt-2">
                          <span>{t("discount")}</span>
                          <span>-{formatPrice(couponDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 mt-3 border-t border-beige">
                        <span className="font-body text-[13px] text-gray uppercase tracking-[2px]">{t("total")}</span>
                        <span className="text-[22px] font-light text-maroon">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    {/* Coupon code */}
                    <div className="mb-6">
                      <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-3">{t("couponLabel")}</label>
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            if (couponStatus !== "idle") {
                              setCouponStatus("idle");
                              setCouponDiscount(0);
                              setCouponError("");
                            }
                          }}
                          className={`flex-1 py-2.5 px-3 border font-body text-[14px] text-ink outline-none transition-colors bg-transparent ${
                            couponStatus === "valid" ? "border-green-400"
                            : couponStatus === "invalid" ? "border-red-400"
                            : "border-beige focus:border-maroon"
                          }`}
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
                      {couponStatus === "valid" && (
                        <p className="font-body text-[12px] text-green-600 mt-1 font-light">
                          {t("couponApplied", { amount: formatPrice(couponDiscount) })}
                        </p>
                      )}
                      {couponStatus === "invalid" && couponError && (
                        <p className="font-body text-[12px] text-red-500 mt-1 font-light">{couponError}</p>
                      )}
                    </div>

                    <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-3">
                      {t("pickupTime")}
                      {checkoutErrors.pickupTime && (
                        <span className="text-red-500 ml-2 normal-case tracking-normal">*{t("required")}</span>
                      )}
                    </label>
                    {availableSlots.length === 0 ? (
                      <p className="font-body text-[13px] text-gray font-light mb-6">{t("noSlotsAvailable")}</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 mb-6">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => {
                              setSelectedPickupTime(slot);
                              setCheckoutErrors((e) => ({ ...e, pickupTime: false }));
                            }}
                            className={`px-3 sm:px-4 py-2 border text-[12px] sm:text-[13px] font-body cursor-pointer transition-all ${
                              selectedPickupTime === slot
                                ? "bg-maroon text-white border-maroon"
                                : checkoutErrors.pickupTime
                                  ? "border-red-300 text-maroon bg-transparent hover:border-maroon"
                                  : "border-beige text-maroon bg-transparent hover:border-maroon"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="space-y-0">
                      <input
                        autoComplete="name"
                        value={checkoutName}
                        onChange={(e) => { setCheckoutName(e.target.value); setCheckoutErrors((prev) => ({ ...prev, name: false })); }}
                        className={`w-full py-3.5 sm:py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${
                          checkoutErrors.name ? "border-b-red-400" : "border-b-beige"
                        }`}
                        placeholder={t("name")}
                      />
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={checkoutPhone}
                        onChange={(e) => { setCheckoutPhone(e.target.value); setCheckoutErrors((prev) => ({ ...prev, phone: false })); }}
                        className={`w-full py-3.5 sm:py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${
                          checkoutErrors.phone ? "border-b-red-400" : "border-b-beige"
                        }`}
                        placeholder={t("phone")}
                      />
                      <input
                        type="email"
                        autoComplete="email"
                        value={checkoutEmail}
                        onChange={(e) => { setCheckoutEmail(e.target.value); setCheckoutErrors((prev) => ({ ...prev, email: false })); }}
                        className={`w-full py-3.5 sm:py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${
                          checkoutErrors.email ? "border-b-red-400" : "border-b-beige"
                        }`}
                        placeholder={t("email")}
                      />
                      <textarea
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        rows={2}
                        className="w-full py-3.5 sm:py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray resize-none"
                        placeholder={t("orderNotes")}
                      />
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={orderStatus === "loading"}
                      className="w-full mt-6 sm:mt-8 px-12 py-4 sm:py-[18px] bg-maroon text-white border-none font-heading text-[14px] sm:text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {orderStatus === "loading" ? t("submitting") : t("placeOrder")}
                    </button>
                    <p className="font-body text-xs text-gray text-center mt-3 font-light">{t("payAtStore")}</p>
                  </>
              </div>
              <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {cartCount > 0 && <div className="lg:hidden h-[68px] pointer-events-none" />}

      {optionsModalItem && (
        <MenuItemOptionsModal
          item={optionsModalItem}
          onClose={() => setOptionsModalItem(null)}
          onConfirm={(selections) => addToCartWithOptions(optionsModalItem, selections)}
        />
      )}
    </>
  );
}

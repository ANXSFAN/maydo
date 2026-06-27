"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DiamondDivider from "@/components/ui/DiamondDivider";
import type { MenuCategoryData, MenuItemData, SetMealData } from "@/lib/menu-types";
import { getLocalizedText } from "@/lib/menu-types";
import AllergenBadges from "@/components/ui/AllergenBadges";
import MenuItemOptionsModal, { type SelectedOption } from "@/components/pedido/MenuItemOptionsModal";
import SetMealSelector, { type SetMealResult, type SetMealSelection } from "@/components/pedido/SetMealSelector";
import BuffetFlow from "@/components/pedido/BuffetFlow";
import { useModalLock } from "@/lib/use-modal-lock";
import { buildPickupSlots } from "@/lib/business-hours";

type Flow = "single" | "buffet";

type Props = {
  categories: MenuCategoryData[];
  items: MenuItemData[];
  setMeals: SetMealData[];
  initialMealTime?: string;
  initialFlow?: Flow;
};

function isMealTime(v: string | undefined): v is "lunch" | "dinner" {
  return v === "lunch" || v === "dinner";
}

type RegularCartItem = {
  kind: "item";
  lineId: string;
  itemId: string;
  quantity: number;
  optionsSelected?: SelectedOption[];
  priceModifier: number;
};

type SetMealCartItem = {
  kind: "setMeal";
  lineId: string;
  setMealId: string;
  setMealName: Record<string, string>;
  /** 最终单价 = 套餐基础价 + Σ priceDelta */
  unitPrice: number;
  selections: SetMealSelection[];
  quantity: number;
};

type CartItem = RegularCartItem | SetMealCartItem;

const newLineId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const hasOptions = (item: MenuItemData) =>
  Array.isArray(item.options) && (item.options as unknown[]).length > 0;

type OrderStatus = "idle" | "loading" | "error";

const CART_STORAGE_KEY = "sushi-maydo-cart";
const SLOTS_DEFAULT_VISIBLE = 6; // 每段默认显示几个时段，超出收起

// ── Menú del día 14,95 € (2026-05 硬编码) ────────────────────────────────────
// 复用 SetMealSelector 流程：构造一个 SetMealData，主菜/饮料/咖啡 3 个 course。
// 咖啡/茶不来自 Orderlix，注入两个虚拟 MenuItemData 给 selector 的 items 池。
const DAILY_MENU_ID = "daily-menu-1495";
const DAILY_MENU_PRICE = 14.95;
const DAILY_HOT_BEV_CAT = "daily-hot-bev";
const DAILY_HOT_BEV_ITEMS: MenuItemData[] = [
  {
    id: "daily-cafe",
    categoryId: DAILY_HOT_BEV_CAT,
    name: { es: "Café", ca: "Cafè", en: "Coffee", zh: "咖啡" },
    description: null,
    price: 0,
    imageUrl: null,
    allergens: [],
    options: null,
  },
  {
    id: "daily-te",
    categoryId: DAILY_HOT_BEV_CAT,
    name: { es: "Té", ca: "Te", en: "Tea", zh: "茶" },
    description: null,
    price: 0,
    imageUrl: null,
    allergens: [],
    options: null,
  },
];
// 套餐配的饮料 —— 只算软饮（refresco / agua / zumo 等）
const SOFT_DRINK_CATEGORY_REGEX =
  /refresc|refresco|soft|软饮|无酒精|sin\s*alcohol|sense\s*alcohol|agua|water|水|juice|zumo|suc|果汁|coca|cola|sprite|fanta|nestea|aquarius/i;

// 套餐不能选的分类 —— 酒类、咖啡/茶（咖啡/茶通过虚拟 course 单独选）
const NON_DISH_CATEGORY_REGEX =
  /\b(wine|vino|vins|cerveza|cervesa|beer|sake|cocktail|c[oó]ctel|licor|alcohol|cava|champ|whisky|vodka|gin|ron|rum|tequila|brand|co[ñn]ac|cognac|caf[ée]s?|coffee|infusi|t[ée]s?)\b|啤酒|清酒|鸡尾酒|红酒|白酒|咖啡|茶/i;

export default function PedidoContent({ categories, items, setMeals, initialMealTime, initialFlow }: Props) {
  const t = useTranslations("Pedido");
  const tFlow = useTranslations("Flow");
  const tFooter = useTranslations("Footer");
  const locale = useLocale();
  const router = useRouter();
  const [flow, setFlow] = useState<Flow>(initialFlow ?? "single");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  // 午/晚菜单切换入口 — 优先用 URL ?menu= 参数；缺省按当前小时（≥17:00 选 dinner）。当前阶段仅切换 UI，不过滤数据
  const [mealTime, setMealTime] = useState<"lunch" | "dinner">(() => {
    if (isMealTime(initialMealTime)) return initialMealTime;
    const h = new Date().getHours();
    return h >= 17 ? "dinner" : "lunch";
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [optionsModalItem, setOptionsModalItem] = useState<MenuItemData | null>(null);
  const [selectedSetMeal, setSelectedSetMeal] = useState<SetMealData | null>(null);
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

  const visibleCategories = categoriesWithItems;

  // ---- Menú del día — 把可见分类分成"软饮池 / 菜池"，构造硬编码 SetMealData ----
  // 菜池 = 常规菜品 + 甜品（排除：软饮归 drink course / 酒类、咖啡茶完全不能当菜选）
  const dailyMenuData = useMemo<SetMealData | null>(() => {
    if (visibleCategories.length === 0) return null;
    const drinkIds: string[] = [];
    const dishIds: string[] = [];
    for (const { category } of visibleCategories) {
      const namePool = Object.values(category.name).join(" ");
      if (SOFT_DRINK_CATEGORY_REGEX.test(namePool)) drinkIds.push(category.id);
      else if (NON_DISH_CATEGORY_REGEX.test(namePool)) continue; // 酒/咖啡/茶 → 排除
      else dishIds.push(category.id);
    }
    if (dishIds.length === 0) return null;
    return {
      id: DAILY_MENU_ID,
      name: {
        es: "Menú del día",
        ca: "Menú del dia",
        en: "Daily set menu",
        zh: "每日套餐",
      },
      price: DAILY_MENU_PRICE,
      courses: [
        {
          courseNumber: 1,
          label: {
            es: "5 platos a elegir",
            ca: "5 plats a triar",
            en: "Pick 5 dishes",
            zh: "选 5 道菜",
          },
          categoryIds: dishIds,
          maxChoices: 5,
        },
        ...(drinkIds.length > 0
          ? [
              {
                courseNumber: 2,
                label: {
                  es: "Bebida",
                  ca: "Beguda",
                  en: "Drink",
                  zh: "饮料",
                },
                categoryIds: drinkIds,
                maxChoices: 1,
              },
            ]
          : []),
        {
          courseNumber: drinkIds.length > 0 ? 3 : 2,
          label: {
            es: "Café o té",
            ca: "Cafè o te",
            en: "Coffee or tea",
            zh: "咖啡或茶",
          },
          categoryIds: [DAILY_HOT_BEV_CAT],
          maxChoices: 1,
        },
      ],
      availableFrom: null,
      availableTo: null,
      sortOrder: 0,
    };
  }, [visibleCategories]);

  // SetMealSelector 内部用 items 做白名单/itemMap，需要把虚拟咖啡/茶注入
  const itemsWithDailyExtras = useMemo(
    () => [...items, ...DAILY_HOT_BEV_ITEMS],
    [items]
  );

  // ---- Time slot filtering ----
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const pickupSlots = useMemo(() => buildPickupSlots(now), [now]);
  const hasAnySlot = !pickupSlots.isClosed;
  const [showAllLunch, setShowAllLunch] = useState(false);
  const [showAllDinner, setShowAllDinner] = useState(false);

  // 套餐数据 (setMeals) 仍从 Orderlix 拉取并保留 SetMealSelector 组件，
  // 但前端 hero 入口已移除 (2026-05 反馈)。Orderlix 后续推新套餐时再恢复入口。

  // ---- Cart helpers ----
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;
      const itemIds = new Set(items.map((i) => i.id));
      const setMealIds = new Set(setMeals.map((sm) => sm.id));
      const migrated: CartItem[] = parsed
        .map((c: Record<string, unknown>): CartItem | null => {
          if (c.kind === "setMeal" && typeof c.setMealId === "string") {
            return {
              kind: "setMeal",
              lineId: (c.lineId as string) ?? newLineId(),
              setMealId: c.setMealId,
              setMealName: (c.setMealName as Record<string, string>) ?? {},
              unitPrice: Number(c.unitPrice ?? 0),
              selections: (c.selections as SetMealSelection[]) ?? [],
              quantity: Number(c.quantity ?? 1),
            };
          }
          // 老版本没有 kind 字段，按普通菜品处理
          if (typeof c.itemId !== "string") return null;
          return {
            kind: "item",
            lineId: (c.lineId as string) ?? newLineId(),
            itemId: c.itemId,
            quantity: Number(c.quantity ?? 1),
            optionsSelected: c.optionsSelected as SelectedOption[] | undefined,
            priceModifier: Number(c.priceModifier ?? 0),
          };
        })
        // 剔除引用了已下架商品/套餐的行，避免显示"幽灵行"
        .filter((c): c is CartItem => {
          if (c === null) return false;
          if (c.kind === "setMeal") return setMealIds.has(c.setMealId);
          return itemIds.has(c.itemId);
        });
      setCart(migrated);
    } catch { /* ignore */ }
    // 仅 mount 时跑一次：items/setMeals 来自 server props，会议间不会变
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        (c): c is RegularCartItem =>
          c.kind === "item" && c.itemId === item.id && !c.optionsSelected?.length
      );
      if (existing) {
        return prev.map((c) =>
          c.lineId === existing.lineId ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        { kind: "item", lineId: newLineId(), itemId: item.id, quantity: 1, priceModifier: 0 },
      ];
    });
  };

  const addToCartWithOptions = (item: MenuItemData, selections: SelectedOption[]) => {
    const priceMod = selections.reduce((s, o) => s + o.priceModifier, 0);
    setCart((prev) => [
      ...prev,
      {
        kind: "item",
        lineId: newLineId(),
        itemId: item.id,
        quantity: 1,
        optionsSelected: selections.length ? selections : undefined,
        priceModifier: priceMod,
      },
    ]);
    setOptionsModalItem(null);
  };

  const addSetMealToCart = (result: SetMealResult) => {
    setCart((prev) => [
      ...prev,
      {
        kind: "setMeal",
        lineId: newLineId(),
        setMealId: result.setMealId,
        setMealName: result.setMealName,
        unitPrice: result.unitPrice,
        selections: result.selections,
        quantity: 1,
      },
    ]);
    setSelectedSetMeal(null);
  };

  const updateLineQuantity = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.lineId === lineId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const decrementPlainItem = (itemId: string) => {
    const line = cart.find(
      (c): c is RegularCartItem =>
        c.kind === "item" && c.itemId === itemId && !c.optionsSelected?.length
    );
    if (line) updateLineQuantity(line.lineId, -1);
  };

  const getItem = useCallback(
    (cartItem: RegularCartItem): MenuItemData | null => itemMap[cartItem.itemId] ?? null,
    [itemMap]
  );

  const getName = (item: MenuItemData) => getLocalizedText(item.name, locale);
  const getDesc = (item: MenuItemData) => getLocalizedText(item.description, locale);

  const cartTotal = cart.reduce((sum, c) => {
    if (c.kind === "setMeal") return sum + c.unitPrice * c.quantity;
    const item = itemMap[c.itemId];
    if (!item) return sum;
    return sum + (item.price + c.priceModifier) * c.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const formatPrice = (price: number) =>
    `${price.toFixed(2).replace(".", ",")}€`;

  // 套餐子项按 menuItemId 聚合（同一道菜选多份时显示 "名字 × N"）
  const formatSetMealSelectionSummary = (selections: SetMealSelection[]) => {
    const grouped: { id: string; name: string; count: number }[] = [];
    for (const sl of selections) {
      const existing = grouped.find((g) => g.id === sl.menuItemId);
      if (existing) existing.count += 1;
      else
        grouped.push({
          id: sl.menuItemId,
          name: getLocalizedText(sl.name, locale),
          count: 1,
        });
    }
    return grouped
      .map(({ name, count }) => (count > 1 ? `${name} × ${count}` : name))
      .join(" · ");
  };

  // 一次性算出每个 itemId 的总数和 plain 行数，避免每张卡片都 reduce 一次
  const cartQtyByItem = useMemo(() => {
    const m: Record<string, { plain: number; total: number }> = {};
    for (const c of cart) {
      if (c.kind !== "item") continue;
      const cur = (m[c.itemId] ??= { plain: 0, total: 0 });
      cur.total += c.quantity;
      if (!c.optionsSelected?.length) cur.plain += c.quantity;
    }
    return m;
  }, [cart]);

  const getCartQuantity = (itemId: string) => cartQtyByItem[itemId]?.total ?? 0;
  const getPlainLineQty = (itemId: string) => cartQtyByItem[itemId]?.plain ?? 0;

  // Scroll active category button into view
  useEffect(() => {
    if (activeCategory && catNavRef.current) {
      const btn = catNavRef.current.querySelector(`[data-cat="${activeCategory}"]`);
      btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategory]);

  // Auto-highlight category on scroll —— mobile sticky 顶部约 150px（tabs + cat nav），desktop 约 100px
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    const rootMargin = isMobile ? "-130px 0px -55% 0px" : "-120px 0px -60% 0px";
    const observers: IntersectionObserver[] = [];
    visibleCategories.forEach(({ category }) => {
      const el = document.getElementById(`cat-${category.id}`);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveCategory(category.id);
        },
        { rootMargin, threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [visibleCategories]);

  // 模态打开时锁 body scroll + ESC 关闭
  useModalLock(showCheckout && orderStatus !== "loading", () => resetCheckout());
  useModalLock(showMobileCart, () => setShowMobileCart(false));

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
        if (c.kind === "setMeal") {
          return {
            id: c.setMealId,
            isSetMeal: true as const,
            name: getLocalizedText(c.setMealName, locale),
            quantity: c.quantity,
            price: c.unitPrice,
            selections: c.selections.map((sl) => ({
              courseNumber: sl.courseNumber,
              name: getLocalizedText(sl.name, locale),
              priceDelta: sl.priceDelta,
            })),
          };
        }
        const item = itemMap[c.itemId];
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
    // 套餐行：显示套餐名 + 子菜品缩略
    if (cartItem.kind === "setMeal") {
      const subText = formatSetMealSelectionSummary(cartItem.selections);
      return (
        <div
          key={`${prefix}-${cartItem.lineId}`}
          className={`${compact ? "bg-cream border border-beige p-3" : ""}`}
        >
          <div className="flex items-start gap-3">
            <div className={`${compact ? "w-12 h-12" : "w-10 h-10"} shrink-0 bg-maroon/10 border border-maroon/20 flex items-center justify-center`}>
              <span className="font-cjk text-maroon/80 text-lg">膳</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] text-maroon font-light truncate">
                {getLocalizedText(cartItem.setMealName, locale)}
              </div>
              {subText && (
                <div className="font-body text-[11px] text-gray mt-0.5 line-clamp-2 leading-snug">
                  {subText}
                </div>
              )}
              <div className={`font-body text-[12px] mt-0.5 ${compact ? "text-camel" : "text-gray"}`}>
                {compact
                  ? formatPrice(cartItem.unitPrice)
                  : `${formatPrice(cartItem.unitPrice)} × ${cartItem.quantity}`}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateLineQuantity(cartItem.lineId, -1)}
                aria-label="decrease quantity"
                className="w-7 h-7 border border-beige text-maroon font-body text-xs flex items-center justify-center cursor-pointer hover:border-maroon bg-transparent"
              >−</button>
              <span className="font-body text-[13px] text-maroon w-4 text-center">{cartItem.quantity}</span>
              <button
                onClick={() => updateLineQuantity(cartItem.lineId, 1)}
                aria-label="increase quantity"
                className="w-7 h-7 border border-beige text-maroon font-body text-xs flex items-center justify-center cursor-pointer hover:border-maroon bg-transparent"
              >+</button>
            </div>
            <div className="text-[14px] text-maroon font-light w-16 text-right shrink-0">
              {formatPrice(cartItem.unitPrice * cartItem.quantity)}
            </div>
          </div>
        </div>
      );
    }

    // 普通菜品行
    const item = getItem(cartItem);
    if (!item) return null;
    const imgSize = compact ? "w-12 h-12" : "w-10 h-10";
    const unitPrice = item.price + cartItem.priceModifier;
    const optsText = cartItem.optionsSelected?.map((o) => o.choice).join(" · ") ?? "";
    return (
      <div
        key={`${prefix}-${cartItem.lineId}`}
        className={`flex items-center gap-3 ${compact ? "bg-cream border border-beige p-3" : ""}`}
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
      {/* Flow A/B switcher — sticky 顶部，覆盖 navbar 下方 */}
      <div className="sticky top-[60px] sm:top-[70px] z-40 bg-night/95 backdrop-blur-md border-b border-night-border">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-10 py-2.5 sm:py-3 flex gap-2 sm:gap-3">
          {(["single", "buffet"] as const).map((key) => {
            const active = flow === key;
            return (
              <button
                key={key}
                onClick={() => setFlow(key)}
                aria-pressed={active}
                className={`flex-1 px-3 sm:px-5 py-2 sm:py-2.5 border transition-all duration-300 cursor-pointer text-left ${
                  active
                    ? "bg-camel text-night border-camel shadow-[0_4px_18px_rgba(201,168,124,0.18)]"
                    : "bg-transparent text-night-text-dim border-night-border hover:border-camel hover:text-night-text"
                }`}
              >
                <div className="font-body text-[11px] sm:text-[13px] font-medium tracking-[1.5px] uppercase">
                  {tFlow(`${key}Title`)}
                </div>
                <div className={`font-body text-[9px] sm:text-[10px] mt-0.5 line-clamp-1 ${active ? "text-night/70" : "opacity-70"}`}>
                  {tFlow(`${key}Desc`)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {flow === "buffet" ? (
        <section className="py-[clamp(40px,8vw,100px)] px-[clamp(12px,4vw,40px)] bg-night min-h-[60vh]">
          <BuffetFlow />
        </section>
      ) : (
      <>
      {/* Sticky category nav for mobile */}
      <div className="lg:hidden sticky top-[120px] z-30 bg-night/95 backdrop-blur-md border-b border-night-border">
        {visibleCategories.length > 0 && (
          <div ref={catNavRef} className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
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
                    : "bg-cream text-gray border-beige active:border-camel"
                }`}
              >
                {getLocalizedText(category.name, locale)}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="py-[clamp(20px,8vw,100px)] px-[clamp(12px,4vw,40px)] bg-cream">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex gap-10 max-lg:flex-col">
            {/* Menu items */}
            <div className="flex-1 min-w-0">
              {/* Desktop category nav */}
              {visibleCategories.length > 0 && (
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
                          : "bg-cream text-gray border-beige hover:border-camel hover:text-camel"
                      }`}
                    >
                      {getLocalizedText(category.name, locale)}
                    </button>
                  ))}
                </div>
              )}

              {/* Meal time tabs — entry only, currently does not filter data */}
              <div className="mb-6 sm:mb-8 max-w-[640px] mx-auto">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {(["lunch", "dinner"] as const).map((m) => {
                    const active = mealTime === m;
                    const hours = m === "lunch" ? "13:00 – 16:30" : "20:30 – 23:30";
                    return (
                      <button
                        key={m}
                        onClick={() => setMealTime(m)}
                        className={`relative overflow-hidden py-3 sm:py-4 px-4 sm:px-6 border transition-all duration-300 cursor-pointer text-left ${
                          active
                            ? "bg-maroon border-maroon text-white shadow-[0_8px_24px_rgba(122,66,66,0.18)]"
                            : "bg-cream border-beige text-maroon hover:border-camel hover:-translate-y-0.5"
                        }`}
                      >
                        <div
                          className={`absolute top-0 left-0 h-[2px] w-full bg-camel transition-transform duration-300 origin-left ${
                            active ? "scale-x-100" : "scale-x-0"
                          }`}
                        />
                        <div
                          className={`font-body text-[10px] sm:text-[11px] tracking-[2px] uppercase mb-0.5 sm:mb-1 ${
                            active ? "text-white/70" : "text-camel"
                          }`}
                        >
                          {hours}
                        </div>
                        <div className="text-[16px] sm:text-[20px] font-light">
                          {t(m === "lunch" ? "mealLunch" : "mealDinner")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Set meals hero 已移除 (2026-05) — 数据仍从 Orderlix set_meal 拉取，
                  SetMealSelector 组件保留以备未来重新接入。当前不在前端强推入口。 */}

              {/* Daily set menu — 硬编码静态卡 (2026-05)
                  价格 14.95 € 仅限堂食；外带价待商家确认。等定价稳定可不动；
                  若 Orderlix 后端接入新套餐结构再换回 SetMealSelector */}
              <div className="mb-8 sm:mb-10">
                <div className="relative overflow-hidden bg-maroon text-white border border-maroon shadow-[0_12px_32px_rgba(122,66,66,0.18)]">
                  <div className="absolute top-0 left-0 h-[3px] w-full bg-camel" />
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 sm:gap-10 items-center p-6 sm:p-10">
                    <div className="min-w-0">
                      <p className="font-body text-[10px] sm:text-[11px] tracking-[3px] uppercase text-camel mb-2">
                        {t("dailyMenuLabel")}
                      </p>
                      <h3 className="text-[22px] sm:text-[28px] font-light leading-tight mb-3">
                        {t("dailyMenuTitle")}
                      </h3>
                      <p className="font-body text-[13px] sm:text-[14px] text-white/75 font-light leading-relaxed max-w-[480px] mb-5">
                        {t("dailyMenuDesc")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-camel/50 text-camel font-body text-[10px] sm:text-[11px] tracking-[1.5px] uppercase">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {t("dailyMenuDineIn")}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-white/20 text-white/60 font-body text-[10px] sm:text-[11px] tracking-[1.5px] uppercase">
                          {t("dailyMenuTakeaway")}
                        </span>
                      </div>
                    </div>
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:gap-5 md:text-right md:border-l md:border-white/10 md:pl-10">
                      <div>
                        <div className="font-display text-[40px] sm:text-[52px] leading-none text-camel font-light">
                          14,95<span className="text-[22px] sm:text-[28px] align-top ml-1">€</span>
                        </div>
                        <p className="font-body text-[10px] tracking-[2px] uppercase text-white/50 mt-2">
                          {t("dailyMenuDineIn")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (dailyMenuData) setSelectedSetMeal(dailyMenuData);
                        }}
                        disabled={!dailyMenuData}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-camel text-night hover:bg-camel/90 border border-camel font-body text-[11px] tracking-[2px] uppercase cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("dailyMenuCta")}
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category sections */}
              <div className="space-y-8 sm:space-y-10">
                {visibleCategories.map(({ category, items: catItems }) => (
                  <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-[120px] lg:scroll-mt-24">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                      <h3 className="text-[18px] sm:text-[22px] font-light text-maroon whitespace-nowrap">
                        {getLocalizedText(category.name, locale)}
                      </h3>
                      <div className="flex-1 h-px bg-beige" />
                      <span className="font-body text-[10px] sm:text-[11px] text-gray tracking-[1px]">
                        {catItems.length} {t("items")}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
                      {catItems.map((item) => {
                        const plainQty = getPlainLineQty(item.id);
                        const totalQty = getCartQuantity(item.id);
                        const itemHasOptions = hasOptions(item);
                        const itemName = getName(item);
                        const itemDesc = getDesc(item);
                        return (
                          <div
                            key={item.id}
                            className="group bg-cream border border-beige transition-all duration-300 hover:shadow-[0_8px_30px_rgba(201,168,124,0.15)] overflow-hidden flex lg:flex-col"
                          >
                            {item.imageUrl ? (
                              <div className="relative shrink-0 w-24 sm:w-28 lg:w-full aspect-square overflow-hidden bg-white">
                                <Image
                                  src={item.imageUrl}
                                  alt={itemName}
                                  fill
                                  className="object-contain lg:transition-transform lg:duration-500 lg:group-hover:scale-[1.05]"
                                  sizes="(max-width: 640px) 96px, (max-width: 1024px) 112px, (max-width: 1280px) 33vw, 25vw"
                                />
                              </div>
                            ) : (
                              <div className="shrink-0 w-24 sm:w-28 lg:w-full aspect-square bg-beige/30 flex items-center justify-center">
                                <span className="text-gray/30 text-3xl lg:text-4xl font-cjk">鮨</span>
                              </div>
                            )}

                            <div className="p-3 sm:p-3.5 lg:p-4 flex flex-col flex-1 min-w-0">
                              <h4 className="text-[15px] lg:text-[15px] font-medium lg:font-normal text-maroon leading-snug">
                                {itemName}
                              </h4>
                              {itemDesc && (
                                <p className="font-body text-[12px] text-ink/60 mt-0.5 lg:mt-1 leading-relaxed line-clamp-1 lg:line-clamp-2">
                                  {itemDesc}
                                </p>
                              )}
                              <AllergenBadges allergens={item.allergens} compact />

                              <div className="mt-auto pt-2 lg:pt-3 flex items-center justify-between gap-3 lg:flex-col lg:items-stretch">
                                <span className="text-[16px] font-light text-camel lg:block lg:mb-3 shrink-0">
                                  {formatPrice(item.price)}
                                  {itemHasOptions && (
                                    <span className="text-[10px] text-gray ml-1">+</span>
                                  )}
                                </span>
                                <div className="shrink-0 lg:w-full">
                                  {itemHasOptions ? (
                                    <button
                                      onClick={() => addToCart(item)}
                                      className="h-9 px-3 lg:px-0 lg:w-full bg-maroon text-white font-body text-[11px] tracking-[2px] uppercase border-none cursor-pointer transition-all duration-300 hover:bg-maroon-dark active:scale-[0.97] flex items-center justify-center gap-2"
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
                                    <div className="flex items-center justify-between border border-beige lg:w-full">
                                      <button
                                        onClick={() => decrementPlainItem(item.id)}
                                        aria-label="decrease quantity"
                                        className="w-9 h-9 lg:w-10 lg:h-9 text-maroon font-body text-base flex items-center justify-center cursor-pointer transition-colors hover:bg-beige/50 bg-transparent border-none"
                                      >−</button>
                                      <span className="font-body text-[14px] text-maroon font-medium px-2 min-w-[1.5rem] text-center">{plainQty}</span>
                                      <button
                                        onClick={() => addToCart(item)}
                                        aria-label="increase quantity"
                                        className="w-9 h-9 lg:w-10 lg:h-9 text-maroon font-body text-base flex items-center justify-center cursor-pointer transition-colors hover:bg-beige/50 bg-transparent border-none"
                                      >+</button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => addToCart(item)}
                                      className="h-9 px-3 lg:px-0 lg:w-full bg-maroon text-white font-body text-[11px] tracking-[2px] uppercase border-none cursor-pointer transition-all duration-300 hover:bg-maroon-dark active:scale-[0.97] flex items-center justify-center gap-2"
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
                <div className="bg-cream border border-beige">
                  <div className="p-6 pb-4 border-b border-beige">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[20px] font-light text-maroon">{t("cart")}</h3>
                      <div className="flex items-center gap-3">
                        {cart.length > 0 && (
                          <button
                            onClick={clearCart}
                            className="font-body text-[11px] tracking-[1px] uppercase text-gray hover:text-maroon transition-colors cursor-pointer bg-transparent border-none"
                          >
                            {t("clearCart")}
                          </button>
                        )}
                        {cartCount > 0 && (
                          <span className="bg-maroon text-white font-body text-[11px] w-6 h-6 flex items-center justify-center">{cartCount}</span>
                        )}
                      </div>
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
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream border-t border-beige shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
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
                  <div className="flex items-center gap-3">
                    {cart.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="font-body text-[11px] tracking-[1px] uppercase text-gray hover:text-maroon transition-colors cursor-pointer bg-transparent border-none"
                      >
                        {t("clearCart")}
                      </button>
                    )}
                    <button
                      onClick={() => setShowMobileCart(false)}
                      aria-label="close"
                      className="w-8 h-8 flex items-center justify-center text-gray hover:text-maroon cursor-pointer bg-transparent border-none text-xl"
                    >×</button>
                  </div>
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
                    aria-label="close"
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

                    {/* 自提地点 */}
                    <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-maroon/5 border border-maroon/20">
                      <p className="font-body text-[10px] tracking-[2px] uppercase text-camel mb-2">
                        {t("pickupAddressTitle")}
                      </p>
                      <p className="font-body text-[13px] text-maroon font-light leading-snug whitespace-pre-line mb-1.5">
                        {tFooter("address")}
                      </p>
                      <a
                        href={`tel:${tFooter("phone")}`}
                        className="font-body text-[13px] text-camel no-underline hover:text-maroon transition-colors"
                      >
                        {tFooter("phone")}
                      </a>
                    </div>

                    <div className="my-5 sm:my-6 p-3 sm:p-4 bg-cream border border-beige">
                      {cart.map((cartItem) => {
                        if (cartItem.kind === "setMeal") {
                          return (
                            <div key={`co-${cartItem.lineId}`} className="py-1.5">
                              <div className="flex justify-between font-body text-[13px] text-gray font-light">
                                <span className="truncate mr-2">
                                  {getLocalizedText(cartItem.setMealName, locale)} × {cartItem.quantity}
                                </span>
                                <span className="text-maroon shrink-0">
                                  {formatPrice(cartItem.unitPrice * cartItem.quantity)}
                                </span>
                              </div>
                              {cartItem.selections.length > 0 && (
                                <div className="pl-3 mt-0.5 font-body text-[11px] text-gray/70 font-light leading-snug">
                                  {formatSetMealSelectionSummary(cartItem.selections)}
                                </div>
                              )}
                            </div>
                          );
                        }
                        const item = getItem(cartItem);
                        if (!item) return null;
                        const unit = item.price + cartItem.priceModifier;
                        return (
                          <div
                            key={`co-${cartItem.lineId}`}
                            className="flex justify-between py-1.5 font-body text-[13px] text-gray font-light"
                          >
                            <span className="truncate mr-2">
                              {getName(item)} × {cartItem.quantity}
                            </span>
                            <span className="text-maroon shrink-0">
                              {formatPrice(unit * cartItem.quantity)}
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
                    {!hasAnySlot ? (
                      <p className="font-body text-[13px] text-gray font-light mb-6">
                        {t("closedToday")}
                      </p>
                    ) : (
                      <div
                        role="radiogroup"
                        aria-label={t("pickupTime")}
                        className="space-y-4 mb-6"
                      >
                        {(["lunch", "dinner"] as const).map((seg) => {
                          const slots = pickupSlots[seg];
                          if (slots.length === 0) return null;
                          const showAll = seg === "lunch" ? showAllLunch : showAllDinner;
                          const setShowAll = seg === "lunch" ? setShowAllLunch : setShowAllDinner;
                          // 已选时段在收起范围之外则强制展开，避免视觉上"丢失"
                          const selectedIdx = slots.indexOf(selectedPickupTime);
                          const forceExpand = selectedIdx >= SLOTS_DEFAULT_VISIBLE;
                          const visible = showAll || forceExpand ? slots : slots.slice(0, SLOTS_DEFAULT_VISIBLE);
                          const hidden = slots.length - visible.length;
                          return (
                            <div key={seg}>
                              <p className="font-body text-[10px] tracking-[2px] uppercase text-camel mb-2">
                                {seg === "lunch" ? t("pickupSlotLunch") : t("pickupSlotDinner")}
                              </p>
                              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                                {visible.map((slot) => (
                                  <button
                                    key={slot}
                                    role="radio"
                                    aria-checked={selectedPickupTime === slot}
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
                              {hidden > 0 && !forceExpand && (
                                <button
                                  onClick={() => setShowAll(!showAll)}
                                  className="mt-2 font-body text-[11px] tracking-[1px] uppercase text-camel hover:text-maroon transition-colors cursor-pointer bg-transparent border-none px-0"
                                >
                                  {showAll ? t("showLessSlots") : t("showMoreSlots", { count: hidden })}
                                </button>
                              )}
                            </div>
                          );
                        })}
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
                        rows={3}
                        className="w-full py-3.5 sm:py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray resize-none"
                        placeholder={t("orderNotes")}
                      />
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={orderStatus === "loading" || !hasAnySlot}
                      className="w-full mt-6 sm:mt-8 px-12 py-4 sm:py-[18px] bg-maroon text-white border-none font-heading text-[14px] sm:text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {orderStatus === "loading"
                        ? t("submitting")
                        : !hasAnySlot
                          ? t("closedToday")
                          : t("placeOrder")}
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

      {selectedSetMeal && (
        <SetMealSelector
          setMeal={selectedSetMeal}
          items={selectedSetMeal.id === DAILY_MENU_ID ? itemsWithDailyExtras : items}
          onClose={() => setSelectedSetMeal(null)}
          onConfirm={addSetMealToCart}
          enforceMaxChoices={selectedSetMeal.id === DAILY_MENU_ID}
        />
      )}
      </>
      )}
    </>
  );
}

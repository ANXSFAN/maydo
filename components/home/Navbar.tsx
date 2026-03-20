"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const mainNav = [
  { key: "home", href: "/" },
  { key: "menu", href: "/carta" },
  { key: "order", href: "/pedido" },
  { key: "reservations", href: "/reservas" },
  { key: "contact", href: "/contacto" },
] as const;

const moreNav = [
  { key: "giftCard", href: "/gift-card" },
  { key: "gallery", href: "/galeria" },
  { key: "about", href: "/sobre" },
] as const;

export default function Navbar() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const switchLocale = () => {
    const next = locale === "es" ? "zh" : "es";
    router.replace(pathname, { locale: next });
  };

  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: solid ? "rgba(92,46,46,0.95)" : "transparent",
        backdropFilter: solid ? "blur(20px)" : "none",
        borderBottom: solid
          ? "1px solid rgba(201,168,124,0.15)"
          : "1px solid transparent",
      }}
    >
      <div
        className="max-w-[1200px] mx-auto px-10 flex items-center justify-between transition-[height] duration-500"
        style={{ height: solid ? 70 : 90 }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center no-underline">
          <Image
            src="/images/logo.svg"
            alt="Sushi Maydo"
            width={44}
            height={44}
            className="brightness-0 invert"
          />
        </Link>

        {/* Hamburger - mobile */}
        <button
          className="md:hidden cursor-pointer bg-transparent border-none p-2 z-10"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span
            className="block w-6 h-[1.5px] bg-white my-[5px] transition-all"
            style={menuOpen ? { transform: "rotate(45deg) translate(4px,4px)" } : {}}
          />
          <span
            className="block w-6 h-[1.5px] bg-white my-[5px] transition-all"
            style={menuOpen ? { opacity: 0 } : {}}
          />
          <span
            className="block w-6 h-[1.5px] bg-white my-[5px] transition-all"
            style={menuOpen ? { transform: "rotate(-45deg) translate(4px,-4px)" } : {}}
          />
        </button>

        {/* Desktop nav */}
        <div
          className={`
            flex items-center gap-7
            max-md:hidden
            ${menuOpen ? "max-md:!flex max-md:flex-col max-md:absolute max-md:top-full max-md:left-0 max-md:right-0 max-md:p-[30px] max-md:gap-5 max-md:backdrop-blur-[20px]" : ""}
          `}
          style={menuOpen ? { background: "rgba(92,46,46,0.98)" } : undefined}
        >
          {/* Main links */}
          {mainNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="relative text-white no-underline text-[13px] tracking-[3px] uppercase font-body font-light transition-opacity hover:opacity-70 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-camel after:transition-[width] after:duration-300 hover:after:w-full"
            >
              {t(item.key)}
            </Link>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="bg-transparent border-none cursor-pointer p-1 transition-opacity hover:opacity-70 group"
              aria-label="More"
            >
              <svg
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="none"
                className="transition-transform duration-300"
              >
                {/* Top line - wavy */}
                <path
                  d="M2 2C6 2 7 0.5 12 0.5C17 0.5 18 2 22 2"
                  stroke={moreOpen ? "#C9A87C" : "white"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />
                {/* Middle line */}
                <line
                  x1="4" y1="8" x2="20" y2="8"
                  stroke={moreOpen ? "#C9A87C" : "white"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />
                {/* Bottom line */}
                <line
                  x1="6" y1="14" x2="18" y2="14"
                  stroke={moreOpen ? "#C9A87C" : "white"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />
              </svg>
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute top-full right-0 mt-3 min-w-[160px] py-2 border border-white/10 origin-top-right"
                  style={{ background: "rgba(92,46,46,0.98)", backdropFilter: "blur(20px)" }}
                >
                  {moreNav.map((item, i) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 + i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          setMoreOpen(false);
                          setMenuOpen(false);
                        }}
                        className="block px-5 py-2.5 text-white/70 no-underline text-[12px] tracking-[2px] uppercase font-body font-light transition-colors hover:text-camel hover:bg-white/5"
                      >
                        {t(item.key)}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language switch */}
          <button
            onClick={() => {
              switchLocale();
              setMenuOpen(false);
            }}
            className="bg-transparent border border-camel text-camel px-4 py-1.5 text-xs tracking-[2px] cursor-pointer font-body transition-all hover:bg-camel/10"
          >
            {t("langSwitch")}
          </button>
        </div>
      </div>
    </nav>
  );
}

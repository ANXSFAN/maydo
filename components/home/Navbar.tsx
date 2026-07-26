"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const mainNav = [
  { key: "home", href: "/" },
  { key: "menu", href: "/pedido" },
  { key: "reservations", href: "/reservas" },
  { key: "contact", href: "/contacto" },
] as const;

const moreNav = [
  { key: "events", href: "/eventos" },
  { key: "gallery", href: "/galeria" },
  { key: "about", href: "/sobre" },
] as const;

const allMobileNav = [...mainNav, ...moreNav];

export default function Navbar() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const localeLabels: Record<string, string> = {
    es: "Español",
    en: "English",
    ca: "Català",
    zh: "中文",
  };

  const switchToLocale = (next: string) => {
    router.replace(pathname, { locale: next });
    setLangOpen(false);
    setMenuOpen(false);
  };

  const isHome = pathname === "/";
  const solid = scrolled || !isHome || menuOpen;

  return (
    <>
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
          className="max-w-[1200px] mx-auto px-5 sm:px-10 flex items-center justify-between transition-[height] duration-500"
          style={{ height: solid ? 70 : 90 }}
        >
          {/* Logo + 门店名 —— 明确标示这是 Santa Eulàlia 分店 (2026-07 客户反馈) */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 no-underline min-w-0"
            aria-label={t("branchAria")}
          >
            <Image
              src="/images/logo.svg"
              alt="Sushi Maydo"
              width={44}
              height={44}
              className="brightness-0 invert shrink-0"
            />
            <span className="h-8 w-px bg-camel/30 shrink-0" />
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-body text-[9px] sm:text-[10px] tracking-[2.5px] uppercase text-white/50 whitespace-nowrap">
                Sushi Maydo
              </span>
              <span className="font-body text-[12px] sm:text-[13px] tracking-[1.5px] text-camel whitespace-nowrap">
                {t("branch")}
              </span>
            </span>
          </Link>

          {/* Mobile right side: WhatsApp + Hamburger */}
          <div className="md:hidden flex items-center gap-1 z-[60] relative">
            <a
              href="https://wa.me/34665128006"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("whatsappAria")}
              className="w-10 h-10 flex items-center justify-center text-white/85 hover:text-camel transition-colors no-underline"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[22px] h-[22px]"
              >
                <path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 21l1.6-4.5A8.5 8.5 0 1 1 20.5 12z" />
                <path d="M9.4 8.7c.3-.5.8-.5 1.1-.5h.4c.2 0 .5 0 .7.5l.8 1.9c.1.3 0 .6-.2.8l-.4.4a.4.4 0 0 0-.1.5 6 6 0 0 0 2.8 2.5c.2.1.4.1.5-.1l.4-.6c.2-.3.5-.4.8-.3l1.8 1c.3.1.5.4.4.7-.2.7-.6 1.3-1.3 1.5-.7.3-1.5.4-2.2.2a8 8 0 0 1-5.5-5.4 2.6 2.6 0 0 1 .2-2.1z" />
              </svg>
            </a>
            <button
              className="w-10 h-10 cursor-pointer bg-transparent border-none flex items-center justify-center text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? t("closeAria") : t("menuAria")}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="w-6 h-6"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="w-6 h-6"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {/* Main links */}
            {mainNav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
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
                  <path
                    d="M2 2C6 2 7 0.5 12 0.5C17 0.5 18 2 22 2"
                    stroke={moreOpen ? "#C9A87C" : "white"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="transition-colors duration-300"
                  />
                  <line
                    x1="4" y1="8" x2="20" y2="8"
                    stroke={moreOpen ? "#C9A87C" : "white"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="transition-colors duration-300"
                  />
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
                          onClick={() => setMoreOpen(false)}
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
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="bg-transparent border border-camel text-camel px-3 py-1.5 text-[11px] tracking-[1px] cursor-pointer font-body transition-all hover:bg-camel/10 flex items-center gap-1.5 whitespace-nowrap"
              >
                {localeLabels[locale]}
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}>
                  <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-2 min-w-[120px] py-1.5 border border-white/10 origin-top-right"
                    style={{ background: "rgba(92,46,46,0.98)", backdropFilter: "blur(20px)" }}
                  >
                    {Object.entries(localeLabels).map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => switchToLocale(code)}
                        className={`block w-full text-left px-4 py-2 text-[12px] tracking-[2px] font-body font-light transition-colors border-none cursor-pointer ${
                          code === locale
                            ? "text-camel bg-white/5"
                            : "text-white/70 hover:text-camel hover:bg-white/5 bg-transparent"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 z-[55] flex flex-col"
            style={{ background: "rgba(92,46,46,0.98)", backdropFilter: "blur(20px)" }}
          >
            {/* Spacer for navbar height */}
            <div className="h-[70px] shrink-0" />

            {/* Nav links */}
            <div className="flex-1 flex flex-col justify-center px-10 -mt-10">
              {allMobileNav.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-3.5 text-[20px] tracking-[4px] uppercase font-body font-light no-underline transition-colors ${
                      pathname === item.href
                        ? "text-camel"
                        : "text-white/80 active:text-camel"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                  {i < allMobileNav.length - 1 && (
                    <div className="h-px bg-white/8" />
                  )}
                </motion.div>
              ))}

              {/* Divider */}
              <div className="h-px bg-camel/20 my-5" />

              {/* Language switcher */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="grid grid-cols-2 gap-2.5 max-w-[300px]"
              >
                {Object.entries(localeLabels).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => switchToLocale(code)}
                    className={`px-3 py-2.5 text-[13px] tracking-[1px] font-body font-light border cursor-pointer transition-all text-center ${
                      code === locale
                        ? "border-camel text-camel bg-camel/10"
                        : "border-white/15 text-white/50 bg-transparent active:border-camel active:text-camel"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

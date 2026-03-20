"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

type FormStatus = "idle" | "loading" | "success" | "error";

export default function ContactoContent() {
  const t = useTranslations("Contacto");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = true;
    if (!message.trim()) newErrors.message = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setFormStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <section className="py-[clamp(60px,8vw,100px)] px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex gap-16 max-lg:flex-col">
          {/* Contact info + Map */}
          <FadeIn className="flex-1">
            {/* Info cards */}
            <div className="grid grid-cols-2 gap-6 mb-10 max-sm:grid-cols-1">
              {/* Address */}
              <div className="bg-white border border-beige p-7">
                <div className="w-10 h-10 border border-camel/30 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-camel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-light text-maroon mb-2">{t("addressLabel")}</h3>
                <p className="font-body text-[14px] text-gray font-light leading-relaxed whitespace-pre-line">
                  {t("address")}
                </p>
              </div>

              {/* Phone */}
              <div className="bg-white border border-beige p-7">
                <div className="w-10 h-10 border border-camel/30 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-camel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-light text-maroon mb-2">{t("phoneLabel")}</h3>
                <a href="tel:+34936844036" className="font-body text-[14px] text-gray font-light no-underline hover:text-maroon transition-colors">
                  +34 936 844 036
                </a>
              </div>

              {/* Email */}
              <div className="bg-white border border-beige p-7">
                <div className="w-10 h-10 border border-camel/30 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-camel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-light text-maroon mb-2">{t("emailLabel")}</h3>
                <a href="mailto:sushimaydobcnplazaeuropa@gmail.com" className="font-body text-[14px] text-gray font-light no-underline hover:text-maroon transition-colors break-all">
                  sushimaydobcnplazaeuropa@gmail.com
                </a>
              </div>

              {/* Hours */}
              <div className="bg-white border border-beige p-7">
                <div className="w-10 h-10 border border-camel/30 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-camel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-light text-maroon mb-2">{t("hoursLabel")}</h3>
                <p className="font-body text-[14px] text-gray font-light leading-relaxed">
                  {t("hours1")}<br />
                  {t("hours2")}<br />
                  {t("hours3")}
                </p>
              </div>
            </div>

            {/* Google Map */}
            <FadeIn delay={0.2}>
              <div className="w-full h-[400px] border border-beige overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2994.4!2d2.1275!3d41.3565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a498e5e2b1b5a1%3A0x4a1b2c3d4e5f6789!2sSushi%20Maydo!5e0!3m2!1ses!2ses!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sushi Maydo Location"
                />
              </div>
            </FadeIn>
          </FadeIn>

          {/* Contact form */}
          <FadeIn delay={0.15} className="w-[400px] shrink-0 max-lg:w-full">
            <div className="sticky top-[100px] bg-white border border-beige p-[clamp(24px,3vw,40px)]">
              <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-2">
                {t("formSub")}
              </p>
              <h3 className="text-[24px] font-light text-maroon mb-2">
                {t("formTitle")}
              </h3>
              <DiamondDivider />
              <p className="font-body text-[14px] text-gray font-light leading-relaxed mb-8">
                {t("formDesc")}
              </p>

              {/* Success / Error messages */}
              <AnimatePresence mode="wait">
                {formStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-5 bg-green-50 border border-green-200 text-center"
                  >
                    <div className="text-green-800 text-[16px] font-light mb-1">
                      {t("successTitle")}
                    </div>
                    <p className="font-body text-[13px] text-green-600 font-light">
                      {t("successMsg")}
                    </p>
                    <button
                      onClick={() => setFormStatus("idle")}
                      className="mt-3 px-6 py-2 bg-maroon text-white font-body text-[12px] tracking-[2px] uppercase border-none cursor-pointer hover:bg-maroon-dark transition-colors"
                    >
                      {t("sendAnother")}
                    </button>
                  </motion.div>
                )}
                {formStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-5 bg-red-50 border border-red-200 text-center"
                  >
                    <div className="text-red-800 text-[15px] font-light mb-1">
                      {t("errorTitle")}
                    </div>
                    <p className="font-body text-[13px] text-red-600 font-light">
                      {t("errorMsg")}
                    </p>
                    <button
                      onClick={() => setFormStatus("idle")}
                      className="mt-3 px-6 py-2 border border-red-300 text-red-700 font-body text-[12px] tracking-[1px] bg-transparent cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      {t("retry")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {formStatus !== "success" && (
                <>
                  <div className="space-y-0">
                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({ ...prev, name: false }));
                      }}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${
                        errors.name ? "border-b-red-400" : "border-b-beige"
                      }`}
                      placeholder={t("name")}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: false }));
                      }}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${
                        errors.email ? "border-b-red-400" : "border-b-beige"
                      }`}
                      placeholder={t("email")}
                    />
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        setErrors((prev) => ({ ...prev, message: false }));
                      }}
                      rows={4}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray resize-none ${
                        errors.message ? "border-b-red-400" : "border-b-beige"
                      }`}
                      placeholder={t("message")}
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={formStatus === "loading"}
                    className="w-full mt-8 px-12 py-[18px] bg-maroon text-white border-none font-heading text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {formStatus === "loading" ? t("sending") : t("send")}
                  </button>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

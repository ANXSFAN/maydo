"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

type FormStatus = "idle" | "loading" | "success" | "error";

const PRESET_AMOUNTS = [25, 50, 75, 100];

export default function GiftCardContent() {
  const t = useTranslations("GiftCard");

  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sendDate, setSendDate] = useState("");

  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [giftCode, setGiftCode] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const finalAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;

  const validate = () => {
    const errs: Record<string, boolean> = {};
    if (!senderName.trim()) errs.senderName = true;
    if (!senderEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail))
      errs.senderEmail = true;
    if (!recipientName.trim()) errs.recipientName = true;
    if (!recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail))
      errs.recipientEmail = true;
    if (finalAmount < 10 || finalAmount > 500) errs.amount = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormStatus("loading");

    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          sender_name: senderName.trim(),
          sender_email: senderEmail.trim(),
          recipient_name: recipientName.trim(),
          recipient_email: recipientEmail.trim(),
          message: message.trim() || null,
          send_date: sendDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setGiftCode(data.code);
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  };

  const resetForm = () => {
    setFormStatus("idle");
    setGiftCode("");
    setSenderName("");
    setSenderEmail("");
    setRecipientName("");
    setRecipientEmail("");
    setMessage("");
    setSendDate("");
    setSelectedAmount(50);
    setCustomAmount("");
    setIsCustom(false);
    setErrors({});
  };

  return (
    <section className="py-[clamp(60px,8vw,100px)] px-10 bg-cream">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex gap-16 max-lg:flex-col">
          {/* Form */}
          <FadeIn className="flex-1">
            <div className="bg-white border border-beige p-[clamp(28px,4vw,56px)]">
              <AnimatePresence mode="wait">
                {formStatus === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                      </svg>
                    </div>
                    <h3 className="text-[24px] font-light text-maroon mb-2">
                      {t("successTitle")}
                    </h3>
                    {giftCode && (
                      <div className="mb-4">
                        <span className="font-body text-[11px] tracking-[3px] uppercase text-camel">
                          {t("codeLabel")}
                        </span>
                        <div className="text-[28px] font-light text-maroon tracking-[4px] mt-1 font-body">
                          {giftCode}
                        </div>
                      </div>
                    )}
                    <p className="font-body text-[14px] text-gray font-light mb-2">
                      {t("successMsg")}
                    </p>
                    <p className="font-body text-[13px] text-camel font-light mb-6">
                      {t("paymentNote")}
                    </p>
                    <button
                      onClick={resetForm}
                      className="px-8 py-3 bg-maroon text-white font-body text-[13px] tracking-[2px] uppercase border-none cursor-pointer hover:bg-maroon-dark transition-colors"
                    >
                      {t("buyAnother")}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {formStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 text-center"
                      >
                        <p className="font-body text-[14px] text-red-700 font-light">
                          {t("errorMsg")}
                        </p>
                      </motion.div>
                    )}

                    {/* Amount selection */}
                    <div className="mb-10">
                      <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-4">
                        {t("selectAmount")}
                        {errors.amount && (
                          <span className="text-red-500 ml-2 normal-case tracking-normal">
                            *{t("amountError")}
                          </span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {PRESET_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            onClick={() => {
                              setSelectedAmount(amt);
                              setIsCustom(false);
                              setErrors((e) => ({ ...e, amount: false }));
                            }}
                            className={`
                              px-6 py-4 border text-[18px] font-light transition-all duration-300 cursor-pointer
                              ${
                                !isCustom && selectedAmount === amt
                                  ? "bg-maroon border-maroon text-white"
                                  : "bg-transparent border-beige text-maroon hover:border-maroon"
                              }
                            `}
                          >
                            {amt}€
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setIsCustom(true);
                            setErrors((e) => ({ ...e, amount: false }));
                          }}
                          className={`
                            px-6 py-4 border text-[14px] font-body font-light transition-all duration-300 cursor-pointer
                            ${
                              isCustom
                                ? "bg-maroon border-maroon text-white"
                                : "bg-transparent border-beige text-maroon hover:border-maroon"
                            }
                          `}
                        >
                          {t("custom")}
                        </button>
                      </div>
                      {isCustom && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={10}
                              max={500}
                              value={customAmount}
                              onChange={(e) => {
                                setCustomAmount(e.target.value);
                                setErrors((prev) => ({ ...prev, amount: false }));
                              }}
                              className="w-32 py-3 border-0 border-b border-beige bg-transparent font-body text-[20px] text-maroon outline-none transition-colors focus:border-b-maroon text-center"
                              placeholder="0"
                            />
                            <span className="text-[20px] font-light text-maroon">€</span>
                          </div>
                          <p className="font-body text-[12px] text-gray mt-2 font-light">
                            {t("amountRange")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sender info */}
                    <div className="mb-8">
                      <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-4">
                        {t("fromLabel")}
                      </label>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0 max-sm:grid-cols-1">
                        <input
                          value={senderName}
                          onChange={(e) => { setSenderName(e.target.value); setErrors((p) => ({ ...p, senderName: false })); }}
                          className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${errors.senderName ? "border-b-red-400" : "border-b-beige"}`}
                          placeholder={t("yourName")}
                        />
                        <input
                          type="email"
                          value={senderEmail}
                          onChange={(e) => { setSenderEmail(e.target.value); setErrors((p) => ({ ...p, senderEmail: false })); }}
                          className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${errors.senderEmail ? "border-b-red-400" : "border-b-beige"}`}
                          placeholder={t("yourEmail")}
                        />
                      </div>
                    </div>

                    {/* Recipient info */}
                    <div className="mb-8">
                      <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-4">
                        {t("toLabel")}
                      </label>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0 max-sm:grid-cols-1">
                        <input
                          value={recipientName}
                          onChange={(e) => { setRecipientName(e.target.value); setErrors((p) => ({ ...p, recipientName: false })); }}
                          className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${errors.recipientName ? "border-b-red-400" : "border-b-beige"}`}
                          placeholder={t("recipientName")}
                        />
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => { setRecipientEmail(e.target.value); setErrors((p) => ({ ...p, recipientEmail: false })); }}
                          className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${errors.recipientEmail ? "border-b-red-400" : "border-b-beige"}`}
                          placeholder={t("recipientEmail")}
                        />
                      </div>
                    </div>

                    {/* Message & send date */}
                    <div className="mb-8">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        maxLength={200}
                        className="w-full py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray resize-none"
                        placeholder={t("personalMessage")}
                      />
                      <div className="flex items-center gap-4 mt-4">
                        <label className="font-body text-[13px] text-gray font-light shrink-0">
                          {t("sendOn")}
                        </label>
                        <input
                          type="date"
                          value={sendDate}
                          onChange={(e) => setSendDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="py-2 border-0 border-b border-beige bg-transparent font-body text-[14px] text-ink outline-none transition-colors focus:border-b-maroon"
                        />
                        <span className="font-body text-[12px] text-gray font-light">
                          {t("sendOnHint")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={formStatus === "loading"}
                      className="w-full mt-4 px-12 py-[18px] bg-maroon text-white border-none font-heading text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {formStatus === "loading" ? t("submitting") : t("purchase")}
                    </button>
                    <p className="font-body text-xs text-gray text-center mt-4 font-light">
                      {t("paymentNote")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Preview card */}
          <FadeIn delay={0.2} className="w-[360px] shrink-0 max-lg:w-full">
            <div className="sticky top-[100px]">
              <div className="bg-gradient-to-br from-maroon-dark to-maroon p-8 text-white relative overflow-hidden">
                {/* Decorative pattern */}
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="absolute top-4 right-4 text-[80px] font-light text-white/[0.06] font-cjk select-none leading-none">
                  贈
                </div>

                <div className="relative z-[2]">
                  <div className="font-body text-[10px] tracking-[4px] uppercase text-camel mb-6">
                    {t("previewLabel")}
                  </div>

                  <div className="text-[42px] font-light leading-none mb-1">
                    {finalAmount > 0 ? `${finalAmount}€` : "—€"}
                  </div>
                  <div className="font-body text-[12px] text-white/50 tracking-[2px] uppercase mb-8">
                    SUSHI MAYDO
                  </div>

                  <DiamondDivider className="text-camel/40" />

                  <div className="mt-6 space-y-3">
                    {recipientName && (
                      <div>
                        <div className="font-body text-[10px] tracking-[2px] uppercase text-camel/70">
                          {t("forLabel")}
                        </div>
                        <div className="font-body text-[15px] text-white/80 font-light">
                          {recipientName}
                        </div>
                      </div>
                    )}
                    {senderName && (
                      <div>
                        <div className="font-body text-[10px] tracking-[2px] uppercase text-camel/70">
                          {t("fromPreview")}
                        </div>
                        <div className="font-body text-[15px] text-white/80 font-light">
                          {senderName}
                        </div>
                      </div>
                    )}
                    {message && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="font-body text-[14px] text-white/60 font-light italic leading-relaxed">
                          &ldquo;{message}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white border border-beige p-6">
                <h4 className="text-[16px] font-light text-maroon mb-3">
                  {t("howItWorks")}
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-camel/10 text-camel font-body text-[12px] flex items-center justify-center shrink-0">1</span>
                    <p className="font-body text-[13px] text-gray font-light">{t("step1")}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-camel/10 text-camel font-body text-[12px] flex items-center justify-center shrink-0">2</span>
                    <p className="font-body text-[13px] text-gray font-light">{t("step2")}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-camel/10 text-camel font-body text-[12px] flex items-center justify-center shrink-0">3</span>
                    <p className="font-body text-[13px] text-gray font-light">{t("step3")}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

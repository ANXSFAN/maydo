"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

type FormStatus = "idle" | "loading" | "success" | "error";

const EVENT_TYPES = ["corporate", "birthday", "wedding", "anniversary", "graduation", "group", "buyout", "other"] as const;
const EVENT_TIMES = ["lunch", "dinner", "fullDay"] as const;
const VENUE_TYPES = ["table", "section", "buyout"] as const;
const BUDGET_TIERS = ["under500", "500to1000", "1000to2500", "2500to5000", "over5000"] as const;

export default function EventosContent() {
  const t = useTranslations("Eventos");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDateAlt, setEventDateAlt] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [guests, setGuests] = useState("");
  const [venueType, setVenueType] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = true;
    if (!phone.trim()) newErrors.phone = true;
    if (!eventType) newErrors.eventType = true;
    if (!guests.trim()) newErrors.guests = true;
    if (!message.trim()) newErrors.message = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setOrganization("");
    setEventType("");
    setEventDate("");
    setEventDateAlt("");
    setEventTime("");
    setGuests("");
    setVenueType("");
    setBudget("");
    setMessage("");
    setErrors({});
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
          type: "event",
          eventDetails: {
            phone: phone.trim(),
            organization: organization.trim() || undefined,
            eventType: eventType ? t(`type_${eventType}`) : undefined,
            date: eventDate || undefined,
            dateAlt: eventDateAlt || undefined,
            eventTime: eventTime ? t(`time_${eventTime}`) : undefined,
            guests: guests.trim() || undefined,
            venueType: venueType ? t(`venue_${venueType}`) : undefined,
            budget: budget ? t(`budget_${budget}`) : undefined,
          },
        }),
      });

      if (res.ok) {
        setFormStatus("success");
        resetForm();
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    }
  };

  const features = [
    { icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", titleKey: "feat1Title", descKey: "feat1Desc" },
    { icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z", titleKey: "feat2Title", descKey: "feat2Desc" },
    { icon: "M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z", titleKey: "feat3Title", descKey: "feat3Desc" },
    { icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z M16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z", titleKey: "feat4Title", descKey: "feat4Desc" },
  ];

  return (
    <section className="py-[clamp(60px,8vw,100px)] px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex gap-16 max-lg:flex-col">
          {/* Left: features + intro */}
          <FadeIn className="flex-1">
            <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-3">
              {t("introSub")}
            </p>
            <h2 className="text-[clamp(26px,3.4vw,36px)] font-light text-maroon leading-tight mb-4">
              {t("introTitle")}
            </h2>
            <DiamondDivider />
            <p className="font-body text-[15px] text-gray font-light leading-relaxed mt-4 mb-10">
              {t("introDesc")}
            </p>

            <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
              {features.map((f) => (
                <div key={f.titleKey} className="bg-white border border-beige p-6">
                  <div className="w-10 h-10 border border-camel/30 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-camel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-[16px] font-light text-maroon mb-2 leading-snug">
                    {t(f.titleKey)}
                  </h3>
                  <p className="font-body text-[13px] text-gray font-light leading-relaxed">
                    {t(f.descKey)}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick contact card */}
            <div className="mt-10 bg-maroon text-white p-7 border border-maroon">
              <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-3">
                {t("directSub")}
              </p>
              <h3 className="text-[20px] font-light mb-4">
                {t("directTitle")}
              </h3>
              <div className="space-y-2">
                <a href="tel:+34665128006" className="block font-body text-[14px] text-white/80 no-underline hover:text-camel transition-colors">
                  📞 +34 665 128 006
                </a>
                <a href="mailto:sushimaydobcnplazaeuropa@gmail.com" className="block font-body text-[14px] text-white/80 no-underline hover:text-camel transition-colors break-all">
                  ✉️ sushimaydobcnplazaeuropa@gmail.com
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Right: form */}
          <FadeIn delay={0.15} className="w-[440px] shrink-0 max-lg:w-full">
            <div className="sticky top-[100px] bg-white border border-beige p-[clamp(24px,3vw,40px)]">
              <p className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-2">
                {t("formSub")}
              </p>
              <h3 className="text-[24px] font-light text-maroon mb-2">
                {t("formTitle")}
              </h3>
              <DiamondDivider />
              <p className="font-body text-[13px] text-gray font-light leading-relaxed mt-3 mb-6">
                {t("formDesc")}
              </p>

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
                      autoComplete="name"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: false })); }}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none focus:border-b-maroon placeholder:text-gray ${errors.name ? "border-b-red-400" : "border-b-beige"}`}
                      placeholder={t("name")}
                    />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: false })); }}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none focus:border-b-maroon placeholder:text-gray ${errors.email ? "border-b-red-400" : "border-b-beige"}`}
                      placeholder={t("email")}
                    />
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: false })); }}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none focus:border-b-maroon placeholder:text-gray ${errors.phone ? "border-b-red-400" : "border-b-beige"}`}
                      placeholder={t("phone")}
                    />
                    <input
                      autoComplete="organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full py-4 border-0 border-b border-b-beige bg-transparent font-body text-[15px] text-ink outline-none focus:border-b-maroon placeholder:text-gray"
                      placeholder={t("organization")}
                    />
                    <select
                      value={eventType}
                      onChange={(e) => { setEventType(e.target.value); setErrors((p) => ({ ...p, eventType: false })); }}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] outline-none focus:border-b-maroon appearance-none cursor-pointer ${
                        errors.eventType ? "border-b-red-400" : "border-b-beige"
                      } ${eventType ? "text-ink" : "text-gray"}`}
                    >
                      <option value="">{t("eventType")}</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>{t(`type_${type}`)}</option>
                      ))}
                    </select>
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block font-body text-[10px] tracking-[2px] uppercase text-camel pt-3">
                          {t("eventDate")}
                        </label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full pt-1 pb-3 border-0 border-b border-b-beige bg-transparent font-body text-[15px] text-ink outline-none focus:border-b-maroon"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block font-body text-[10px] tracking-[2px] uppercase text-camel pt-3">
                          {t("eventDateAlt")}
                        </label>
                        <input
                          type="date"
                          value={eventDateAlt}
                          onChange={(e) => setEventDateAlt(e.target.value)}
                          className="w-full pt-1 pb-3 border-0 border-b border-b-beige bg-transparent font-body text-[15px] text-ink outline-none focus:border-b-maroon"
                        />
                      </div>
                    </div>
                    <select
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className={`w-full py-4 border-0 border-b border-b-beige bg-transparent font-body text-[15px] outline-none focus:border-b-maroon appearance-none cursor-pointer ${eventTime ? "text-ink" : "text-gray"}`}
                    >
                      <option value="">{t("eventTime")}</option>
                      {EVENT_TIMES.map((tk) => (
                        <option key={tk} value={tk}>{t(`time_${tk}`)}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) => { setGuests(e.target.value); setErrors((p) => ({ ...p, guests: false })); }}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none focus:border-b-maroon placeholder:text-gray ${errors.guests ? "border-b-red-400" : "border-b-beige"}`}
                      placeholder={t("guests")}
                    />
                    <select
                      value={venueType}
                      onChange={(e) => setVenueType(e.target.value)}
                      className={`w-full py-4 border-0 border-b border-b-beige bg-transparent font-body text-[15px] outline-none focus:border-b-maroon appearance-none cursor-pointer ${venueType ? "text-ink" : "text-gray"}`}
                    >
                      <option value="">{t("venueType")}</option>
                      {VENUE_TYPES.map((v) => (
                        <option key={v} value={v}>{t(`venue_${v}`)}</option>
                      ))}
                    </select>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className={`w-full py-4 border-0 border-b border-b-beige bg-transparent font-body text-[15px] outline-none focus:border-b-maroon appearance-none cursor-pointer ${budget ? "text-ink" : "text-gray"}`}
                    >
                      <option value="">{t("budget")}</option>
                      {BUDGET_TIERS.map((b) => (
                        <option key={b} value={b}>{t(`budget_${b}`)}</option>
                      ))}
                    </select>
                    <textarea
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: false })); }}
                      rows={4}
                      className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none focus:border-b-maroon placeholder:text-gray resize-none ${errors.message ? "border-b-red-400" : "border-b-beige"}`}
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
                  <p className="font-body text-[11px] text-gray text-center mt-3 font-light">
                    {t("responseTime")}
                  </p>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import DiamondDivider from "@/components/ui/DiamondDivider";

type Period = "lunch" | "dinner";
type FormStatus = "idle" | "loading" | "success" | "error";

const LUNCH_SLOTS = ["13:00", "13:30", "14:00", "14:30", "15:00"];
const DINNER_SLOTS = ["20:30", "21:00", "21:30", "22:00", "22:30"];
const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ReservasContent() {
  const t = useTranslations("Reservas");
  const [period, setPeriod] = useState<Period>("lunch");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const slots = period === "lunch" ? LUNCH_SLOTS : DINNER_SLOTS;

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = true;
    if (!phone.trim()) newErrors.phone = true;
    if (!date) newErrors.date = true;
    if (!selectedTime) newErrors.time = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormStatus("loading");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date,
          time: selectedTime,
          guests,
          period,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setFormStatus("success");
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setDate("");
      setNotes("");
      setSelectedTime("");
      setGuests(2);
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <section className="py-[clamp(60px,8vw,100px)] px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex gap-16 max-lg:flex-col">
          {/* Form */}
          <FadeIn className="flex-1">
            <div className="bg-white border border-beige p-[clamp(28px,4vw,56px)]">
              {/* Success / Error messages */}
              <AnimatePresence mode="wait">
                {formStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8 p-5 bg-green-50 border border-green-200 text-center"
                  >
                    <div className="text-green-800 text-[18px] font-light mb-1">
                      {t("successTitle")}
                    </div>
                    <p className="font-body text-[14px] text-green-600 font-light">
                      {t("successMsg")}
                    </p>
                    <button
                      onClick={() => setFormStatus("idle")}
                      className="mt-3 px-6 py-2 bg-maroon text-white font-body text-[13px] tracking-[2px] uppercase border-none cursor-pointer hover:bg-maroon-dark transition-colors"
                    >
                      {t("newReservation")}
                    </button>
                  </motion.div>
                )}
                {formStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8 p-5 bg-red-50 border border-red-200 text-center"
                  >
                    <div className="text-red-800 text-[16px] font-light mb-1">
                      {t("errorTitle")}
                    </div>
                    <p className="font-body text-[14px] text-red-600 font-light">
                      {t("errorMsg")}
                    </p>
                    <button
                      onClick={() => setFormStatus("idle")}
                      className="mt-3 px-6 py-2 border border-red-300 text-red-700 font-body text-[13px] tracking-[1px] bg-transparent cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      {t("retry")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {formStatus !== "success" && (
                <>
                  {/* Period selection */}
                  <div className="mb-10">
                    <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-4">
                      {t("selectPeriod")}
                    </label>
                    <div className="flex gap-4">
                      {(["lunch", "dinner"] as Period[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setPeriod(p);
                            setSelectedTime("");
                          }}
                          className={`
                            flex-1 py-4 px-6 border text-center transition-all duration-300 cursor-pointer
                            ${
                              period === p
                                ? "bg-maroon border-maroon text-white"
                                : "bg-transparent border-beige text-maroon hover:border-maroon"
                            }
                          `}
                        >
                          <div className="text-[18px] font-light">{t(p)}</div>
                          <div
                            className={`font-body text-[12px] mt-1 ${
                              period === p ? "text-white/60" : "text-gray"
                            }`}
                          >
                            {t(`${p}Hours`)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="mb-10">
                    <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-4">
                      {t("selectTime")}
                      {errors.time && (
                        <span className="text-red-500 ml-2 normal-case tracking-normal">
                          *{t("required")}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot);
                            setErrors((e) => ({ ...e, time: false }));
                          }}
                          className={`
                            px-5 py-3 border text-[15px] font-body font-light transition-all duration-300 cursor-pointer
                            ${
                              selectedTime === slot
                                ? "bg-maroon border-maroon text-white"
                                : errors.time
                                  ? "bg-transparent border-red-300 text-maroon hover:border-maroon"
                                  : "bg-transparent border-beige text-maroon hover:border-maroon"
                            }
                          `}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guest count */}
                  <div className="mb-10">
                    <label className="font-body text-[11px] tracking-[3px] uppercase text-camel block mb-4">
                      {t("selectGuests")}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {GUEST_OPTIONS.map((n) => (
                        <button
                          key={n}
                          onClick={() => setGuests(n)}
                          className={`
                            w-12 h-12 border text-[16px] font-light transition-all duration-300 cursor-pointer
                            ${
                              guests === n
                                ? "bg-maroon border-maroon text-white"
                                : "bg-transparent border-beige text-maroon hover:border-maroon"
                            }
                          `}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => setGuests(9)}
                        className={`
                          px-5 h-12 border text-[14px] font-body font-light transition-all duration-300 cursor-pointer
                          ${
                            guests === 9
                              ? "bg-maroon border-maroon text-white"
                              : "bg-transparent border-beige text-maroon hover:border-maroon"
                          }
                        `}
                      >
                        9+
                      </button>
                    </div>
                  </div>

                  {/* Contact fields */}
                  <div className="grid grid-cols-2 gap-x-[30px] gap-y-0 mb-6 max-sm:grid-cols-1">
                    <div className="col-span-2 max-sm:col-span-1">
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
                    </div>
                    <div>
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
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setErrors((prev) => ({ ...prev, phone: false }));
                        }}
                        className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${
                          errors.phone ? "border-b-red-400" : "border-b-beige"
                        }`}
                        placeholder={t("phone")}
                      />
                    </div>
                    <div className="col-span-2 max-sm:col-span-1">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setErrors((prev) => ({ ...prev, date: false }));
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full py-4 border-0 border-b bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray ${
                          errors.date ? "border-b-red-400" : "border-b-beige"
                        }`}
                      />
                    </div>
                    <div className="col-span-2 max-sm:col-span-1">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full py-4 border-0 border-b border-beige bg-transparent font-body text-[15px] text-ink outline-none transition-colors focus:border-b-maroon placeholder:text-gray resize-none"
                        placeholder={t("notes")}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={formStatus === "loading"}
                    className="w-full mt-4 px-12 py-[18px] bg-maroon text-white border-none font-heading text-base tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-maroon-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,66,66,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {formStatus === "loading" ? t("submitting") : t("btn")}
                  </button>
                  <p className="font-body text-xs text-gray text-center mt-4 font-light">
                    {t("confirmation")}
                  </p>
                </>
              )}
            </div>
          </FadeIn>

          {/* Info sidebar */}
          <FadeIn delay={0.2} className="w-[340px] shrink-0 max-lg:w-full">
            <div className="sticky top-[100px]">
              {/* Hours card */}
              <div className="bg-maroon p-8 text-white mb-6">
                <h3 className="text-[22px] font-light mb-5">
                  {t("hoursTitle")}
                </h3>
                <DiamondDivider className="text-camel/50" />

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-2">
                      {t("lunchLabel")}
                    </div>
                    <div className="font-body text-[15px] text-white/80 font-light">
                      {t("lunchHoursDetail")}
                    </div>
                    <div className="font-body text-[13px] text-white/50 font-light mt-1">
                      {t("lunchDays")}
                    </div>
                  </div>
                  <div className="w-full h-px bg-white/10" />
                  <div>
                    <div className="font-body text-[11px] tracking-[3px] uppercase text-camel mb-2">
                      {t("dinnerLabel")}
                    </div>
                    <div className="font-body text-[15px] text-white/80 font-light">
                      {t("dinnerHoursDetail")}
                    </div>
                    <div className="font-body text-[13px] text-white/50 font-light mt-1">
                      {t("dinnerDays")}
                    </div>
                  </div>
                  <div className="w-full h-px bg-white/10" />
                  <div className="font-body text-[13px] text-white/40 font-light">
                    {t("closed")}
                  </div>
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-white border border-beige p-8">
                <h3 className="text-[18px] font-light text-maroon mb-4">
                  {t("contactTitle")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-camel mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    <span className="font-body text-[14px] text-gray font-light">
                      +34 936 844 036
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-camel mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    <span className="font-body text-[13px] text-gray font-light break-all">
                      sushimaydobcnplazaeuropa@gmail.com
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-camel mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <span className="font-body text-[14px] text-gray font-light">
                      {t("address")}
                    </span>
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

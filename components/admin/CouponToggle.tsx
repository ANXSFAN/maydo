"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: "coupon", id, status: active ? "inactive" : "active" }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${
        active ? "bg-emerald-500" : "bg-gray-300"
      } disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          active ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

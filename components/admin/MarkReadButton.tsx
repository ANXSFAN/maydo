"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminLang } from "./AdminLangContext";

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const { t } = useAdminLang();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: "contact", id, field: "read" }),
    });
    router.refresh();
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-3 py-1.5 text-[12px] text-blue-600 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : t("markRead")}
    </button>
  );
}

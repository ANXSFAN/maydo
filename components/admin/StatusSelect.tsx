"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  table: string;
  id: string;
  currentStatus: string;
  options: string[];
};

export default function StatusSelect({ table, id, currentStatus, options }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setLoading(true);
    await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id, status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="text-[12px] px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-400 cursor-pointer disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

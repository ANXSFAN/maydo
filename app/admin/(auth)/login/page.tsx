"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-light tracking-[6px] text-white mb-2">MAYDO</h1>
          <p className="text-[12px] tracking-[3px] uppercase text-white/30">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-lg">
          <label className="text-[11px] tracking-[2px] uppercase text-white/50 block mb-3">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className={`w-full px-4 py-3.5 bg-white/5 border rounded-lg text-white text-[15px] outline-none transition-colors placeholder:text-white/20 ${
              error ? "border-red-400/50" : "border-white/10 focus:border-[#C9A87C]/50"
            }`}
            placeholder="••••••••••"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-[13px] mt-2">Contraseña incorrecta</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-6 py-3.5 bg-[#C9A87C] text-[#1a1a2e] text-[13px] font-medium tracking-[2px] uppercase rounded-lg border-none cursor-pointer transition-all hover:bg-[#D4B896] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Accediendo..." : "Acceder"}
          </button>
        </form>
      </div>
    </div>
  );
}

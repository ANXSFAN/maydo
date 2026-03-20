"use client";

import { useAdminLang } from "./AdminLangContext";
import MarkReadButton from "./MarkReadButton";

type Contact = {
  id: string; name: string; email: string;
  message: string; read: boolean; createdAt: string;
};

export default function ContactsClient({ contacts }: { contacts: Contact[] }) {
  const { t } = useAdminLang();
  const unread = contacts.filter((c) => !c.read).length;

  const fmtDT = (s: string) =>
    new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-gray-900">{t("messagesTitle")}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{t("messagesCount", { count: contacts.length, unread })}</p>
      </div>

      <div className="space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${c.read ? "border-gray-100" : "border-l-4 border-l-blue-500 border-gray-100"}`}>
            <div className="px-6 py-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-[15px] font-semibold text-gray-900">{c.name}</h3>
                    {!c.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <div className="text-[13px] text-gray-400 mt-0.5">
                    <a href={`mailto:${c.email}`} className="text-blue-600 no-underline hover:underline">{c.email}</a>
                    <span className="mx-2">·</span>{fmtDT(c.createdAt)}
                  </div>
                </div>
                {!c.read && <MarkReadButton id={c.id} />}
              </div>
              <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{c.message}</p>
            </div>
          </div>
        ))}
        {contacts.length === 0 && <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">{t("noMessagesYet")}</div>}
      </div>
    </>
  );
}

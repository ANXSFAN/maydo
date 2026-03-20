import Sidebar from "@/components/admin/Sidebar";
import { AdminLangProvider } from "@/components/admin/AdminLangContext";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <AdminLangProvider>
        <Sidebar />
        <main className="ml-[240px]">
          <div className="p-8">{children}</div>
        </main>
      </AdminLangProvider>
    </div>
  );
}

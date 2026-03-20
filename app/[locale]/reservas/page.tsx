import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import ReservasContent from "@/components/reservas/ReservasContent";
import { useTranslations } from "next-intl";

export default function ReservasPage() {
  const t = useTranslations("Reservas");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="席"
      />
      <ReservasContent />
      <Footer />
    </>
  );
}

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import EventosContent from "@/components/eventos/EventosContent";
import { useTranslations } from "next-intl";

export default function EventosPage() {
  const t = useTranslations("Eventos");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="宴"
      />
      <EventosContent />
      <Footer />
    </>
  );
}

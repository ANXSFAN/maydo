import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import GaleriaContent from "@/components/galeria/GaleriaContent";
import { useTranslations } from "next-intl";

export default function GaleriaPage() {
  const t = useTranslations("Galeria");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="美"
      />
      <GaleriaContent />
      <Footer />
    </>
  );
}

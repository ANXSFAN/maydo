import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import SobreContent from "@/components/sobre/SobreContent";
import { useTranslations } from "next-intl";

export default function SobrePage() {
  const t = useTranslations("Sobre");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="心"
      />
      <SobreContent />
      <Footer />
    </>
  );
}

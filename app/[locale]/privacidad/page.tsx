import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import PrivacyContent from "@/components/ui/PrivacyContent";
import { useTranslations } from "next-intl";

export default function PrivacidadPage() {
  const t = useTranslations("Privacy");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="守"
      />
      <PrivacyContent />
      <Footer />
    </>
  );
}

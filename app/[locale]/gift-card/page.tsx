import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import GiftCardContent from "@/components/gift-card/GiftCardContent";
import { useTranslations } from "next-intl";

export default function GiftCardPage() {
  const t = useTranslations("GiftCard");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="贈"
      />
      <GiftCardContent />
      <Footer />
    </>
  );
}

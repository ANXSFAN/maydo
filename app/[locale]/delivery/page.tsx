import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import DeliveryContent from "@/components/delivery/DeliveryContent";
import { useTranslations } from "next-intl";

export default function DeliveryPage() {
  const t = useTranslations("Delivery");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="届"
      />
      <DeliveryContent />
      <Footer />
    </>
  );
}

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import CartaContent from "@/components/carta/CartaContent";
import { useTranslations } from "next-intl";

export default function CartaPage() {
  const t = useTranslations("Carta");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="鮮"
      />
      <CartaContent />
      <Footer />
    </>
  );
}

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PageHero from "@/components/ui/PageHero";
import ContactoContent from "@/components/contacto/ContactoContent";
import { useTranslations } from "next-intl";

export default function ContactoPage() {
  const t = useTranslations("Contacto");

  return (
    <>
      <Navbar />
      <PageHero
        sub={t("sub")}
        title={t("title")}
        desc={t("heroDesc")}
        kanji="繋"
      />
      <ContactoContent />
      <Footer />
    </>
  );
}

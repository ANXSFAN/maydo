import { prisma } from "@/lib/prisma";
import ContactsClient from "@/components/admin/ContactsClient";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <ContactsClient
      contacts={contacts.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}

import { Suspense } from "react";
import { getClients } from "@/server/actions/client-actions";
import { ClientDirectoryClient } from "./ClientDirectoryClient";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Client Directory | Law Firm OS",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clients = await getClients();

  // Transform data for the grid
  const transformedClients = clients.map(client => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone || "Not provided",
    activeMatters: client._count.cases,
    joinedDate: client.created_at.toISOString(),
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Directory...</div>}>
      <ClientDirectoryClient data={transformedClients} />
    </Suspense>
  );
}

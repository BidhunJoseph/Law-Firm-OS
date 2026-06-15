import { Suspense } from "react";
import { getClientDetails } from "@/server/actions/client-actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientProfileClient } from "./ClientProfileClient";

export const metadata = {
  title: "Client Profile | Law Firm OS",
};

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { client, documents } = await getClientDetails(id);

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Client Profile...</div>}>
      <ClientProfileClient client={client} documents={documents} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { TeamClient } from "./TeamClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Double check manager role
  const profile = await db.profile.findUnique({
    where: { id: user.id }
  });

  if (profile?.role !== "admin") {
    // Or whatever role denotes manager
    redirect("/");
  }

  const teamMembers = await db.profile.findMany({
    orderBy: { created_at: "desc" }
  });

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Team Administration</h1>
          <p className="text-sm text-gray-500 mt-1">Manage lawyers, paralegals, and administrative staff.</p>
        </div>
      </div>

      <TeamClient initialData={teamMembers} />
    </div>
  );
}

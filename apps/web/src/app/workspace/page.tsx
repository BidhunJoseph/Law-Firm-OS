import { getWorkspaceTasks } from "@/server/actions/workspace-actions";
import { getCases } from "@/server/actions/case-actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

import ManagerWorkspace from "./components/ManagerWorkspace";
import LawyerWorkspace from "./components/LawyerWorkspace";
import ParalegalWorkspace from "./components/ParalegalWorkspace";

export default async function WorkspacePage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }

    let profile = await db.profile.findUnique({ where: { id: user.id } });
    
    if (!profile) {
      // Check if they are a client
      const client = await db.client.findUnique({ where: { id: user.id } });
      if (client) {
        redirect("/client/portal");
      }
      redirect("/login");
    }

    const tasks = await getWorkspaceTasks();
    const cases = await getCases();

    const role = String(profile.role).toLowerCase();

    if (role === 'admin' || role === 'manager') {
      return <ManagerWorkspace tasks={tasks} cases={cases} userId={user.id} />;
    } else if (role === 'lawyer') {
      return <LawyerWorkspace tasks={tasks} cases={cases} userId={user.id} />;
    } else if (role === 'paralegal') {
      return <ParalegalWorkspace tasks={tasks} cases={cases} userId={user.id} />;
    }

    // Fallback if role is weird
    return <div className="p-8 text-center text-red-500">Invalid Role Configuration</div>;
  } catch (error) {
    console.error("Error fetching workspace tasks:", error);
    redirect("/login");
  }
}

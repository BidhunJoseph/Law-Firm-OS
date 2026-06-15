import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MatterDashboardClient } from "./MatterDashboardClient";

export default async function MatterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile) redirect("/login");

  // Fetch the case with all relations
  const caseData = await db.case.findUnique({
    where: { id },
    include: {
      client: true,
      lawyer: true,
      paralegal: true,
      timeline_events: {
        orderBy: { event_date: 'desc' }
      },
      tasks: {
        orderBy: { created_at: 'desc' },
        include: {
          assignee: true
        }
      }
    }
  });

  if (!caseData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Matter Not Found</h1>
        <p className="text-gray-500 mt-2">This matter does not exist or you do not have permission to view it.</p>
      </div>
    );
  }

  // RBAC checks
  const isClient = (profile.role as string) === 'client';
  if (isClient && caseData.client_id !== profile.id) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-500 mt-2">You do not have permission to view this matter.</p>
      </div>
    );
  }

  return (
    <MatterDashboardClient 
      caseData={caseData} 
      userRole={profile.role} 
    />
  );
}

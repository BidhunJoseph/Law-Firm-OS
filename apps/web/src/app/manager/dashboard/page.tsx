import { DashboardClient } from "./DashboardClient";
import { getManagerDashboardData } from "@/server/actions/case-actions";
import { getClients } from "@/server/actions/client-actions";
import { getProfilesByRole } from "@/server/actions/user-actions";

export const metadata = {
  title: "Manager Dashboard | Law Firm OS",
  description: "High-level overview of active matters, risks, and performance.",
};

import { Suspense } from "react";

export default async function ManagerDashboardPage() {
  const [data, clients, lawyers, paralegals] = await Promise.all([
    getManagerDashboardData(),
    getClients(),
    getProfilesByRole('lawyer'),
    getProfilesByRole('paralegal')
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Dashboard...</div>}>
      <DashboardClient 
        data={data} 
        clients={clients.map(c => ({ id: c.id, name: c.name }))}
        lawyers={lawyers.map(l => ({ id: l.id, name: l.name }))}
        paralegals={paralegals.map(p => ({ id: p.id, name: p.name }))}
      />
    </Suspense>
  );
}

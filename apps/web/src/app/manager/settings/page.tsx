import { getProfilesByRole } from "@/server/actions/user-actions";
import SettingsClient, { FirmMember } from "./SettingsClient";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  try {
    const [admins, lawyers, paralegals] = await Promise.all([
      getProfilesByRole("admin"),
      getProfilesByRole("lawyer"),
      getProfilesByRole("paralegal")
    ]);

    const allProfiles = [...admins, ...lawyers, ...paralegals];
    const initialMembers: FirmMember[] = allProfiles.map(p => ({
      id: p.id,
      name: p.name || "",
      email: p.email,
      role: p.role,
      status: p.is_active ? "Active" : "Suspended",
      joinedDate: format(new Date(p.created_at), "MMM dd, yyyy")
    }));

    return <SettingsClient initialMembers={initialMembers} />;
  } catch (error) {
    console.error("Error fetching profiles:", error);
    redirect("/auth/login");
  }
}

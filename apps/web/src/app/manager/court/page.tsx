import { getCourtEvents } from "@/server/actions/court-actions";
import { getCases } from "@/server/actions/case-actions";
import CourtClient from "./CourtClient";
import { redirect } from "next/navigation";

export default async function CourtPage() {
  try {
    const [events, cases] = await Promise.all([
      getCourtEvents(),
      getCases()
    ]);
    
    return <CourtClient initialEvents={events} cases={cases} />;
  } catch (error) {
    console.error("Error fetching court events:", error);
    redirect("/auth/login");
  }
}

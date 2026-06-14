import { RoleLoginForm } from "@/components/auth/RoleLoginForm";

export default function LawyerLogin() {
  return (
    <RoleLoginForm 
      role="lawyer" 
      title="Counsel Portal" 
      description="Sign in to view your caseload and upcoming hearings."
      returnTo="/lawyer/dashboard"
    />
  );
}

import { RoleLoginForm } from "@/components/auth/RoleLoginForm";

export default function ParalegalLogin() {
  return (
    <RoleLoginForm 
      role="paralegal" 
      title="Execution Desk" 
      description="Sign in to view your task queue and pending filings."
      returnTo="/paralegal/dashboard"
    />
  );
}

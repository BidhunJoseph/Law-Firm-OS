import { RoleLoginForm } from "@/components/auth/RoleLoginForm";

export default function ClientLogin() {
  return (
    <RoleLoginForm 
      role="client" 
      title="Client Portal" 
      description="Sign in to view your case updates and submit requested documents."
      returnTo="/client/portal"
    />
  );
}

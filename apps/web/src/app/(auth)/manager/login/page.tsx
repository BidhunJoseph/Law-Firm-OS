import { RoleLoginForm } from "@/components/auth/RoleLoginForm";

export default function ManagerLogin() {
  return (
    <RoleLoginForm 
      role="manager" 
      title="Manager Access" 
      description="Enter your credentials to access the Firm Command Center."
      returnTo="/manager/dashboard"
    />
  );
}

import 'server-only';
import { db } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ----------------------------------------------------------------------
// WORKFLOW DEFINITIONS
// ----------------------------------------------------------------------

const WORKFLOWS: Record<string, { phases: string[]; initialPhase: string; initialAction: string }> = {
  "Civil & Commercial": {
    phases: [
      "1. Conciliation & Settlement",
      "2. Court of First Instance",
      "3. Court of Appeal",
      "4. Court of Cassation",
      "5. Execution"
    ],
    initialPhase: "1. Conciliation & Settlement",
    initialAction: "Collect KYC & Prepare Amicable Settlement Notice"
  },
  "Criminal Defense": {
    phases: [
      "1. Police Investigation",
      "2. Public Prosecution",
      "3. Court of First Instance",
      "4. Court of Appeal",
      "5. Court of Cassation"
    ],
    initialPhase: "1. Police Investigation",
    initialAction: "Fast-Track KYC & File Power of Attorney"
  },
  "Family Law": {
    phases: [
      "1. Family Guidance Committee",
      "2. Court of First Instance",
      "3. Court of Appeal",
      "4. Execution"
    ],
    initialPhase: "1. Family Guidance Committee",
    initialAction: "Collect KYC & File Mediation Request"
  },
  "Labor & Employment": {
    phases: [
      "1. Ministry of Human Resources",
      "2. Court of First Instance",
      "3. Court of Appeal",
      "4. Execution"
    ],
    initialPhase: "1. Ministry of Human Resources",
    initialAction: "Collect Labor Contract & File MOHRE Complaint"
  },
  "Real Estate & Rental": {
    phases: [
      "1. Rental Dispute Center / Conciliation",
      "2. Court of First Instance",
      "3. Court of Appeal",
      "4. Execution"
    ],
    initialPhase: "1. Rental Dispute Center / Conciliation",
    initialAction: "Collect Tenancy Contract & Notice"
  },
  "Corporate / M&A": {
    phases: [
      "1. NDA & Due Diligence",
      "2. Drafting Agreements",
      "3. Negotiation",
      "4. Closing & Handover"
    ],
    initialPhase: "1. NDA & Due Diligence",
    initialAction: "Draft NDA & Request KYC"
  },
  "Intellectual Property": {
    phases: [
      "1. Registration & Prior Art",
      "2. Publication & Opposition",
      "3. Grievance Committee",
      "4. Court of First Instance"
    ],
    initialPhase: "1. Registration & Prior Art",
    initialAction: "Collect KYC & Trademark Details"
  }
};

const DEFAULT_WORKFLOW = {
  phases: ["1. Intake", "2. Strategy", "3. Execution", "4. Closure"],
  initialPhase: "1. Intake",
  initialAction: "Collect KYC / Conflict Check"
};

/**
 * Executes immediately upon case creation. Sets up the initial tasks and phases.
 */
export async function runCaseCreationTriggers(caseId: string, caseType: string, firmId: string, lawyerId?: string) {
  const workflow = WORKFLOWS[caseType] || DEFAULT_WORKFLOW;

  await db.case.update({
    where: { id: caseId },
    data: {
      current_phase: workflow.initialPhase,
      next_action: workflow.initialAction,
    }
  });

  if (lawyerId) {
    await db.task.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        title: workflow.initialAction,
        task_type: "Administrative",
        description: `Kickoff task for ${caseType} matter. Ensure all documentation is collected to advance.`,
        status: "open",
        priority: "high",
        assigned_to: lawyerId,
        due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
      }
    });
  }

  // Log Timeline Event
  await db.timelineEvent.create({
    data: {
      firm_id: firmId,
      case_id: caseId,
      actor_type: 'system',
      event_type: 'CASE_OPENED',
      title: 'Matter Opened',
      description: `Workflow engine initialized ${caseType} procedure.`,
    }
  });
}

export async function runTaskCompletionTriggers(taskId: string) {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      case: {
        include: {
          client: true,
        }
      }
    }
  });

  if (!task || !task.case) return;

  const caseData = task.case;
  const clientData = caseData.client;
  const firmId = task.firm_id;

  // 2. Lifecycle Trigger: Intake / KYC Completed
  if (task.title.toLowerCase().includes('kyc') || task.title.toLowerCase().includes('intake') || task.title.toLowerCase().includes('conflict')) {
    
    // Step A: Advance Case Phase
    const caseType = caseData.case_type || ""; // Assume case_type is added to schema/model
    const workflow = WORKFLOWS[caseType] || DEFAULT_WORKFLOW;
    
    // Find current phase index
    const currentIndex = workflow.phases.indexOf(caseData.current_phase || "");
    if (currentIndex !== -1 && currentIndex + 1 < workflow.phases.length) {
      await db.case.update({
        where: { id: caseData.id },
        data: { current_phase: workflow.phases[currentIndex + 1] }
      });
    } else if (!caseData.current_phase || caseData.current_phase.includes('Intake')) {
      // Fallback
      await db.case.update({
        where: { id: caseData.id },
        data: { current_phase: '2. Strategy & Preparation' }
      });
    }

    // Step B: Automatically Provision Client Account (if they don't have one)
    if (clientData && clientData.email) {
      
      const existingProfileByEmail = await db.profile.findFirst({
        where: { email: clientData.email.toLowerCase() }
      });

      let clientIdForTask = existingProfileByEmail?.id;

      if (!existingProfileByEmail) {
        const tempPassword = "Password123!";
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: clientData.email.toLowerCase(),
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: clientData.name,
            firm_id: firmId,
            role: 'client'
          }
        });

        if (authData.user && !authError) {
          clientIdForTask = authData.user.id;
          
          try {
            await db.profile.create({
              data: {
                id: authData.user.id,
                firm_id: firmId,
                email: clientData.email.toLowerCase(),
                full_name: clientData.name,
                role: 'client',
                is_active: true
              }
            });
          } catch (profileError: any) {
            if (profileError.code !== 'P2002') {
              console.error("Profile creation failed:", profileError);
            }
          }
        } else if (authError) {
          console.error("Auth creation failed:", authError);
          // Attempt to find user in auth if already exists to still link them
          const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
          const foundAuthUser = existingAuthUsers.users.find(u => u.email === clientData.email?.toLowerCase());
          if (foundAuthUser) {
            clientIdForTask = foundAuthUser.id;
            try {
              await db.profile.create({
                data: {
                  id: foundAuthUser.id,
                  firm_id: firmId,
                  email: clientData.email.toLowerCase(),
                  full_name: clientData.name,
                  role: 'client',
                  is_active: true
                }
              });
            } catch (e: any) {
              // Ignore P2002 unique constraint if another process just inserted it
            }
          }
        }
      }

      // Step C: Automatically Generate the "Upload Documents" task assigned to the Client
      if (clientIdForTask) {
        const existingDocTask = await db.task.findFirst({
          where: {
            case_id: caseData.id,
            assigned_to: clientIdForTask,
            title: 'Upload Required Documents'
          }
        });

        if (!existingDocTask) {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);

          try {
            await db.task.create({
              data: {
                firm_id: firmId,
                case_id: caseData.id,
                title: 'Upload Required Documents',
                description: 'Please upload your ID, POA, and case-related documentation via the Secure Document Vault in your Client Portal.',
                task_type: 'client_action',
                status: 'open',
                priority: 'high',
                assigned_to: clientIdForTask,
                client_visible: true,
                due_at: nextWeek
              }
            });
          } catch (taskError: any) {
            console.error("Failed to create doc task:", taskError);
          }
        }
      }
    }
  }
}

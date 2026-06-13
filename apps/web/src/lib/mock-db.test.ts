import { db } from "./mock-db";
import { z } from "zod";

async function runTests() {
  console.log("Running mock-db tests...");
  db.reset();

  let passed = 0;
  let failed = 0;

  function assertThrows(fn: () => void, errorString: string, testName: string) {
    try {
      fn();
      console.error(`❌ ${testName} failed: Expected error containing "${errorString}"`);
      failed++;
    } catch (e: any) {
      if (e.message.includes(errorString) || (e instanceof z.ZodError && testName.includes("Validation"))) {
        console.log(`✅ ${testName} passed`);
        passed++;
      } else {
        console.error(`❌ ${testName} failed: Got wrong error: ${e.message}`);
        failed++;
      }
    }
  }

  function assertOk<T>(fn: () => T, testName: string): T | null {
    try {
      const res = fn();
      console.log(`✅ ${testName} passed`);
      passed++;
      return res;
    } catch (e: any) {
      console.error(`❌ ${testName} failed: Unexpected error: ${e.message}`);
      failed++;
      return null;
    }
  }

  // TEST 1: Create Profile
  const profile = assertOk(() => db.createProfile({
    name: "John Doe",
    email: "john@example.com",
    role: "lawyer"
  }), "Create Profile");

  // TEST 2: Email Unique Constraint
  assertThrows(() => db.createProfile({
    name: "John Clone",
    email: "john@example.com",
    role: "admin"
  }), "IntegrityError", "Create Profile Unique Email");

  // TEST 3: Validation Error
  assertThrows(() => db.createProfile({
    name: "",
    email: "invalid",
    role: "admin" as any
  }), "Validation", "Create Profile Validation");

  // TEST 4: Create Client
  const client = assertOk(() => db.createClient({
    name: "ACME Corp",
    email: "contact@acme.com",
    phone: "123-456-7890"
  }), "Create Client");

  // TEST 5: Create Case with valid relations
  let newCase = assertOk(() => db.createCase({
    title: "ACME vs Coyote",
    status: "open",
    client_id: client!.id,
    lawyer_id: profile!.id
  }), "Create Case");

  // TEST 6: Create Case with invalid client_id
  assertThrows(() => db.createCase({
    title: "Bad Case",
    status: "open",
    client_id: crypto.randomUUID(),
    lawyer_id: profile!.id
  }), "IntegrityError", "Create Case Invalid Client");

  // TEST 7: Create Case with invalid lawyer_id
  assertThrows(() => db.createCase({
    title: "Bad Case",
    status: "open",
    client_id: client!.id,
    lawyer_id: crypto.randomUUID()
  }), "IntegrityError", "Create Case Invalid Lawyer");

  // TEST 8: Prevent Deleting Profile if referenced
  assertThrows(() => db.deleteProfile(profile!.id), "IntegrityError", "Delete Referenced Profile");

  // TEST 9: Prevent Deleting Client if referenced
  assertThrows(() => db.deleteClient(client!.id), "IntegrityError", "Delete Referenced Client");

  // TEST 10: Optimistic Concurrency Update Success
  const updatedCase = assertOk(() => db.updateCase(newCase!.id, {
    status: "pending",
    version: newCase!.version
  }), "Update Case Optimistic Success");

  // TEST 11: Optimistic Concurrency Update Failure (using old version)
  assertThrows(() => db.updateCase(newCase!.id, {
    status: "closed",
    version: newCase!.version // old version, it was incremented
  }), "OptimisticConcurrencyError", "Update Case Concurrency Failure");

  // TEST 12: Delete Case
  assertOk(() => db.deleteCase(newCase!.id), "Delete Case");

  // TEST 13: Delete Profile now that case is gone
  assertOk(() => db.deleteProfile(profile!.id), "Delete Unreferenced Profile");

  // TEST 14: Setup for WorkspaceTasks
  const admin = assertOk(() => db.createProfile({ name: "Admin", email: "admin@test.com", role: "admin" }), "Create Admin");
  const lawyer = assertOk(() => db.createProfile({ name: "Lawyer", email: "lawyer@test.com", role: "lawyer" }), "Create Lawyer");
  const paralegal = assertOk(() => db.createProfile({ name: "Para", email: "para@test.com", role: "paralegal" }), "Create Paralegal");
  
  const caseClient = assertOk(() => db.createClient({ name: "Test Client", email: "client@test.com" }), "Create Test Client");
  
  const wCase = assertOk(() => db.createCase({
    title: "Test Focus Mode Case",
    status: "open",
    client_id: caseClient!.id,
    lawyer_id: lawyer!.id,
    paralegal_id: paralegal!.id,
    risk_level: "high",
    internal_notes: "Very risky case",
    lawyer_comments: "Needs immediate attention"
  }), "Create Workspace Case");

  // TEST 15: Create Court Event to Spawn Tasks
  assertOk(() => db.createCourtEvent({
    case_id: wCase!.id,
    event_date: new Date().toISOString(),
    event_type: "Hearing",
    title: "Initial Hearing"
  }), "Create Court Event");

  // TEST 16: Verify Lawyer Workspace Tasks (Focus Mode)
  const lawyerTasks = assertOk(() => {
    const tasks = db.getWorkspaceTasks(lawyer!.id);
    if (tasks.length !== 1) throw new Error(`Expected 1 task for lawyer, got ${tasks.length}`);
    if (tasks[0].case.risk_level !== "high") throw new Error("Lawyer should see case risk level");
    return tasks;
  }, "Lawyer Workspace Tasks");

  // TEST 17: Verify Paralegal Workspace Tasks (RBAC Restricted)
  const paralegalTasks = assertOk(() => {
    const tasks = db.getWorkspaceTasks(paralegal!.id);
    if (tasks.length !== 1) throw new Error(`Expected 1 task for paralegal, got ${tasks.length}`);
    if ("risk_level" in tasks[0].case) throw new Error("Paralegal should NOT see risk level");
    return tasks;
  }, "Paralegal Workspace Tasks (RBAC Restricted)");

  // TEST 18: Verify Admin Workspace Tasks (All tasks)
  assertOk(() => {
    const tasks = db.getWorkspaceTasks(admin!.id);
    if (tasks.length !== 2) throw new Error(`Expected 2 tasks for admin, got ${tasks.length}`);
  }, "Admin Workspace Tasks");

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();

import { z } from "zod";

// Schemas
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "lawyer", "paralegal"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().min(1),
});

export const ClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().min(1),
});

export const CaseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  status: z.enum(["open", "closed", "pending"]),
  client_id: z.string().uuid(),
  lawyer_id: z.string().uuid(),
  paralegal_id: z.string().uuid().optional().nullable(),
  risk_level: z.enum(["low", "medium", "high"]).optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  lawyer_comments: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().min(1),
});

export const DocumentRequestSchema = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "fulfilled", "rejected"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().min(1),
});

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  request_id: z.string().uuid().optional().nullable(),
  case_id: z.string().uuid(),
  file_name: z.string().min(1),
  file_path: z.string().min(1),
  mime_type: z.enum([
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    "image/jpeg"
  ]),
  size_bytes: z.number().int().positive(),
  uploaded_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().min(1),
});

export const CourtEventSchema = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  event_date: z.string().datetime(),
  event_type: z.enum(["Hearing", "Trial", "Adjournment", "Motion", "Conference"]),
  title: z.string().min(1),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().min(1),
});

export const TimelineEventSchema = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  event_date: z.string().datetime(),
  title: z.string().min(1),
  description: z.string().optional(),
  client_visible: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().min(1),
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  assignee_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().datetime(),
  status: z.enum(["pending", "in_progress", "completed"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().min(1),
});

export const ClientSafeTimelineEventSchema = TimelineEventSchema.omit({
  client_visible: true,
});

export const ClientSafeCaseSchema = CaseSchema.omit({
  risk_level: true,
  internal_notes: true,
  lawyer_comments: true,
}).extend({
  timeline_events: z.array(ClientSafeTimelineEventSchema),
});

export const AdminLawyerWorkspaceTaskSchema = TaskSchema.extend({
  case: CaseSchema,
  client: ClientSchema,
});

export const ParalegalWorkspaceTaskSchema = TaskSchema.extend({
  case: CaseSchema.omit({
    risk_level: true,
    internal_notes: true,
    lawyer_comments: true,
  }),
  client: ClientSchema,
});

export const WorkspaceTaskSchema = z.union([
  AdminLawyerWorkspaceTaskSchema,
  ParalegalWorkspaceTaskSchema
]);

export type WorkspaceTask = z.infer<typeof WorkspaceTaskSchema>;

export type ClientSafeCase = z.infer<typeof ClientSafeCaseSchema>;

export type Profile = z.infer<typeof ProfileSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type Case = z.infer<typeof CaseSchema>;
export type DocumentRequest = z.infer<typeof DocumentRequestSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type CourtEvent = z.infer<typeof CourtEventSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type Task = z.infer<typeof TaskSchema>;

export const CreateProfileSchema = ProfileSchema.omit({ id: true, created_at: true, updated_at: true, version: true });
export const UpdateProfileSchema = CreateProfileSchema.partial().extend({ version: z.number().int() });

export const CreateClientSchema = ClientSchema.omit({ id: true, created_at: true, updated_at: true, version: true });
export const UpdateClientSchema = CreateClientSchema.partial().extend({ version: z.number().int() });

export const CreateCaseSchema = CaseSchema.omit({ id: true, created_at: true, updated_at: true, version: true });
export const UpdateCaseSchema = CreateCaseSchema.partial().extend({ version: z.number().int() });

export const CreateDocumentRequestSchema = DocumentRequestSchema.omit({ id: true, created_at: true, updated_at: true, version: true });
export const UpdateDocumentRequestSchema = CreateDocumentRequestSchema.partial().extend({ version: z.number().int() });

export const CreateDocumentSchema = DocumentSchema.omit({ id: true, file_path: true, created_at: true, updated_at: true, version: true });
export const UpdateDocumentSchema = z.object({
  request_id: z.string().uuid().nullable().optional(),
  version: z.number().int().min(1)
});

export const CreateCourtEventSchema = CourtEventSchema.omit({ id: true, created_at: true, updated_at: true, version: true });
export const UpdateCourtEventSchema = CreateCourtEventSchema.partial().extend({ version: z.number().int() });

export const CreateTimelineEventSchema = TimelineEventSchema.omit({ id: true, created_at: true, updated_at: true, version: true });
export const UpdateTimelineEventSchema = CreateTimelineEventSchema.partial().extend({ version: z.number().int() });

export const CreateTaskSchema = TaskSchema.omit({ id: true, created_at: true, updated_at: true, version: true });
export const UpdateTaskSchema = CreateTaskSchema.partial().extend({ version: z.number().int() });

class MockDatabase {
  private static instance: MockDatabase;

  private profiles = new Map<string, Profile>();
  private clients = new Map<string, Client>();
  private cases = new Map<string, Case>();
  private document_requests = new Map<string, DocumentRequest>();
  private documents = new Map<string, Document>();
  private court_events = new Map<string, CourtEvent>();
  private timeline_events = new Map<string, TimelineEvent>();
  private tasks = new Map<string, Task>();

  private constructor() {}

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  // Use structural cloning / JSON cloning to prevent reference mutations
  private deepClone<T>(obj: T): T {
    if (obj === undefined) return undefined as unknown as T;
    return JSON.parse(JSON.stringify(obj));
  }

  // Clean DB for tests
  public reset(): void {
    this.profiles.clear();
    this.clients.clear();
    this.cases.clear();
    this.document_requests.clear();
    this.documents.clear();
    this.court_events.clear();
    this.timeline_events.clear();
    this.tasks.clear();
  }

  // --- PROFILES ---

  public getProfiles(): Profile[] {
    return this.deepClone(Array.from(this.profiles.values()));
  }

  public getProfile(id: string): Profile | undefined {
    return this.deepClone(this.profiles.get(id));
  }

  public createProfile(data: z.infer<typeof CreateProfileSchema>): Profile {
    const valid = CreateProfileSchema.parse(data);
    
    // Enforce unique email
    if (Array.from(this.profiles.values()).some((p) => p.email === valid.email)) {
      throw new Error(`IntegrityError: Profile with email ${valid.email} already exists`);
    }

    const now = new Date().toISOString();
    const profile: Profile = {
      ...valid,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      version: 1,
    };

    this.profiles.set(profile.id, profile);
    return this.deepClone(profile);
  }

  public updateProfile(id: string, data: z.infer<typeof UpdateProfileSchema>): Profile {
    const valid = UpdateProfileSchema.parse(data);
    const current = this.profiles.get(id);
    if (!current) throw new Error(`NotFoundError: Profile ${id} not found`);

    if (current.version !== valid.version) {
      throw new Error(`OptimisticConcurrencyError: Profile ${id} version mismatch. Expected ${current.version}, got ${valid.version}`);
    }

    if (valid.email && valid.email !== current.email) {
      if (Array.from(this.profiles.values()).some((p) => p.id !== id && p.email === valid.email)) {
        throw new Error(`IntegrityError: Profile with email ${valid.email} already exists`);
      }
    }

    const updated: Profile = {
      ...current,
      ...valid,
      updated_at: new Date().toISOString(),
      version: current.version + 1,
    };

    this.profiles.set(id, updated);
    return this.deepClone(updated);
  }

  public deleteProfile(id: string): void {
    if (!this.profiles.has(id)) throw new Error(`NotFoundError: Profile ${id} not found`);

    // Relational integrity check
    if (Array.from(this.cases.values()).some((c) => c.lawyer_id === id)) {
      throw new Error(`IntegrityError: Cannot delete profile ${id} because it is referenced by one or more cases`);
    }

    this.profiles.delete(id);
  }

  // --- CLIENTS ---

  public getClients(): Client[] {
    return this.deepClone(Array.from(this.clients.values()));
  }

  public getClient(id: string): Client | undefined {
    return this.deepClone(this.clients.get(id));
  }

  public createClient(data: z.infer<typeof CreateClientSchema>): Client {
    const valid = CreateClientSchema.parse(data);

    // Enforce unique email
    if (Array.from(this.clients.values()).some((c) => c.email === valid.email)) {
      throw new Error(`IntegrityError: Client with email ${valid.email} already exists`);
    }

    const now = new Date().toISOString();
    const client: Client = {
      ...valid,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      version: 1,
    };

    this.clients.set(client.id, client);
    return this.deepClone(client);
  }

  public updateClient(id: string, data: z.infer<typeof UpdateClientSchema>): Client {
    const valid = UpdateClientSchema.parse(data);
    const current = this.clients.get(id);
    if (!current) throw new Error(`NotFoundError: Client ${id} not found`);

    if (current.version !== valid.version) {
      throw new Error(`OptimisticConcurrencyError: Client ${id} version mismatch. Expected ${current.version}, got ${valid.version}`);
    }

    if (valid.email && valid.email !== current.email) {
      if (Array.from(this.clients.values()).some((c) => c.id !== id && c.email === valid.email)) {
        throw new Error(`IntegrityError: Client with email ${valid.email} already exists`);
      }
    }

    const updated: Client = {
      ...current,
      ...valid,
      updated_at: new Date().toISOString(),
      version: current.version + 1,
    };

    this.clients.set(id, updated);
    return this.deepClone(updated);
  }

  public deleteClient(id: string): void {
    if (!this.clients.has(id)) throw new Error(`NotFoundError: Client ${id} not found`);

    // Relational integrity check
    if (Array.from(this.cases.values()).some((c) => c.client_id === id)) {
      throw new Error(`IntegrityError: Cannot delete client ${id} because it is referenced by one or more cases`);
    }

    this.clients.delete(id);
  }

  // --- CASES ---

  public getCases(): Case[] {
    return this.deepClone(Array.from(this.cases.values()));
  }

  public getCase(id: string): Case | undefined {
    return this.deepClone(this.cases.get(id));
  }

  public getClientView(id: string): ClientSafeCase {
    const caseData = this.cases.get(id);
    if (!caseData) throw new Error(`NotFoundError: Case ${id} not found`);

    const timelineEvents = this.getTimelineEventsByCase(id);

    // Filter timeline events and mathematically strip 'client_visible'
    const safeTimelineEvents = timelineEvents
      .filter(event => event.client_visible !== false)
      .map(event => {
        const { client_visible, ...safeEvent } = event;
        return safeEvent;
      });

    // Mathematically strip sensitive case data
    const {
      risk_level,
      internal_notes,
      lawyer_comments,
      ...safeCaseData
    } = caseData;

    const safeResult = {
      ...safeCaseData,
      timeline_events: safeTimelineEvents,
    };

    return ClientSafeCaseSchema.parse(safeResult);
  }

  public createCase(data: z.infer<typeof CreateCaseSchema>): Case {
    const valid = CreateCaseSchema.parse(data);

    // Relational integrity check
    if (!this.clients.has(valid.client_id)) {
      throw new Error(`IntegrityError: Client ${valid.client_id} does not exist`);
    }
    if (!this.profiles.has(valid.lawyer_id)) {
      throw new Error(`IntegrityError: Profile ${valid.lawyer_id} does not exist`);
    }
    if (valid.paralegal_id && !this.profiles.has(valid.paralegal_id)) {
      throw new Error(`IntegrityError: Profile ${valid.paralegal_id} does not exist`);
    }

    const now = new Date().toISOString();
    const newCase: Case = {
      ...valid,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      version: 1,
    };

    this.cases.set(newCase.id, newCase);
    return this.deepClone(newCase);
  }

  public updateCase(id: string, data: z.infer<typeof UpdateCaseSchema>): Case {
    const valid = UpdateCaseSchema.parse(data);
    const current = this.cases.get(id);
    if (!current) throw new Error(`NotFoundError: Case ${id} not found`);

    if (current.version !== valid.version) {
      throw new Error(`OptimisticConcurrencyError: Case ${id} version mismatch. Expected ${current.version}, got ${valid.version}`);
    }

    // Relational integrity check
    if (valid.client_id && !this.clients.has(valid.client_id)) {
      throw new Error(`IntegrityError: Client ${valid.client_id} does not exist`);
    }
    if (valid.lawyer_id && !this.profiles.has(valid.lawyer_id)) {
      throw new Error(`IntegrityError: Profile ${valid.lawyer_id} does not exist`);
    }
    if (valid.paralegal_id && !this.profiles.has(valid.paralegal_id)) {
      throw new Error(`IntegrityError: Profile ${valid.paralegal_id} does not exist`);
    }

    const updated: Case = {
      ...current,
      ...valid,
      updated_at: new Date().toISOString(),
      version: current.version + 1,
    };

    this.cases.set(id, updated);
    return this.deepClone(updated);
  }

  public deleteCase(id: string): void {
    if (!this.cases.has(id)) throw new Error(`NotFoundError: Case ${id} not found`);
    this.cases.delete(id);
  }

  // --- DOCUMENT REQUESTS ---

  public getDocumentRequests(): DocumentRequest[] {
    return this.deepClone(Array.from(this.document_requests.values()));
  }

  public getDocumentRequest(id: string): DocumentRequest | undefined {
    return this.deepClone(this.document_requests.get(id));
  }

  public getDocumentRequestsByCase(caseId: string): DocumentRequest[] {
    return this.deepClone(Array.from(this.document_requests.values()).filter(dr => dr.case_id === caseId));
  }

  public createDocumentRequest(data: z.infer<typeof CreateDocumentRequestSchema>): DocumentRequest {
    const valid = CreateDocumentRequestSchema.parse(data);

    if (!this.cases.has(valid.case_id)) {
      throw new Error(`IntegrityError: Case ${valid.case_id} does not exist`);
    }

    const now = new Date().toISOString();
    const newRequest: DocumentRequest = {
      ...valid,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      version: 1,
    };

    this.document_requests.set(newRequest.id, newRequest);
    return this.deepClone(newRequest);
  }

  public updateDocumentRequest(id: string, data: z.infer<typeof UpdateDocumentRequestSchema>): DocumentRequest {
    const valid = UpdateDocumentRequestSchema.parse(data);
    const current = this.document_requests.get(id);
    if (!current) throw new Error(`NotFoundError: DocumentRequest ${id} not found`);

    if (current.version !== valid.version) {
      throw new Error(`OptimisticConcurrencyError: DocumentRequest ${id} version mismatch. Expected ${current.version}, got ${valid.version}`);
    }

    if (valid.case_id && !this.cases.has(valid.case_id)) {
      throw new Error(`IntegrityError: Case ${valid.case_id} does not exist`);
    }

    const updated: DocumentRequest = {
      ...current,
      ...valid,
      updated_at: new Date().toISOString(),
      version: current.version + 1,
    };

    this.document_requests.set(id, updated);
    return this.deepClone(updated);
  }

  public deleteDocumentRequest(id: string): void {
    if (!this.document_requests.has(id)) throw new Error(`NotFoundError: DocumentRequest ${id} not found`);
    
    if (Array.from(this.documents.values()).some((d) => d.request_id === id)) {
      throw new Error(`IntegrityError: Cannot delete DocumentRequest ${id} because it is referenced by one or more documents`);
    }

    this.document_requests.delete(id);
  }

  // --- DOCUMENTS ---

  public getDocuments(): Document[] {
    return this.deepClone(Array.from(this.documents.values()));
  }

  public getDocument(id: string): Document | undefined {
    return this.deepClone(this.documents.get(id));
  }

  public getDocumentsByCase(caseId: string): Document[] {
    return this.deepClone(Array.from(this.documents.values()).filter(d => d.case_id === caseId));
  }

  private generateStoragePath(caseId: string, originalFileName: string): string {
    const fileUuid = crypto.randomUUID();
    // Absolutely paranoid sanitization: only keep alphanumeric, dot, dash, underscore
    const safeFileName = originalFileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `cases/${caseId}/${fileUuid}/${safeFileName}`;
  }

  public createDocument(data: z.infer<typeof CreateDocumentSchema>): Document {
    const valid = CreateDocumentSchema.parse(data);

    if (!this.cases.has(valid.case_id)) {
      throw new Error(`IntegrityError: Case ${valid.case_id} does not exist`);
    }
    if (!this.profiles.has(valid.uploaded_by)) {
      throw new Error(`IntegrityError: Profile ${valid.uploaded_by} does not exist`);
    }
    if (valid.request_id && !this.document_requests.has(valid.request_id)) {
      throw new Error(`IntegrityError: DocumentRequest ${valid.request_id} does not exist`);
    }

    const file_path = this.generateStoragePath(valid.case_id, valid.file_name);

    const now = new Date().toISOString();
    const newDoc: Document = {
      ...valid,
      id: crypto.randomUUID(),
      file_path,
      created_at: now,
      updated_at: now,
      version: 1,
    };

    this.documents.set(newDoc.id, newDoc);

    // Auto-update request status if this fulfills a request
    if (newDoc.request_id) {
        const req = this.document_requests.get(newDoc.request_id);
        if (req && req.status === "pending") {
            this.document_requests.set(req.id, {
                ...req,
                status: "fulfilled",
                updated_at: now,
                version: req.version + 1
            });
        }
    }

    return this.deepClone(newDoc);
  }

  public updateDocument(id: string, data: z.infer<typeof UpdateDocumentSchema>): Document {
    const valid = UpdateDocumentSchema.parse(data);
    const current = this.documents.get(id);
    if (!current) throw new Error(`NotFoundError: Document ${id} not found`);

    if (current.version !== valid.version) {
      throw new Error(`OptimisticConcurrencyError: Document ${id} version mismatch. Expected ${current.version}, got ${valid.version}`);
    }

    if (valid.request_id !== undefined && valid.request_id !== null) {
      if (!this.document_requests.has(valid.request_id)) {
        throw new Error(`IntegrityError: DocumentRequest ${valid.request_id} does not exist`);
      }
    }

    const updated: Document = {
      ...current,
      request_id: valid.request_id !== undefined ? valid.request_id : current.request_id,
      updated_at: new Date().toISOString(),
      version: current.version + 1,
    };

    this.documents.set(id, updated);
    return this.deepClone(updated);
  }

  public deleteDocument(id: string): void {
    if (!this.documents.has(id)) throw new Error(`NotFoundError: Document ${id} not found`);
    this.documents.delete(id);
  }

  // --- TASKS ---
  public getTasks(): Task[] {
    return this.deepClone(Array.from(this.tasks.values()));
  }

  public getTasksByCase(caseId: string): Task[] {
    return this.deepClone(Array.from(this.tasks.values()).filter(t => t.case_id === caseId));
  }

  public getWorkspaceTasks(roleId: string): WorkspaceTask[] {
    const profile = this.profiles.get(roleId);
    if (!profile) {
      throw new Error(`NotFoundError: Profile ${roleId} not found`);
    }

    const allTasks = Array.from(this.tasks.values());
    let userTasks: Task[] = [];

    if (profile.role === "admin") {
      userTasks = allTasks;
    } else {
      userTasks = allTasks.filter(t => t.assignee_id === roleId);
    }

    const workspaceTasks = userTasks.map(task => {
      const caseData = this.cases.get(task.case_id);
      if (!caseData) throw new Error(`IntegrityError: Case ${task.case_id} not found for task ${task.id}`);

      const clientData = this.clients.get(caseData.client_id);
      if (!clientData) throw new Error(`IntegrityError: Client ${caseData.client_id} not found for case ${caseData.id}`);

      let safeCase: any = { ...caseData };

      if (profile.role === "paralegal") {
        delete safeCase.risk_level;
        delete safeCase.internal_notes;
        delete safeCase.lawyer_comments;
      }

      return {
        ...task,
        case: safeCase,
        client: clientData
      };
    });

    if (profile.role === "paralegal") {
      return z.array(ParalegalWorkspaceTaskSchema).parse(workspaceTasks);
    } else {
      return z.array(AdminLawyerWorkspaceTaskSchema).parse(workspaceTasks);
    }
  }

  public createTask(data: z.infer<typeof CreateTaskSchema>): Task {
    const valid = CreateTaskSchema.parse(data);
    if (!this.cases.has(valid.case_id)) throw new Error(`IntegrityError: Case ${valid.case_id} does not exist`);
    if (!this.profiles.has(valid.assignee_id)) throw new Error(`IntegrityError: Profile ${valid.assignee_id} does not exist`);
    
    const now = new Date().toISOString();
    const newTask: Task = { ...valid, id: crypto.randomUUID(), created_at: now, updated_at: now, version: 1 };
    this.tasks.set(newTask.id, newTask);
    return this.deepClone(newTask);
  }

  // --- TIMELINE EVENTS ---
  public getTimelineEvents(): TimelineEvent[] {
    return this.deepClone(Array.from(this.timeline_events.values()));
  }

  public getTimelineEventsByCase(caseId: string): TimelineEvent[] {
    return this.deepClone(Array.from(this.timeline_events.values()).filter(t => t.case_id === caseId));
  }

  public createTimelineEvent(data: z.infer<typeof CreateTimelineEventSchema>): TimelineEvent {
    const valid = CreateTimelineEventSchema.parse(data);
    if (!this.cases.has(valid.case_id)) throw new Error(`IntegrityError: Case ${valid.case_id} does not exist`);
    
    const now = new Date().toISOString();
    const newEvent: TimelineEvent = { ...valid, id: crypto.randomUUID(), created_at: now, updated_at: now, version: 1 };
    this.timeline_events.set(newEvent.id, newEvent);
    return this.deepClone(newEvent);
  }

  // --- COURT EVENTS ---
  public getCourtEvents(): CourtEvent[] {
    return this.deepClone(Array.from(this.court_events.values()));
  }

  public getCourtEventsByCase(caseId: string): CourtEvent[] {
    return this.deepClone(Array.from(this.court_events.values()).filter(e => e.case_id === caseId));
  }

  public createCourtEvent(data: z.infer<typeof CreateCourtEventSchema>): CourtEvent {
    const valid = CreateCourtEventSchema.parse(data);
    if (!this.cases.has(valid.case_id)) throw new Error(`IntegrityError: Case ${valid.case_id} does not exist`);
    
    const now = new Date().toISOString();
    const newEvent: CourtEvent = { ...valid, id: crypto.randomUUID(), created_at: now, updated_at: now, version: 1 };
    this.court_events.set(newEvent.id, newEvent);

    // 1. Mathematically calculate and push a timeline event
    this.createTimelineEvent({
      case_id: valid.case_id,
      event_date: valid.event_date,
      title: `${valid.event_type} Scheduled`,
      description: valid.description || "System generated event",
      client_visible: true,
    });

    // 2. Dynamically create tasks for the assigned lawyer and paralegal based on the event type
    const targetCase = this.cases.get(valid.case_id)!;
    const eventDateMs = new Date(valid.event_date).getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    let lawyerTaskTitle = "";
    let lawyerTaskDesc = "";
    let paralegalTaskTitle = "";
    let paralegalTaskDesc = "";
    let daysToAddLawyer = -2;
    let daysToAddParalegal = -5;

    switch(valid.event_type) {
      case "Adjournment":
        lawyerTaskTitle = "Prepare for next hearing";
        lawyerTaskDesc = `Review case file and prepare for the rescheduled ${valid.title}.`;
        paralegalTaskTitle = "Notify client and update schedule";
        paralegalTaskDesc = `Inform the client about the adjournment of ${valid.title} and update calendars.`;
        daysToAddLawyer = 2; // 2 days after adjournment
        daysToAddParalegal = 1; // 1 day after adjournment
        break;
      case "Trial":
        lawyerTaskTitle = "Trial Preparation";
        lawyerTaskDesc = `Finalize trial strategy and witness lists for ${valid.title}.`;
        paralegalTaskTitle = "Prepare Trial Binders";
        paralegalTaskDesc = `Organize all evidence and trial binders for ${valid.title}.`;
        daysToAddLawyer = -7; // 7 days before trial
        daysToAddParalegal = -14; // 14 days before trial
        break;
      case "Hearing":
        lawyerTaskTitle = "Prepare arguments for Hearing";
        lawyerTaskDesc = `Prepare legal arguments for the upcoming hearing: ${valid.title}`;
        paralegalTaskTitle = "Gather documents for Hearing";
        paralegalTaskDesc = `Ensure all exhibits are ready for: ${valid.title}`;
        daysToAddLawyer = -2;
        daysToAddParalegal = -5;
        break;
      case "Motion":
        lawyerTaskTitle = "Draft Motion Responses";
        lawyerTaskDesc = `Prepare responses to opposing counsel's motion: ${valid.title}.`;
        paralegalTaskTitle = "File Motion Documents";
        paralegalTaskDesc = `Ensure all motion documents are filed with the court for: ${valid.title}.`;
        daysToAddLawyer = -3;
        daysToAddParalegal = -1;
        break;
      case "Conference":
        lawyerTaskTitle = "Review Conference materials";
        lawyerTaskDesc = `Review case status and materials for ${valid.title}.`;
        paralegalTaskTitle = "Prepare Conference summary";
        paralegalTaskDesc = `Draft summary of case facts for ${valid.title}.`;
        daysToAddLawyer = -1;
        daysToAddParalegal = -2;
        break;
    }

    const lawyerDueDate = new Date(eventDateMs + daysToAddLawyer * dayMs);
    const paralegalDueDate = new Date(eventDateMs + daysToAddParalegal * dayMs);

    this.createTask({
      case_id: valid.case_id,
      assignee_id: targetCase.lawyer_id,
      title: lawyerTaskTitle,
      description: lawyerTaskDesc,
      due_date: lawyerDueDate.toISOString(),
      status: "pending"
    });

    if (targetCase.paralegal_id) {
      this.createTask({
        case_id: valid.case_id,
        assignee_id: targetCase.paralegal_id,
        title: paralegalTaskTitle,
        description: paralegalTaskDesc,
        due_date: paralegalDueDate.toISOString(),
        status: "pending"
      });
    } else {
      const anyParalegal = Array.from(this.profiles.values()).find(p => p.role === "paralegal");
      if (anyParalegal) {
        this.createTask({
          case_id: valid.case_id,
          assignee_id: anyParalegal.id,
          title: paralegalTaskTitle,
          description: paralegalTaskDesc,
          due_date: paralegalDueDate.toISOString(),
          status: "pending"
        });
      }
    }

    return this.deepClone(newEvent);
  }
}

export const db = MockDatabase.getInstance();

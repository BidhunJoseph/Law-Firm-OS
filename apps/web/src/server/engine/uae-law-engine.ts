import { db } from '@/lib/db';

export const DUBAI_CLASSIFICATIONS = [
  // Mainstream Onshore Cases
  'Civil Cases', 'Commercial Cases', 'Real Estate Cases', 'Private Labor Cases', 
  'Domestic Workers Cases', 'Muslim Personal Status Cases', 'Non-Muslim Personal Status Cases', 
  'Urgent Matters / Summary Cases',
  // Criminal Cases
  'Infractions / Contraventions', 'Misdemeanors', 'Felonies', 'Juvenile Delinquency Cases', 
  'Cybercrime Cases', 'Anti-Money Laundering (AML) Cases',
  // Execution and Enforcement Cases
  'Standard Execution Cases', 'Deputation Execution Cases', 'Foreign Judgment Enforcement Cases',
  // Specialized Committee & Tribunal Cases
  'Rental Dispute Cases', 'Tax Dispute Cases', 'Insurance Dispute Cases', 
  'Banking and Financial Consumer Cases', 'Medical Malpractice Liability Cases', 
  'Customs Violation Cases', 'Intellectual Property Enforcement Cases', 
  'Corporate Bankruptcy and Insolvency Cases', 'Maritime and Shipping Cases', 
  'Local Arbitration Ratification/Nullification Cases', 'Sports Arbitration Cases',
  // Constitutional & Sovereign Cases
  'Constitutional Validity Appeals', 'Jurisdictional Conflict Cases', 'Administrative Lawsuits',
  // Free Zone Common Law Cases (DIFC & ADGM)
  'Court of First Instance Commercial Cases', 'Court of Appeal Cases', 
  'Small Claims Tribunal (SCT) Cases', 'Technology & Construction Division (TCD) Cases', 
  'Digital Economy Court Cases', 'Arbitration Enforcement Cases'
] as const;

export type CaseClassification = typeof DUBAI_CLASSIFICATIONS[number];

interface TaskTemplate {
  phase_id: number;
  title: string;
  description: string;
  days_offset: number;
}

// A helper to construct base phases
const T = (phase_id: number, title: string, description: string, days_offset: number): TaskTemplate => ({ phase_id, title, description, days_offset });

export const TEMPLATES: Record<string, TaskTemplate[]> = {
  // --- MAINSTREAM ONSHORE ---
  'Civil Cases': [
    T(1, 'Draft & Serve Legal Notice', 'Serve 15-day formal demand via Notary Public.', 1),
    T(2, 'File Statement of Claim', 'Register at Civil Court of First Instance (CFI) and pay fees.', 16),
    T(3, 'Serve Summons', 'Effect service via Aramex or publication.', 25),
    T(4, 'Review Defense Memos', 'Analyze defendant reply and draft rejoinder.', 40),
    T(5, 'Judgment & Appeal Strategy', 'Receive CFI judgment and prepare for 30-day appeal window.', 90)
  ],
  'Commercial Cases': [
    T(1, 'Payment Order (If applicable)', 'File fast-track Payment Order if debt is confirmed in writing.', 5),
    T(1, 'Precautionary Attachment', 'File ex-parte to freeze bank accounts or trade licenses.', 10),
    T(2, 'CMO Session', 'Attend Case Management Office hearing.', 25),
    T(3, 'Accounting Expert Mandate', 'Submit ledgers to Court Appointed Accounting Expert.', 45),
    T(4, 'Final Submissions', 'Submit final memo based on Expert Report.', 70)
  ],
  'Real Estate Cases': [
    T(1, 'OQOOD/DLD Verification', 'Verify property registration at Dubai Land Dept.', 2),
    T(1, '30-Day Notice of Default', 'Serve developer/buyer breach notice via Notary.', 5),
    T(2, 'Property Court Registration', 'Submit claim to Real Estate circuit (cancellation or handover).', 36),
    T(3, 'Engineering Expert Inspection', 'Coordinate DLD engineering expert site visit.', 60),
    T(4, 'Judgment', 'Obtain Real Estate Court judgment.', 120)
  ],
  'Private Labor Cases': [
    T(1, 'MOHRE Complaint', 'File online complaint with Ministry of Human Resources.', 1),
    T(2, 'MOHRE Mediation', 'Attend phone mediation with legal researcher.', 7),
    T(3, 'Labor Court Transfer', 'Obtain NOC and register at Labor Court (within 14 days).', 14),
    T(4, 'Submit EOSB Calculations', 'Draft memo calculating gratuity, unpaid salaries, arbitrary dismissal.', 20),
    T(5, 'Judgment & Execution', 'Receive fast-track labor judgment and file execution.', 45)
  ],
  'Domestic Workers Cases': [
    T(1, 'Tadbeer / MOHRE Complaint', 'File complaint via Tadbeer centers or MOHRE app.', 2),
    T(2, 'Mediation Session', 'Attend settlement session.', 10),
    T(3, 'Referral to Labor Court', 'Transfer file to Labor Court if mediation fails.', 20)
  ],
  'Muslim Personal Status Cases': [
    T(1, 'Family Guidance Section', 'Open file at Dubai Courts Family Guidance for mandatory conciliation.', 2),
    T(2, 'Conciliation Sessions', 'Attend mediator sessions to settle divorce/alimony.', 14),
    T(3, 'Court Referral (NOC)', 'Obtain No Objection letter if settlement fails.', 30),
    T(4, 'File Substantive Claim', 'File divorce/custody/alimony suit at Personal Status Court.', 35),
    T(5, 'Witness Testimony & Arbitrators', 'Present witnesses or appoint family arbitrators (Hakamain).', 60)
  ],
  'Non-Muslim Personal Status Cases': [
    T(1, 'Civil Family Court Filing', 'File divorce request at the Abu Dhabi/Dubai Civil Family Court.', 5),
    T(2, 'No-Fault Divorce Hearing', 'Attend swift hearing for no-fault divorce decree.', 20),
    T(3, 'Asset & Custody Allocation', 'Submit proposals for joint custody and asset split.', 40)
  ],
  'Urgent Matters / Summary Cases': [
    T(1, 'File Urgent Petition', 'File petition before Summary Judge (e.g. travel ban, asset freeze).', 1),
    T(2, 'Ex-Parte Order Issuance', 'Obtain decision usually within 24-48 hours.', 3),
    T(3, 'Execution or Grievance', 'Execute the order or file a grievance if defending.', 7)
  ],

  // --- CRIMINAL CASES ---
  'Infractions / Contraventions': [
    T(1, 'Police Inquiry', 'Check details of the fine or minor infraction.', 2),
    T(2, 'Prosecution Settlement', 'Pay fine or settle at Public Prosecution to avoid court.', 10)
  ],
  'Misdemeanors': [
    T(1, 'Police Investigation', 'Accompany client to Police CID for statement.', 2),
    T(2, 'Bail Request', 'Submit passport or financial bail to Public Prosecution.', 5),
    T(3, 'Prosecution Hearing', 'Attend interrogation with Prosecutor.', 10),
    T(4, 'Misdemeanor Court Defense', 'Submit defense memo or plead at the Court of First Instance.', 30)
  ],
  'Felonies': [
    T(1, 'CID & Forensics', 'Manage police investigation and forensic evidence review.', 5),
    T(2, 'Prosecution Remand Hearings', 'Attend custody renewal hearings (14-day extensions).', 14),
    T(3, 'Referral to Criminal Court', 'Review the formal indictment sheet.', 45),
    T(4, 'Witness Cross-Examination', 'Question Prosecution witnesses at Criminal Court.', 75),
    T(5, 'Final Defense Pleading', 'Deliver oral and written defense.', 100)
  ],
  'Juvenile Delinquency Cases': [
    T(1, 'Juvenile Prosecution', 'Attend specialized closed hearings.', 5),
    T(2, 'Social Worker Report', 'Review the court-appointed social worker report.', 20),
    T(3, 'Closed Trial', 'Defend at Juvenile Court (focus on rehabilitation measures).', 40)
  ],
  'Cybercrime Cases': [
    T(1, 'e-Crime Complaint', 'Lodge complaint via Dubai Police eCrime platform.', 1),
    T(2, 'Cyber Forensics Lab', 'Follow up on technical forensic reports.', 15),
    T(3, 'Prosecution & Court', 'Submit digital evidence defense in Criminal Court.', 45)
  ],
  'Anti-Money Laundering (AML) Cases': [
    T(1, 'FIU Investigation', 'Respond to Financial Intelligence Unit inquiries.', 7),
    T(2, 'Asset Freeze Defense', 'File grievance against Central Bank or Prosecution asset freeze.', 15),
    T(3, 'AML Court Hearings', 'Defend before the specialized AML Criminal Circuit.', 60)
  ],

  // --- EXECUTION & ENFORCEMENT ---
  'Standard Execution Cases': [
    T(1, 'Open Execution File', 'Open file based on final judgment/executive formula.', 2),
    T(2, '15-Day Grace Period', 'Serve notice and wait for voluntary compliance.', 17),
    T(3, 'Asset Tracing & Attachment', 'Request Central Bank, RTA, DLD to freeze assets.', 25),
    T(4, 'Arrest Warrant / Travel Ban', 'Request travel ban or arrest warrant for manager/debtor.', 40)
  ],
  'Deputation Execution Cases': [
    T(1, 'File Deputation', 'Transfer execution from Dubai to Abu Dhabi/Sharjah (or vice versa).', 5),
    T(2, 'Local Attachment', 'Execute asset freeze in the deputed Emirate.', 20)
  ],
  'Foreign Judgment Enforcement Cases': [
    T(1, 'Attestation & Translation', 'Legalize foreign judgment at MOFA and translate to Arabic.', 10),
    T(2, 'File Execution Judge Petition', 'Apply directly to Execution Judge under new Civil Procedure Rules.', 15),
    T(3, 'Defend Grievance', 'Defend against any grievance filed by the debtor.', 45)
  ],

  // --- SPECIALIZED COMMITTEES & TRIBUNALS ---
  'Rental Dispute Cases': [
    T(1, 'Notary Eviction/Rent Notice', 'Serve 30-day (rent) or 12-month (eviction) notice.', 2),
    T(2, 'File at RDC', 'Register claim at Rental Disputes Center.', 35),
    T(3, 'RDC Remote Hearing', 'Attend online RDC hearing.', 50),
    T(4, 'RDC Execution', 'Eviction execution with Police support.', 70)
  ],
  'Tax Dispute Cases': [
    T(1, 'FTA Reconsideration', 'Submit Reconsideration to Federal Tax Authority.', 5),
    T(2, 'TDRC Petition', 'File at Tax Disputes Resolution Committee.', 25),
    T(3, 'Federal Court Appeal', 'Appeal TDRC decision to Federal Competent Court.', 60)
  ],
  'Insurance Dispute Cases': [
    T(1, 'Sanadak / Central Bank Complaint', 'File complaint via Sanadak portal.', 5),
    T(2, 'Insurance Committee Hearing', 'Present case to the specialized UAE Insurance Committee.', 30),
    T(3, 'Court Appeal', 'File civil case if committee decision is rejected.', 60)
  ],
  'Medical Malpractice Liability Cases': [
    T(1, 'DHA/MOHAP Complaint', 'File complaint with health authority for medical committee review.', 5),
    T(2, 'Higher Medical Liability Committee', 'Appeal initial report to the Higher Committee.', 40),
    T(3, 'Civil Compensation Case', 'File for damages in Civil Court based on final medical report.', 90)
  ],
  'Corporate Bankruptcy and Insolvency Cases': [
    T(1, 'Financial Restructuring Prep', 'Draft comprehensive financial position report.', 15),
    T(2, 'File Bankruptcy Petition', 'Submit request for Preventive Composition or Bankruptcy.', 30),
    T(3, 'Trustee Appointment', 'Coordinate with the court-appointed bankruptcy trustee.', 60),
    T(4, 'Creditors Meeting', 'Attend and vote at the creditors assembly.', 120)
  ],
  'Maritime and Shipping Cases': [
    T(1, 'Vessel Arrest Petition', 'File urgent application to arrest vessel at port.', 2),
    T(2, 'Maritime Substantive Claim', 'File main lawsuit within 8 days of arrest.', 10),
    T(3, 'Maritime Expert', 'Appoint maritime expert for navigation/cargo dispute.', 40)
  ],
  'Sports Arbitration Cases': [
    T(1, 'File at Emirates Sports Arbitration', 'Submit arbitration request to the UAE Sports Arbitration Centre.', 5),
    T(2, 'Arbitrator Selection', 'Nominate arbitrator from the approved roster.', 15),
    T(3, 'Arbitration Hearings', 'Submit memorials and attend hearings.', 45)
  ],

  // --- FREE ZONE COMMON LAW (DIFC & ADGM) ---
  'Court of First Instance Commercial Cases': [
    T(1, 'Letter of Claim', 'Send pre-action protocol letter (DIFC/ADGM).', 5),
    T(2, 'Issue Claim Form (Part 7/8)', 'File Claim Form and Particulars of Claim via e-Registry.', 25),
    T(3, 'Acknowledgment of Service', 'Defendant files AOS and Defense.', 40),
    T(4, 'Case Management Conference (CMC)', 'Attend CMC and agree on trial timetable.', 70),
    T(5, 'Document Production', 'Execute Redfern Schedule for document discovery.', 100),
    T(6, 'Witness Statements & Trial', 'Exchange witness statements and attend Trial.', 150)
  ],
  'Small Claims Tribunal (SCT) Cases': [
    T(1, 'File SCT Claim', 'Submit claim form (Value < AED 500k).', 2),
    T(2, 'SCT Consultation', 'Attend mandatory confidential consultation/mediation.', 14),
    T(3, 'SCT Hearing', 'Attend hearing before the SCT Judge (No lawyers allowed usually).', 30)
  ],
  'Arbitration Enforcement Cases': [
    T(1, 'Part 43 Application', 'File application in DIFC/ADGM to recognize Arbitral Award.', 10),
    T(2, 'Service on Debtor', 'Serve the recognition order on the award debtor.', 25),
    T(3, 'Execution Measures', 'Apply for charging orders or third-party debt orders.', 45)
  ],

  // Default fallback
  'DEFAULT': [
    T(1, 'Initial Case Assessment', 'Analyze documents and draft legal strategy.', 2),
    T(2, 'File Claim / Complaint', 'Register the matter with the competent authority.', 15),
    T(3, 'Hearing / Follow-up', 'Attend sessions and submit memos.', 45),
    T(4, 'Judgment / Resolution', 'Receive final decision and advise client.', 90)
  ]
};

export async function generateTasksForMatter(caseId: string, caseTypeStr: string, firmId: string, createdBy: string, assignedUserId?: string) {
  // Normalize string to match exact key if possible, else default to DEFAULT
  let caseType = 'DEFAULT';
  const matched = DUBAI_CLASSIFICATIONS.find(c => c.toLowerCase() === caseTypeStr.toLowerCase());
  if (matched && TEMPLATES[matched]) {
    caseType = matched;
  } else if (matched && !TEMPLATES[matched]) {
    caseType = 'DEFAULT'; 
  }
  
  const templates = TEMPLATES[caseType] || TEMPLATES['DEFAULT'];
  
  const now = new Date();
  
  const tasksToCreate = templates.map(t => {
    const dueAt = new Date(now);
    dueAt.setDate(dueAt.getDate() + t.days_offset);
    
    return {
      firm_id: firmId,
      case_id: caseId,
      task_type: `Phase ${t.phase_id}`,
      title: t.title,
      description: t.description,
      status: 'open',
      due_at: dueAt,
      assigned_to: assignedUserId || null,
      assigned_by: createdBy
    };
  });

  // Automatically append the Case Closed phase at the end
  const maxDaysOffset = Math.max(...templates.map(t => t.days_offset), 0);
  const closingDate = new Date(now);
  closingDate.setDate(closingDate.getDate() + maxDaysOffset + 30); // 30 days after last standard phase

  tasksToCreate.push({
      firm_id: firmId,
      case_id: caseId,
      task_type: 'Case Closed',
      title: 'Formal Case Closure',
      description: 'Completing this phase will trigger the indexing engine to archive the matter timeline and log the case vectors for future automated AI precedence reference.',
      status: 'open',
      due_at: closingDate,
      assigned_to: assignedUserId || null,
      assigned_by: createdBy
  });

  await db.task.createMany({
    data: tasksToCreate
  });

  return tasksToCreate.length;
}

/**
 * Beacon Biosignals — Life Sciences Sales wireframe data store.
 *
 * A single in-memory singleton that stands in for a Salesforce org: seed(),
 * reset(), read-only getters, named mutation functions, and an EventTarget
 * pub-sub so pages re-render on `storechange`. Everything here maps to standard
 * Salesforce configuration — objects, record types, related lists, Path,
 * custom notifications sent by record-triggered Flows — never custom code.
 *
 * All data is fictitious. No real companies, people, or engagement pricing.
 */

/* ------------------------------------------------------------------ *
 * Pub-sub
 * ------------------------------------------------------------------ */
const bus = new EventTarget();
let emitScheduled = false;

/** Notify subscribers a mutation happened. Coalesced to one tick. */
function emit() {
  if (emitScheduled) return;
  emitScheduled = true;
  Promise.resolve().then(() => {
    emitScheduled = false;
    bus.dispatchEvent(new CustomEvent('storechange'));
  });
}

/** Subscribe to store changes. Returns an unsubscribe function. */
export function onStoreChange(callback) {
  bus.addEventListener('storechange', callback);
  return () => bus.removeEventListener('storechange', callback);
}

/* ------------------------------------------------------------------ *
 * Date helpers (relative to "today" so the demo always looks fresh)
 * ------------------------------------------------------------------ */
const DAY = 86400000;
function iso(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}
function daysFromNow(n) {
  return iso(Date.now() + n * DAY);
}
function daysAgo(n) {
  return iso(Date.now() - n * DAY);
}

/* ------------------------------------------------------------------ *
 * People / Users (personas + the six Opportunity Team roles)
 * ------------------------------------------------------------------ */
const PEOPLE = {
  bdCoordinator: 'Priya Nadkarni',
  bdRep: 'Jordan Reyes',
  cbo: 'Marcus Bell',
  clinOpsPm: 'Dana Whitfield',
  medicalDirector: 'Dr. Ravi Anand',
  scientific: 'Dr. Sofia Marchetti',
  engineering: 'Theo Okafor',
};

const USERS = [
  { id: 'user-bd-coord', name: PEOPLE.bdCoordinator, role: 'BD Coordinator (Triage)' },
  { id: 'user-bd-rep', name: PEOPLE.bdRep, role: 'BD Rep / Key Account Manager' },
  { id: 'user-cbo', name: PEOPLE.cbo, role: 'Chief Business Officer' },
  { id: 'user-clinops', name: PEOPLE.clinOpsPm, role: 'ClinOps Program Manager' },
  { id: 'user-medical', name: PEOPLE.medicalDirector, role: 'Medical Director' },
  { id: 'user-scientific', name: PEOPLE.scientific, role: 'Scientific' },
  { id: 'user-engineering', name: PEOPLE.engineering, role: 'Engineering' },
];

/* ------------------------------------------------------------------ *
 * Products (exactly six — Beacon's Life Sciences catalog)
 * ------------------------------------------------------------------ */
const PRODUCTS = [
  { id: 'prod-device', name: 'Device & Logistics Services', family: 'Devices', listPrice: 145000, timeBased: false, description: 'Waveband EEG device provisioning, kitting, shipping, and reverse logistics for enrolled sites.' },
  { id: 'prod-clinops', name: 'Clinical Operations Support', family: 'Services', listPrice: 18500, timeBased: true, description: 'Site-month clinical operations coverage: monitoring, query management, and site enablement.' },
  { id: 'prod-platform', name: 'Beacon Platform: Core Tier', family: 'Platform', listPrice: 320000, timeBased: false, description: 'Trial Insights Hub + Biosignal Studio + Quality Suite + Sleep Analytics Suite.' },
  { id: 'prod-scientific', name: 'Scientific Services Base Package', family: 'Services', listPrice: 96000, timeBased: false, description: 'Protocol biomarker strategy, endpoint definition, and analysis plan authoring.' },
  { id: 'prod-scipm', name: 'Scientific PM (Monthly Retainer)', family: 'Services', listPrice: 12500, timeBased: true, description: 'Dedicated scientific program management retainer, billed monthly.' },
  { id: 'prod-interim', name: 'Interim Analysis Report (Add-on)', family: 'Add-on', listPrice: 40000, timeBased: false, description: 'Add-on interim analysis and readout deliverable at a pre-agreed enrollment milestone.' },
];

/* ------------------------------------------------------------------ *
 * Opportunity stages (Beacon handbook Path)
 * ------------------------------------------------------------------ */
export const SALES_STAGES = [
  'Triage',
  'Awareness',
  'Nurture',
  'Qualification',
  'Request',
  'Consideration',
  'Contracting',
  'Closed Won',
];
export const CHANGE_ORDER_STAGES = ['Identified', 'Scoped', 'Contracting', 'Closed Won'];

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */
let state = {};
let seq = 0;
function nextId(prefix) {
  seq += 1;
  return `${prefix}-${seq}`;
}

/* ------------------------------------------------------------------ *
 * Seed
 * ------------------------------------------------------------------ */
function buildSeed() {
  seq = 0;

  /* ---- Accounts: Organization (sponsors) + Clinical Sites ---- */
  const accounts = [
    // Journey sponsor
    { id: 'acc-neurocessa', name: 'Neurocessa Therapeutics', recordType: 'Organization', tier: 'Tier 3', industryFocus: 'Clinical-stage Biotech', therapeuticFocus: 'Psychiatry / CNS', marketCapBand: '$250M–$1B', owner: PEOPLE.bdRep },
    { id: 'acc-somnaris', name: 'Somnaris Bio', recordType: 'Organization', tier: 'Tier 2', industryFocus: 'Mid-cap Biopharma', therapeuticFocus: 'Sleep Medicine', marketCapBand: '$1B–$5B', owner: PEOPLE.bdRep },
    { id: 'acc-cortexa', name: 'Cortexa Pharmaceuticals', recordType: 'Organization', tier: 'Tier 1', industryFocus: 'Large Pharma', therapeuticFocus: 'Neurology', marketCapBand: '>$10B', owner: 'Alex Kim' },
    { id: 'acc-parkin', name: 'ParkinRx Therapeutics', recordType: 'Organization', tier: 'Tier 3', industryFocus: 'Clinical-stage Biotech', therapeuticFocus: 'Movement Disorders', marketCapBand: '$250M–$1B', owner: PEOPLE.bdRep },
    { id: 'acc-epilume', name: 'Epilume Sciences', recordType: 'Organization', tier: 'Tier 2', industryFocus: 'Mid-cap Biopharma', therapeuticFocus: 'Epilepsy', marketCapBand: '$1B–$5B', owner: 'Alex Kim' },

    // Clinical Sites
    { id: 'site-lakeshore', name: 'Lakeshore Neuroscience Institute', recordType: 'Clinical Site', cityState: 'Chicago, IL', address: '1200 Lakeshore Dr, Chicago, IL 60611', siteType: 'Academic Medical Center', primaryPI: 'Dr. Elena Vasquez', owner: PEOPLE.bdRep },
    { id: 'site-summit', name: 'Summit Clinical Research', recordType: 'Clinical Site', cityState: 'Denver, CO', address: '4400 Summit Blvd, Denver, CO 80202', siteType: 'Dedicated Research Site', primaryPI: 'Dr. Harold Chen', owner: PEOPLE.bdRep },
    { id: 'site-bayview', name: 'Bayview Neurology Partners', recordType: 'Clinical Site', cityState: 'San Diego, CA', address: '78 Harbor View, San Diego, CA 92101', siteType: 'Private Practice Network', primaryPI: 'Dr. Naomi Feldman', owner: PEOPLE.bdRep },
    { id: 'site-piedmont', name: 'Piedmont Brain Health Center', recordType: 'Clinical Site', cityState: 'Atlanta, GA', address: '55 Peachtree Ct, Atlanta, GA 30303', siteType: 'Hospital System', primaryPI: 'Dr. Idris Bello', owner: 'Alex Kim' },
    { id: 'site-northstar', name: 'Northstar Sleep & EEG Center', recordType: 'Clinical Site', cityState: 'Minneapolis, MN', address: '900 Aurora Ave, Minneapolis, MN 55401', siteType: 'Dedicated Research Site', primaryPI: 'Dr. Grace Lin', owner: PEOPLE.bdRep },
    { id: 'site-riverside', name: 'Riverside Memory Clinic', recordType: 'Clinical Site', cityState: 'Boston, MA', address: '210 Charles St, Boston, MA 02114', siteType: 'Academic Medical Center', primaryPI: 'Dr. Owen Pratt', owner: 'Alex Kim' },
    { id: 'site-mesa', name: 'Mesa Verde Neurocare', recordType: 'Clinical Site', cityState: 'Phoenix, AZ', address: '1500 Camelback Rd, Phoenix, AZ 85014', siteType: 'Private Practice Network', primaryPI: 'Dr. Carla Ruiz', owner: PEOPLE.bdRep },
    { id: 'site-hudson', name: 'Hudson Valley Clinical Studies', recordType: 'Clinical Site', cityState: 'Albany, NY', address: '3 Hudson Sq, Albany, NY 12207', siteType: 'Dedicated Research Site', primaryPI: 'Dr. Meera Patel', owner: PEOPLE.bdRep },
  ];

  /* ---- Research Studies ---- */
  const researchStudies = [
    {
      id: 'study-neurocessa', name: 'Neurocessa NRX-214 (Phase 2, MDD)', sponsor: 'Neurocessa Therapeutics', sponsorId: 'acc-neurocessa',
      phase: 'Phase 2', indication: 'Major Depressive Disorder', therapeuticArea: 'Psychiatry', icpScore: 92, icpFlag: true,
      status: 'Qualified — Unassigned', citelineId: 'CITELINE-88213', ctGovId: 'NCT07-DEMO-214', enrollmentTarget: 240, plannedStart: daysFromNow(75),
      source: 'Citeline (via MuleSoft)', ingestedDate: daysAgo(4), assignedBdRep: '', approvalStatus: 'Pending Review',
    },
    {
      id: 'study-somnaris', name: 'Somnaris SOM-449 (Phase 2, OSA)', sponsor: 'Somnaris Bio', sponsorId: 'acc-somnaris',
      phase: 'Phase 2', indication: 'Obstructive Sleep Apnea', therapeuticArea: 'Sleep Medicine', icpScore: 81, icpFlag: true,
      status: 'This Week’s Qualified: Unassigned', citelineId: 'CITELINE-88490', ctGovId: 'NCT07-DEMO-449', enrollmentTarget: 180, plannedStart: daysFromNow(120),
      source: 'ClinicalTrials.gov (via MuleSoft)', ingestedDate: daysAgo(2), assignedBdRep: '', approvalStatus: 'Pending Review',
    },
    {
      id: 'study-cortexa', name: 'Cortexa CX-77 (Phase 3, Alzheimer’s)', sponsor: 'Cortexa Pharmaceuticals', sponsorId: 'acc-cortexa',
      phase: 'Phase 3', indication: 'Alzheimer’s Disease', therapeuticArea: 'Neurology', icpScore: 88, icpFlag: true,
      status: 'Qualified — Assigned', citelineId: 'CITELINE-87001', ctGovId: 'NCT07-DEMO-077', enrollmentTarget: 600, plannedStart: daysFromNow(40),
      source: 'Citeline (via MuleSoft)', ingestedDate: daysAgo(9), assignedBdRep: 'Alex Kim', approvalStatus: 'Approved',
    },
    {
      id: 'study-parkin', name: 'ParkinRx PKR-3 (Phase 2, Parkinson’s)', sponsor: 'ParkinRx Therapeutics', sponsorId: 'acc-parkin',
      phase: 'Phase 2', indication: 'Parkinson’s Disease', therapeuticArea: 'Movement Disorders', icpScore: 74, icpFlag: true,
      status: 'This Week’s Qualified: Unassigned', citelineId: 'CITELINE-88655', ctGovId: 'NCT07-DEMO-003', enrollmentTarget: 150, plannedStart: daysFromNow(95),
      source: 'Citeline (via MuleSoft)', ingestedDate: daysAgo(1), assignedBdRep: '', approvalStatus: 'Pending Review',
    },
    {
      id: 'study-epilume', name: 'Epilume ELM-12 (Phase 1, Epilepsy)', sponsor: 'Epilume Sciences', sponsorId: 'acc-epilume',
      phase: 'Phase 1', indication: 'Epilepsy', therapeuticArea: 'Epilepsy', icpScore: 63, icpFlag: false,
      status: 'This Week’s Qualified: Unassigned', citelineId: 'CITELINE-88720', ctGovId: 'NCT07-DEMO-012', enrollmentTarget: 60, plannedStart: daysFromNow(160),
      source: 'ClinicalTrials.gov (via MuleSoft)', ingestedDate: daysAgo(3), assignedBdRep: '', approvalStatus: 'Pending Review',
    },
    {
      id: 'study-cortexa-schizo', name: 'Cortexa CX-90 (Phase 2, Schizophrenia)', sponsor: 'Cortexa Pharmaceuticals', sponsorId: 'acc-cortexa',
      phase: 'Phase 2', indication: 'Schizophrenia', therapeuticArea: 'Psychiatry', icpScore: 79, icpFlag: true,
      status: 'Qualified — Assigned', citelineId: 'CITELINE-88110', ctGovId: 'NCT07-DEMO-090', enrollmentTarget: 200, plannedStart: daysFromNow(60),
      source: 'Citeline (via MuleSoft)', ingestedDate: daysAgo(11), assignedBdRep: PEOPLE.bdRep, approvalStatus: 'Approved',
    },
  ];

  /* ---- Research Study Locations (junction Study <-> Clinical Site) ---- */
  const studyLocations = [
    { id: nextId('rsl'), studyId: 'study-neurocessa', siteAccountId: 'site-lakeshore', siteName: 'Lakeshore Neuroscience Institute', cityState: 'Chicago, IL', principalInvestigator: 'Dr. Elena Vasquez', status: 'Engaged' },
    { id: nextId('rsl'), studyId: 'study-neurocessa', siteAccountId: 'site-summit', siteName: 'Summit Clinical Research', cityState: 'Denver, CO', principalInvestigator: 'Dr. Harold Chen', status: 'Engaged' },
    { id: nextId('rsl'), studyId: 'study-neurocessa', siteAccountId: 'site-bayview', siteName: 'Bayview Neurology Partners', cityState: 'San Diego, CA', principalInvestigator: 'Dr. Naomi Feldman', status: 'Identified' },
    { id: nextId('rsl'), studyId: 'study-neurocessa', siteAccountId: 'site-northstar', siteName: 'Northstar Sleep & EEG Center', cityState: 'Minneapolis, MN', principalInvestigator: 'Dr. Grace Lin', status: 'Identified' },
    { id: nextId('rsl'), studyId: 'study-neurocessa', siteAccountId: 'site-hudson', siteName: 'Hudson Valley Clinical Studies', cityState: 'Albany, NY', principalInvestigator: 'Dr. Meera Patel', status: 'Contacted' },
    { id: nextId('rsl'), studyId: 'study-somnaris', siteAccountId: 'site-northstar', siteName: 'Northstar Sleep & EEG Center', cityState: 'Minneapolis, MN', principalInvestigator: 'Dr. Grace Lin', status: 'Engaged' },
    { id: nextId('rsl'), studyId: 'study-cortexa', siteAccountId: 'site-riverside', siteName: 'Riverside Memory Clinic', cityState: 'Boston, MA', principalInvestigator: 'Dr. Owen Pratt', status: 'Engaged' },
    { id: nextId('rsl'), studyId: 'study-parkin', siteAccountId: 'site-mesa', siteName: 'Mesa Verde Neurocare', cityState: 'Phoenix, AZ', principalInvestigator: 'Dr. Carla Ruiz', status: 'Identified' },
  ];

  /* ---- Contacts (KOLs / PIs) ---- */
  const contacts = [
    { id: 'contact-vasquez', name: 'Dr. Elena Vasquez', title: 'Director, Neuropsychiatry Research', accountId: 'site-lakeshore', accountName: 'Lakeshore Neuroscience Institute', specialty: 'Neuropsychiatry', role: 'PI', email: 'e.vasquez@lakeshore-nri.org', phone: '(312) 555-0148', publications: '48 peer-reviewed (MDD, EEG biomarkers)', lastEngagement: daysAgo(2) },
    { id: 'contact-brandt', name: 'Dr. Cynthia Brandt', title: 'VP, Clinical Development', accountId: 'acc-neurocessa', accountName: 'Neurocessa Therapeutics', specialty: 'Clinical Development', role: 'KOL', email: 'c.brandt@neurocessa.com', phone: '(617) 555-0193', publications: '12 peer-reviewed', lastEngagement: daysAgo(6) },
    { id: 'contact-chen', name: 'Dr. Harold Chen', title: 'Principal Investigator', accountId: 'site-summit', accountName: 'Summit Clinical Research', specialty: 'Psychiatry', role: 'PI', email: 'h.chen@summitcr.com', phone: '(303) 555-0110', publications: '31 peer-reviewed', lastEngagement: daysAgo(14) },
    { id: 'contact-pratt', name: 'Dr. Owen Pratt', title: 'Director, Memory Disorders', accountId: 'site-riverside', accountName: 'Riverside Memory Clinic', specialty: 'Neurology', role: 'PI', email: 'o.pratt@riversidemem.org', phone: '(617) 555-0177', publications: '55 peer-reviewed', lastEngagement: daysAgo(20) },
    { id: 'contact-lin', name: 'Dr. Grace Lin', title: 'Sleep Medicine Lead', accountId: 'site-northstar', accountName: 'Northstar Sleep & EEG Center', specialty: 'Sleep Medicine', role: 'PI', email: 'g.lin@northstarsleep.com', phone: '(612) 555-0122', publications: '27 peer-reviewed', lastEngagement: daysAgo(8) },
  ];

  /* ---- Account Contact Relationships (a PI can be affiliated with many institutions) ---- */
  const acrs = [
    { id: nextId('acr'), contactId: 'contact-vasquez', accountId: 'site-lakeshore', accountName: 'Lakeshore Neuroscience Institute', recordType: 'Clinical Site', relationshipRole: 'Principal Investigator', primary: true },
    { id: nextId('acr'), contactId: 'contact-vasquez', accountId: 'acc-neurocessa', accountName: 'Neurocessa Therapeutics', recordType: 'Organization', relationshipRole: 'Scientific Advisor', primary: false },
    { id: nextId('acr'), contactId: 'contact-brandt', accountId: 'acc-neurocessa', accountName: 'Neurocessa Therapeutics', recordType: 'Organization', relationshipRole: 'Clinical Development Sponsor', primary: true },
    { id: nextId('acr'), contactId: 'contact-chen', accountId: 'site-summit', accountName: 'Summit Clinical Research', recordType: 'Clinical Site', relationshipRole: 'Principal Investigator', primary: true },
    { id: nextId('acr'), contactId: 'contact-pratt', accountId: 'site-riverside', accountName: 'Riverside Memory Clinic', recordType: 'Clinical Site', relationshipRole: 'Principal Investigator', primary: true },
    { id: nextId('acr'), contactId: 'contact-lin', accountId: 'site-northstar', accountName: 'Northstar Sleep & EEG Center', recordType: 'Clinical Site', relationshipRole: 'Principal Investigator', primary: true },
  ];

  /* ---- Leads (KOL) ---- */
  const leads = [
    { id: 'lead-vasquez', name: 'Dr. Elena Vasquez', title: 'Director, Neuropsychiatry Research', specialty: 'Neuropsychiatry', siteInstitution: 'Lakeshore Neuroscience Institute', siteAccountId: 'site-lakeshore', studyId: 'study-neurocessa', studyName: 'Neurocessa NRX-214 (Phase 2, MDD)', leadStatus: 'Working — Qualified', leadSource: 'KOL Identification (Citeline)', owner: PEOPLE.bdRep, email: '', phone: '', linkedin: '', enriched: false, enrichmentDate: '', converted: false, convertedDate: '', convertedContactId: '' },
    { id: 'lead-okonkwo', name: 'Dr. Blessing Okonkwo', title: 'Attending Neurologist', specialty: 'Neurology', siteInstitution: 'Piedmont Brain Health Center', siteAccountId: 'site-piedmont', studyId: 'study-cortexa', studyName: 'Cortexa CX-77 (Phase 3, Alzheimer’s)', leadStatus: 'New', leadSource: 'KOL Identification (Citeline)', owner: 'Alex Kim', email: '', phone: '', linkedin: '', enriched: false, enrichmentDate: '', converted: false, convertedDate: '', convertedContactId: '' },
    { id: 'lead-santos', name: 'Dr. Miguel Santos', title: 'Sleep Medicine Physician', specialty: 'Sleep Medicine', siteInstitution: 'Northstar Sleep & EEG Center', siteAccountId: 'site-northstar', studyId: 'study-somnaris', studyName: 'Somnaris SOM-449 (Phase 2, OSA)', leadStatus: 'New', leadSource: 'KOL Identification (ClinicalTrials.gov)', owner: PEOPLE.bdRep, email: '', phone: '', linkedin: '', enriched: false, enrichmentDate: '', converted: false, convertedDate: '', convertedContactId: '' },
    { id: 'lead-abara', name: 'Dr. Ngozi Abara', title: 'Movement Disorders Specialist', specialty: 'Movement Disorders', siteInstitution: 'Mesa Verde Neurocare', siteAccountId: 'site-mesa', studyId: 'study-parkin', studyName: 'ParkinRx PKR-3 (Phase 2, Parkinson’s)', leadStatus: 'New', leadSource: 'KOL Identification (Citeline)', owner: PEOPLE.bdRep, email: '', phone: '', linkedin: '', enriched: false, enrichmentDate: '', converted: false, convertedDate: '', convertedContactId: '' },
    { id: 'lead-devlin', name: 'Dr. Sean Devlin', title: 'Epileptologist', specialty: 'Epilepsy', siteInstitution: 'Hudson Valley Clinical Studies', siteAccountId: 'site-hudson', studyId: 'study-epilume', studyName: 'Epilume ELM-12 (Phase 1, Epilepsy)', leadStatus: 'Working — Contacted', leadSource: 'KOL Identification (ClinicalTrials.gov)', owner: PEOPLE.bdRep, email: 's.devlin@hudsonvalleycs.com', phone: '(518) 555-0139', linkedin: '', enriched: true, enrichmentDate: daysAgo(5), converted: false, convertedDate: '', convertedContactId: '' },
  ];

  /* ---- Opportunities ---- */
  const opportunities = [
    {
      id: 'opp-neurocessa', name: 'Neurocessa NRX-214 — Phase 2 MDD — EEG Services', recordType: 'Sales',
      accountId: 'acc-neurocessa', accountName: 'Neurocessa Therapeutics', studyId: 'study-neurocessa', studyName: 'Neurocessa NRX-214 (Phase 2, MDD)',
      indication: 'Major Depressive Disorder', phase: 'Phase 2', stage: 'Qualification', amount: 631000, closeDate: daysFromNow(45),
      forecastCategory: 'Pipeline', owner: PEOPLE.bdRep, awardLetterReceived: false, contractStatus: 'Not Started',
      totalHours: '', creditedHours: '', hourlyRate: '', weeks: '', upfrontPayment: '', netTerms: '', msaExecutedDate: '',
      onboardingFormSent: false, onboardingFormRecipient: '', billingContact: '', productOwner: '', executiveSponsor: '', endUsers: '',
      exhibitLetter: '', projectName: '', asanaProjectId: '', asanaProjectStatus: '',
      parentOpportunityId: '', extensionDays: '', scheduleExtensionNotificationDate: '',
    },
    {
      id: 'opp-somnaris', name: 'Somnaris SOM-449 — Phase 2 OSA — EEG Services', recordType: 'Sales',
      accountId: 'acc-somnaris', accountName: 'Somnaris Bio', studyId: 'study-somnaris', studyName: 'Somnaris SOM-449 (Phase 2, OSA)',
      indication: 'Obstructive Sleep Apnea', phase: 'Phase 2', stage: 'Request', amount: 512000, closeDate: daysFromNow(30),
      forecastCategory: 'Best Case', owner: PEOPLE.bdRep, awardLetterReceived: false, contractStatus: 'Not Started',
      onboardingFormSent: false, parentOpportunityId: '', asanaProjectStatus: '',
    },
    {
      id: 'opp-cortexa', name: 'Cortexa CX-77 — Phase 3 Alzheimer’s — Platform + Services', recordType: 'Sales',
      accountId: 'acc-cortexa', accountName: 'Cortexa Pharmaceuticals', studyId: 'study-cortexa', studyName: 'Cortexa CX-77 (Phase 3, Alzheimer’s)',
      indication: 'Alzheimer’s Disease', phase: 'Phase 3', stage: 'Contracting', amount: 1240000, closeDate: daysFromNow(20),
      forecastCategory: 'Commit', owner: 'Alex Kim', awardLetterReceived: true, contractStatus: 'Sent',
      onboardingFormSent: false, parentOpportunityId: '', asanaProjectStatus: '',
    },
    {
      id: 'opp-cortexa-schizo', name: 'Cortexa CX-90 — Phase 2 Schizophrenia — EEG Services', recordType: 'Sales',
      accountId: 'acc-cortexa', accountName: 'Cortexa Pharmaceuticals', studyId: 'study-cortexa-schizo', studyName: 'Cortexa CX-90 (Phase 2, Schizophrenia)',
      indication: 'Schizophrenia', phase: 'Phase 2', stage: 'Consideration', amount: 578000, closeDate: daysFromNow(55),
      forecastCategory: 'Best Case', owner: PEOPLE.bdRep, awardLetterReceived: false, contractStatus: 'Not Started',
      onboardingFormSent: false, parentOpportunityId: '', asanaProjectStatus: '',
    },
    {
      id: 'opp-parkin', name: 'ParkinRx PKR-3 — Phase 2 Parkinson’s — Scientific Services', recordType: 'Sales',
      accountId: 'acc-parkin', accountName: 'ParkinRx Therapeutics', studyId: 'study-parkin', studyName: 'ParkinRx PKR-3 (Phase 2, Parkinson’s)',
      indication: 'Parkinson’s Disease', phase: 'Phase 2', stage: 'Nurture', amount: 288000, closeDate: daysFromNow(90),
      forecastCategory: 'Pipeline', owner: PEOPLE.bdRep, awardLetterReceived: false, contractStatus: 'Not Started',
      onboardingFormSent: false, parentOpportunityId: '', asanaProjectStatus: '',
    },
    {
      id: 'opp-epilume', name: 'Epilume ELM-12 — Phase 1 Epilepsy — Device & Platform', recordType: 'Sales',
      accountId: 'acc-epilume', accountName: 'Epilume Sciences', studyId: 'study-epilume', studyName: 'Epilume ELM-12 (Phase 1, Epilepsy)',
      indication: 'Epilepsy', phase: 'Phase 1', stage: 'Awareness', amount: 205000, closeDate: daysFromNow(140),
      forecastCategory: 'Omitted', owner: PEOPLE.bdRep, awardLetterReceived: false, contractStatus: 'Not Started',
      onboardingFormSent: false, parentOpportunityId: '', asanaProjectStatus: '',
    },
    {
      id: 'opp-cortexa-won', name: 'Cortexa CX-40 — Phase 2 Migraine — EEG Services', recordType: 'Sales',
      accountId: 'acc-cortexa', accountName: 'Cortexa Pharmaceuticals', studyId: '', studyName: 'Cortexa CX-40 (Phase 2, Migraine)',
      indication: 'Migraine', phase: 'Phase 2', stage: 'Closed Won', amount: 704000, closeDate: daysAgo(35),
      forecastCategory: 'Closed', owner: 'Alex Kim', awardLetterReceived: true, contractStatus: 'Signed',
      totalHours: 5200, creditedHours: 480, hourlyRate: 135, weeks: 52, upfrontPayment: 176000, netTerms: 'Net 45', msaExecutedDate: daysAgo(38),
      onboardingFormSent: true, onboardingFormRecipient: 'Dana Whitfield', billingContact: 'Cortexa AP', productOwner: 'Dr. Sofia Marchetti', executiveSponsor: 'Cortexa CDO', endUsers: 'Cortexa Clinical Ops',
      exhibitLetter: 'Exhibit A', projectName: 'Cortexa CX-40 EEG Program', asanaProjectId: 'ASANA-CX40-1187', asanaProjectStatus: 'Active',
      parentOpportunityId: '', extensionDays: '', scheduleExtensionNotificationDate: '',
    },
    {
      id: 'opp-somnaris-won', name: 'Somnaris SOM-300 — Phase 1 OSA — Device & Logistics', recordType: 'Sales',
      accountId: 'acc-somnaris', accountName: 'Somnaris Bio', studyId: '', studyName: 'Somnaris SOM-300 (Phase 1, OSA)',
      indication: 'Obstructive Sleep Apnea', phase: 'Phase 1', stage: 'Closed Won', amount: 356000, closeDate: daysAgo(70),
      forecastCategory: 'Closed', owner: PEOPLE.bdRep, awardLetterReceived: true, contractStatus: 'Signed',
      totalHours: 2600, creditedHours: 240, hourlyRate: 130, weeks: 40, upfrontPayment: 89000, netTerms: 'Net 30', msaExecutedDate: daysAgo(74),
      onboardingFormSent: true, onboardingFormRecipient: 'Dana Whitfield', billingContact: 'Somnaris AP', productOwner: 'Dr. Sofia Marchetti', executiveSponsor: 'Somnaris CDO', endUsers: 'Somnaris Clinical Ops',
      exhibitLetter: 'Exhibit A', projectName: 'Somnaris SOM-300 Device Program', asanaProjectId: 'ASANA-SOM300-0442', asanaProjectStatus: 'Late Stage: Renewal Window',
      parentOpportunityId: '', extensionDays: '', scheduleExtensionNotificationDate: '',
    },
    {
      id: 'opp-cortexa-lost', name: 'Cortexa CX-15 — Phase 1 Neurology — Platform', recordType: 'Sales',
      accountId: 'acc-cortexa', accountName: 'Cortexa Pharmaceuticals', studyId: '', studyName: 'Cortexa CX-15 (Phase 1, Neurology)',
      indication: 'Neurology', phase: 'Phase 1', stage: 'Closed Lost', amount: 190000, closeDate: daysAgo(50),
      forecastCategory: 'Omitted', owner: 'Alex Kim', awardLetterReceived: false, contractStatus: 'Not Started',
      onboardingFormSent: false, parentOpportunityId: '', asanaProjectStatus: '',
    },
    // Change Order (child of a won opportunity)
    {
      id: 'opp-somnaris-co', name: 'Somnaris SOM-300 — Change Order (Schedule Extension)', recordType: 'Change Order',
      accountId: 'acc-somnaris', accountName: 'Somnaris Bio', studyId: '', studyName: 'Somnaris SOM-300 (Phase 1, OSA)',
      indication: 'Obstructive Sleep Apnea', phase: 'Phase 1', stage: 'Scoped', amount: 84000, closeDate: daysFromNow(15),
      forecastCategory: 'Best Case', owner: PEOPLE.bdRep, awardLetterReceived: false, contractStatus: 'Draft',
      onboardingFormSent: false, parentOpportunityId: 'opp-somnaris-won', exhibitLetter: 'Exhibit B', projectName: 'Somnaris SOM-300 Device Program',
      extensionDays: 45, scheduleExtensionNotificationDate: daysAgo(6), asanaProjectStatus: '',
    },
  ];

  /* ---- Opportunity Sites (engaged / non-engaged) ---- */
  const oppSites = [
    { id: nextId('osite'), opportunityId: 'opp-neurocessa', siteAccountId: 'site-lakeshore', siteName: 'Lakeshore Neuroscience Institute', cityState: 'Chicago, IL', primaryPI: 'Dr. Elena Vasquez', engagementStatus: 'Engaged' },
    { id: nextId('osite'), opportunityId: 'opp-neurocessa', siteAccountId: 'site-summit', siteName: 'Summit Clinical Research', cityState: 'Denver, CO', primaryPI: 'Dr. Harold Chen', engagementStatus: 'Engaged' },
    { id: nextId('osite'), opportunityId: 'opp-neurocessa', siteAccountId: 'site-bayview', siteName: 'Bayview Neurology Partners', cityState: 'San Diego, CA', primaryPI: 'Dr. Naomi Feldman', engagementStatus: 'Non-Engaged' },
    { id: nextId('osite'), opportunityId: 'opp-neurocessa', siteAccountId: 'site-northstar', siteName: 'Northstar Sleep & EEG Center', cityState: 'Minneapolis, MN', primaryPI: 'Dr. Grace Lin', engagementStatus: 'Non-Engaged' },
    { id: nextId('osite'), opportunityId: 'opp-neurocessa', siteAccountId: 'site-hudson', siteName: 'Hudson Valley Clinical Studies', cityState: 'Albany, NY', primaryPI: 'Dr. Meera Patel', engagementStatus: 'Non-Engaged' },
    { id: nextId('osite'), opportunityId: 'opp-cortexa', siteAccountId: 'site-riverside', siteName: 'Riverside Memory Clinic', cityState: 'Boston, MA', primaryPI: 'Dr. Owen Pratt', engagementStatus: 'Engaged' },
  ];

  /* ---- Opportunity Contact Roles ---- */
  const oppContactRoles = [
    { id: nextId('ocr'), opportunityId: 'opp-neurocessa', contactId: 'contact-vasquez', contactName: 'Dr. Elena Vasquez', role: 'Principal Investigator', title: 'Director, Neuropsychiatry Research', primary: true },
    { id: nextId('ocr'), opportunityId: 'opp-neurocessa', contactId: 'contact-brandt', contactName: 'Dr. Cynthia Brandt', role: 'Economic Buyer', title: 'VP, Clinical Development', primary: false },
    { id: nextId('ocr'), opportunityId: 'opp-cortexa', contactId: 'contact-pratt', contactName: 'Dr. Owen Pratt', role: 'Principal Investigator', title: 'Director, Memory Disorders', primary: true },
  ];

  /* ---- Opportunity Line Items (Opportunity Products) ---- */
  const oppLineItems = [
    { id: nextId('oli'), opportunityId: 'opp-neurocessa', productId: 'prod-device', productName: 'Device & Logistics Services', quantity: 1, salesPrice: 145000, assetId: '' },
    { id: nextId('oli'), opportunityId: 'opp-neurocessa', productId: 'prod-platform', productName: 'Beacon Platform: Core Tier', quantity: 1, salesPrice: 320000, assetId: '' },
    { id: nextId('oli'), opportunityId: 'opp-neurocessa', productId: 'prod-clinops', productName: 'Clinical Operations Support', quantity: 6, salesPrice: 18500, assetId: '' },
    { id: nextId('oli'), opportunityId: 'opp-neurocessa', productId: 'prod-scipm', productName: 'Scientific PM (Monthly Retainer)', quantity: 4, salesPrice: 12500, assetId: '' },
    { id: nextId('oli'), opportunityId: 'opp-cortexa', productId: 'prod-platform', productName: 'Beacon Platform: Core Tier', quantity: 1, salesPrice: 320000, assetId: '' },
    { id: nextId('oli'), opportunityId: 'opp-cortexa', productId: 'prod-scientific', productName: 'Scientific Services Base Package', quantity: 1, salesPrice: 96000, assetId: '' },
    // Change order — time-based lines only
    { id: nextId('oli'), opportunityId: 'opp-somnaris-co', productId: 'prod-clinops', productName: 'Clinical Operations Support', quantity: 3, salesPrice: 18500, assetId: '' },
    { id: nextId('oli'), opportunityId: 'opp-somnaris-co', productId: 'prod-scipm', productName: 'Scientific PM (Monthly Retainer)', quantity: 2, salesPrice: 12500, assetId: '' },
  ];

  /* ---- Quotes + Quote Line Items ---- */
  const quotes = [
    { id: 'quote-neurocessa', name: 'Neurocessa NRX-214 — Quote v2', opportunityId: 'opp-neurocessa', opportunityName: 'Neurocessa NRX-214 — Phase 2 MDD — EEG Services', status: 'Draft', total: 631000, expirationDate: daysFromNow(30), preparedBy: PEOPLE.bdRep, externalQuoteSheetRef: 'SharePoint › Quotes › NRX-214_v2.xlsx' },
    { id: 'quote-cortexa', name: 'Cortexa CX-77 — Quote v3', opportunityId: 'opp-cortexa', opportunityName: 'Cortexa CX-77 — Phase 3 Alzheimer’s — Platform + Services', status: 'Presented', total: 1240000, expirationDate: daysFromNow(12), preparedBy: 'Alex Kim', externalQuoteSheetRef: 'SharePoint › Quotes › CX-77_v3.xlsx' },
    { id: 'quote-somnaris', name: 'Somnaris SOM-449 — Quote v1', opportunityId: 'opp-somnaris', opportunityName: 'Somnaris SOM-449 — Phase 2 OSA — EEG Services', status: 'Draft', total: 512000, expirationDate: daysFromNow(25), preparedBy: PEOPLE.bdRep, externalQuoteSheetRef: 'SharePoint › Quotes › SOM-449_v1.xlsx' },
  ];
  const quoteLineItems = [
    { id: nextId('qli'), quoteId: 'quote-neurocessa', productName: 'Device & Logistics Services', quantity: 1, salesPrice: 145000 },
    { id: nextId('qli'), quoteId: 'quote-neurocessa', productName: 'Beacon Platform: Core Tier', quantity: 1, salesPrice: 320000 },
    { id: nextId('qli'), quoteId: 'quote-neurocessa', productName: 'Clinical Operations Support', quantity: 6, salesPrice: 18500 },
    { id: nextId('qli'), quoteId: 'quote-neurocessa', productName: 'Scientific PM (Monthly Retainer)', quantity: 4, salesPrice: 12500 },
    { id: nextId('qli'), quoteId: 'quote-cortexa', productName: 'Beacon Platform: Core Tier', quantity: 1, salesPrice: 320000 },
    { id: nextId('qli'), quoteId: 'quote-cortexa', productName: 'Scientific Services Base Package', quantity: 1, salesPrice: 96000 },
  ];

  /* ---- Sales Contracts ---- */
  const contracts = [
    { id: 'contract-neurocessa-msa', name: 'Neurocessa NRX-214 MSA & SOW', opportunityId: 'opp-neurocessa', opportunityName: 'Neurocessa NRX-214 — Phase 2 MDD — EEG Services', type: 'MSA', status: 'Draft', sentDate: '', viewedDate: '', signedDate: '', adobeSignAgreementId: '', terms: 'Net 45 · 12-month term · Exhibit A' },
    { id: 'contract-cortexa-msa', name: 'Cortexa Master Services Agreement', opportunityId: 'opp-cortexa', opportunityName: 'Cortexa CX-77 — Phase 3 Alzheimer’s', type: 'MSA', status: 'Sent', sentDate: daysAgo(3), viewedDate: '', signedDate: '', adobeSignAgreementId: 'CBJCHBCAABAA-CX77-MSA', terms: 'Net 45 · 24-month term · auto-renew' },
    { id: 'contract-cortexa-sow', name: 'Cortexa CX-77 Statement of Work', opportunityId: 'opp-cortexa', opportunityName: 'Cortexa CX-77 — Phase 3 Alzheimer’s', type: 'SOW', status: 'Viewed', sentDate: daysAgo(3), viewedDate: daysAgo(1), signedDate: '', adobeSignAgreementId: 'CBJCHBCAABAA-CX77-SOW', terms: 'Exhibit A · 52-week schedule' },
    { id: 'contract-cortexa40-msa', name: 'Cortexa CX-40 MSA & SOW', opportunityId: 'opp-cortexa-won', opportunityName: 'Cortexa CX-40 — Phase 2 Migraine', type: 'MSA', status: 'Signed', sentDate: daysAgo(42), viewedDate: daysAgo(40), signedDate: daysAgo(38), adobeSignAgreementId: 'CBJCHBCAABAA-CX40-MSA', terms: 'Net 45 · 12-month term' },
    { id: 'contract-somnaris-msa', name: 'Somnaris SOM-300 MSA & SOW', opportunityId: 'opp-somnaris-won', opportunityName: 'Somnaris SOM-300 — Phase 1 OSA', type: 'MSA', status: 'Signed', sentDate: daysAgo(78), viewedDate: daysAgo(76), signedDate: daysAgo(74), adobeSignAgreementId: 'CBJCHBCAABAA-SOM300-MSA', terms: 'Net 30 · 12-month term' },
    { id: 'contract-somnaris-co', name: 'Somnaris SOM-300 Change Order (Exhibit B)', opportunityId: 'opp-somnaris-co', opportunityName: 'Somnaris SOM-300 — Change Order', type: 'Change Order', status: 'Draft', sentDate: '', viewedDate: '', signedDate: '', adobeSignAgreementId: '', terms: 'Exhibit B · +45 day extension' },
  ];

  /* ---- Files (executed PDFs filed against signed contracts) ---- */
  const files = [
    { id: nextId('file'), contractId: 'contract-cortexa40-msa', name: 'Cortexa_CX-40_MSA_SOW_Executed.pdf', type: 'PDF', uploadedDate: daysAgo(38) },
    { id: nextId('file'), contractId: 'contract-somnaris-msa', name: 'Somnaris_SOM-300_MSA_SOW_Executed.pdf', type: 'PDF', uploadedDate: daysAgo(74) },
  ];

  /* ---- Opportunity Team ---- */
  const oppTeam = [
    { id: nextId('team'), opportunityId: 'opp-neurocessa', userName: PEOPLE.bdRep, teamRole: 'BD', opportunityAccess: 'Read/Write' },
    { id: nextId('team'), opportunityId: 'opp-neurocessa', userName: PEOPLE.medicalDirector, teamRole: 'Medical Director', opportunityAccess: 'Read Only' },
    { id: nextId('team'), opportunityId: 'opp-cortexa', userName: 'Alex Kim', teamRole: 'BD', opportunityAccess: 'Read/Write' },
    { id: nextId('team'), opportunityId: 'opp-cortexa', userName: PEOPLE.clinOpsPm, teamRole: 'ClinOps', opportunityAccess: 'Read Only' },
  ];

  /* ---- Assets (20 Waveband devices) ---- */
  const assets = [];
  const deployedTargets = [
    { accountId: 'site-lakeshore', accountName: 'Lakeshore Neuroscience Institute', opportunityId: 'opp-cortexa-won' },
    { accountId: 'site-summit', accountName: 'Summit Clinical Research', opportunityId: 'opp-cortexa-won' },
    { accountId: 'site-northstar', accountName: 'Northstar Sleep & EEG Center', opportunityId: 'opp-somnaris-won' },
    { accountId: 'site-riverside', accountName: 'Riverside Memory Clinic', opportunityId: 'opp-somnaris-won' },
    { accountId: 'site-lakeshore', accountName: 'Lakeshore Neuroscience Institute', opportunityId: 'opp-somnaris-won' },
  ];
  for (let i = 1; i <= 20; i += 1) {
    const deployed = i <= deployedTargets.length;
    const t = deployed ? deployedTargets[i - 1] : null;
    assets.push({
      id: `asset-${i}`,
      name: `Waveband-${String(1000 + i)}`,
      productId: 'prod-device',
      productName: 'Waveband EEG',
      serialNumber: `WB-24-${String(4200 + i)}`,
      status: deployed ? 'Deployed' : 'Available',
      accountId: deployed ? t.accountId : '',
      accountName: deployed ? t.accountName : 'Beacon Inventory (Unassigned)',
      opportunityId: deployed ? t.opportunityId : '',
    });
  }

  /* ---- Tasks (Activity timeline) ---- */
  const tasks = [
    { id: nextId('task'), subject: 'Intro call: NRX-214 protocol synopsis & EEG endpoints', relatedToId: 'opp-neurocessa', relatedToName: 'Neurocessa NRX-214 — Phase 2 MDD — EEG Services', relatedType: 'opportunity', assignedTo: PEOPLE.bdRep, dueDate: daysFromNow(3), status: 'Open', priority: 'High', origin: 'Manual' },
    { id: nextId('task'), subject: 'Send Waveband device overview to Dr. Vasquez', relatedToId: 'opp-neurocessa', relatedToName: 'Neurocessa NRX-214 — Phase 2 MDD — EEG Services', relatedType: 'opportunity', assignedTo: PEOPLE.bdRep, dueDate: daysAgo(1), status: 'Completed', priority: 'Normal', origin: 'Manual' },
    { id: nextId('task'), subject: 'Follow up on CX-77 SOW redlines', relatedToId: 'opp-cortexa', relatedToName: 'Cortexa CX-77 — Phase 3 Alzheimer’s', relatedType: 'opportunity', assignedTo: 'Alex Kim', dueDate: daysFromNow(2), status: 'Open', priority: 'High', origin: 'Manual' },
  ];

  /* ---- Field History ---- */
  const fieldHistory = [
    { id: nextId('fh'), recordId: 'opp-neurocessa', date: daysAgo(4), field: 'Stage', originalValue: 'Nurture', newValue: 'Qualification', changedBy: PEOPLE.bdRep },
    { id: nextId('fh'), recordId: 'opp-neurocessa', date: daysAgo(6), field: 'Stage', originalValue: 'Awareness', newValue: 'Nurture', changedBy: PEOPLE.bdRep },
    { id: nextId('fh'), recordId: 'opp-cortexa', date: daysAgo(5), field: 'Award Letter Received', originalValue: 'false', newValue: 'true', changedBy: 'Alex Kim' },
    { id: nextId('fh'), recordId: 'opp-cortexa', date: daysAgo(5), field: 'Stage', originalValue: 'Consideration', newValue: 'Contracting', changedBy: 'Alex Kim' },
    { id: nextId('fh'), recordId: 'contract-cortexa-msa', date: daysAgo(3), field: 'Status', originalValue: 'Draft', newValue: 'Sent', changedBy: 'Adobe Acrobat Sign' },
    { id: nextId('fh'), recordId: 'contract-cortexa-sow', date: daysAgo(1), field: 'Status', originalValue: 'Sent', newValue: 'Viewed', changedBy: 'Adobe Acrobat Sign' },
  ];

  /* ---- Engagement History (MCAE) + Campaign History ---- */
  const engagementHistory = [
    { id: nextId('eng'), subjectId: 'lead-vasquez', activityType: 'Email Open', campaignAsset: 'Waveband for MDD — Whitepaper', date: daysAgo(3), detail: 'Opened 2×; clicked EEG endpoints section' },
    { id: nextId('eng'), subjectId: 'lead-vasquez', activityType: 'Web Visit', campaignAsset: 'beaconbiosignals.com/trial-insights-hub', date: daysAgo(2), detail: 'Viewed Trial Insights Hub for 4m 12s' },
    { id: nextId('eng'), subjectId: 'lead-vasquez', activityType: 'Form Submit', campaignAsset: 'MDD EEG Webinar — Registration', date: daysAgo(2), detail: 'Registered for live session' },
    { id: nextId('eng'), subjectId: 'contact-vasquez', activityType: 'Email Open', campaignAsset: 'Waveband for MDD — Whitepaper', date: daysAgo(3), detail: 'Opened 2×' },
    { id: nextId('eng'), subjectId: 'contact-brandt', activityType: 'Web Visit', campaignAsset: 'beaconbiosignals.com/quality-suite', date: daysAgo(6), detail: 'Viewed Quality Suite overview' },
  ];
  const campaignHistory = [
    { id: nextId('camp'), subjectId: 'lead-vasquez', campaign: 'MDD EEG Biomarkers — 2026 Nurture', status: 'Responded', memberSince: daysAgo(12) },
    { id: nextId('camp'), subjectId: 'lead-vasquez', campaign: 'Waveband Platform Webinar Series', status: 'Registered', memberSince: daysAgo(2) },
  ];

  return {
    accounts,
    researchStudies,
    studyLocations,
    contacts,
    acrs,
    leads,
    opportunities,
    oppSites,
    oppContactRoles,
    oppLineItems,
    products: [...PRODUCTS],
    quotes,
    quoteLineItems,
    contracts,
    files,
    oppTeam,
    assets,
    tasks,
    fieldHistory,
    engagementHistory,
    campaignHistory,
    users: [...USERS],
    notifications: [], // seed zero so the journey generates them live
    navIntent: null,
  };
}

/* ------------------------------------------------------------------ *
 * Lifecycle
 * ------------------------------------------------------------------ */
export function seed() {
  if (!state || !state.accounts) {
    state = buildSeed();
  }
  return state;
}
export function reset() {
  state = buildSeed();
  emit();
}
// Initialize on module load
state = buildSeed();

/* ------------------------------------------------------------------ *
 * Generic getters
 * ------------------------------------------------------------------ */
const clone = (x) => (Array.isArray(x) ? x.map((r) => ({ ...r })) : { ...x });
const byId = (list, id) => list.find((r) => r.id === id);

export const getAccounts = () => clone(state.accounts);
export const getAccountById = (id) => { const a = byId(state.accounts, id); return a ? { ...a } : null; };
export const getResearchStudies = () => clone(state.researchStudies);
export const getResearchStudyById = (id) => { const s = byId(state.researchStudies, id); return s ? { ...s } : null; };
export const getLeads = () => clone(state.leads);
export const getLeadById = (id) => { const l = byId(state.leads, id); return l ? { ...l } : null; };
export const getContacts = () => clone(state.contacts);
export const getContactById = (id) => { const c = byId(state.contacts, id); return c ? { ...c } : null; };
export const getOpportunities = () => clone(state.opportunities);
export const getOpportunityById = (id) => { const o = byId(state.opportunities, id); return o ? { ...o } : null; };
export const getQuotes = () => clone(state.quotes);
export const getQuoteById = (id) => { const q = byId(state.quotes, id); return q ? { ...q } : null; };
export const getContracts = () => clone(state.contracts);
export const getContractById = (id) => { const c = byId(state.contracts, id); return c ? { ...c } : null; };
export const getAssets = () => clone(state.assets);
export const getAssetById = (id) => { const a = byId(state.assets, id); return a ? { ...a } : null; };
export const getProducts = () => clone(state.products);
export const getUsers = () => clone(state.users);

/* ------------------------------------------------------------------ *
 * Relationship getters
 * ------------------------------------------------------------------ */
export const getStudyLocations = (studyId) => state.studyLocations.filter((r) => r.studyId === studyId).map(clone);
export const getLocationsForSite = (siteAccountId) => state.studyLocations.filter((r) => r.siteAccountId === siteAccountId).map(clone);
export const getLeadsForStudy = (studyId) => state.leads.filter((l) => l.studyId === studyId).map(clone);
export const getOpportunitiesForStudy = (studyId) => state.opportunities.filter((o) => o.studyId === studyId).map(clone);
export const getOpportunitiesForAccount = (accountId) => state.opportunities.filter((o) => o.accountId === accountId).map(clone);
export const getStudiesForAccount = (accountId) => state.researchStudies.filter((s) => s.sponsorId === accountId).map(clone);
export const getContactsForAccount = (accountId) => state.contacts.filter((c) => c.accountId === accountId).map(clone);
export const getAcrsForContact = (contactId) => state.acrs.filter((r) => r.contactId === contactId).map(clone);
export const getAcrsForAccount = (accountId) => state.acrs.filter((r) => r.accountId === accountId).map(clone);
export const getOppSites = (oppId) => state.oppSites.filter((r) => r.opportunityId === oppId).map(clone);
export const getOppSitesForAccount = (accountId) => state.oppSites.filter((r) => r.siteAccountId === accountId).map(clone);
export const getOppContactRoles = (oppId) => state.oppContactRoles.filter((r) => r.opportunityId === oppId).map(clone);
export const getContactOppRoles = (contactId) => state.oppContactRoles.filter((r) => r.contactId === contactId).map(clone);
export const getOppLineItems = (oppId) => state.oppLineItems.filter((r) => r.opportunityId === oppId).map(clone);
export const getQuotesForOpp = (oppId) => state.quotes.filter((r) => r.opportunityId === oppId).map(clone);
export const getQuoteLineItems = (quoteId) => state.quoteLineItems.filter((r) => r.quoteId === quoteId).map(clone);
export const getContractsForOpp = (oppId) => state.contracts.filter((r) => r.opportunityId === oppId).map(clone);
export const getFilesForContract = (contractId) => state.files.filter((r) => r.contractId === contractId).map(clone);
export const getOppTeam = (oppId) => state.oppTeam.filter((r) => r.opportunityId === oppId).map(clone);
export const getAssetsForAccount = (accountId) => state.assets.filter((r) => r.accountId === accountId).map(clone);
export const getAssetsForOpp = (oppId) => state.assets.filter((r) => r.opportunityId === oppId).map(clone);
export const getTasksForRecord = (recordId) => state.tasks.filter((r) => r.relatedToId === recordId).map(clone);
export const getFieldHistory = (recordId) => state.fieldHistory.filter((r) => r.recordId === recordId).map(clone);
export const getEngagementHistory = (subjectId) => state.engagementHistory.filter((r) => r.subjectId === subjectId).map(clone);
export const getCampaignHistory = (subjectId) => state.campaignHistory.filter((r) => r.subjectId === subjectId).map(clone);

/** Derived: count of open opportunities for a sponsor account. */
export const getOpenOpportunityCount = (accountId) =>
  state.opportunities.filter((o) => o.accountId === accountId && !o.stage.startsWith('Closed')).length;
/** Derived: count of active studies at a clinical site. */
export const getActiveStudyCount = (siteAccountId) =>
  state.studyLocations.filter((r) => r.siteAccountId === siteAccountId).length;
/** Derived: number of research studies a PI is engaged on (by name across study locations). */
export const getStudyCountForPI = (piName) =>
  state.studyLocations.filter((r) => r.principalInvestigator === piName).length;

/* Convenience line-item total */
export const lineItemTotal = (li) => (Number(li.quantity) || 0) * (Number(li.salesPrice) || 0);

/* ------------------------------------------------------------------ *
 * Notifications
 * ------------------------------------------------------------------ */
export const getNotifications = () =>
  [...state.notifications].sort((a, b) => b.createdAt - a.createdAt);
export const getUnreadCount = () => state.notifications.filter((n) => !n.read).length;

function pushNotification({ targetPersona, title, body, deepLink }) {
  state.notifications.push({
    id: nextId('notif'),
    targetPersona,
    title,
    body,
    deepLink,
    read: false,
    createdAt: Date.now(),
  });
}
export function markNotificationRead(id) {
  const n = byId(state.notifications, id);
  if (n && !n.read) {
    n.read = true;
    emit();
  }
}
export function markAllNotificationsRead() {
  state.notifications.forEach((n) => { n.read = true; });
  emit();
}

/* ------------------------------------------------------------------ *
 * Nav intent — how a notification/process node opens a specific record tab
 * without threading query params through hash + path routing modes.
 * ------------------------------------------------------------------ */
export function setNavIntent(recordId, tab) {
  state.navIntent = { recordId, tab };
}
export function consumeNavIntent(recordId) {
  if (state.navIntent && state.navIntent.recordId === recordId) {
    const tab = state.navIntent.tab;
    state.navIntent = null;
    return tab;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

/** #1 Approve & Assign (Research Study) — assign a BD Rep, fire handoff. */
export function approveAndAssignStudy(studyId, bdRep, approvalStatus) {
  const s = byId(state.researchStudies, studyId);
  if (!s) return;
  s.assignedBdRep = bdRep;
  s.approvalStatus = approvalStatus || 'Approved';
  s.status = 'Qualified — Assigned';
  pushNotification({
    targetPersona: 'BD Rep',
    title: `Research Study assigned: ${s.name}`,
    body: `${s.sponsor} · ${s.phase}, ${s.indication}. Review the study and its KOL leads.`,
    deepLink: { route: 'research-study', recordId: studyId, tab: 'kols' },
  });
  emit();
}

/** Enrich a Lead with Clay (managed package quick action). */
export function enrichLead(leadId) {
  const l = byId(state.leads, leadId);
  if (!l) return;
  l.enriched = true;
  l.enrichmentDate = daysAgo(0);
  if (!l.email) l.email = `${l.name.split(' ').slice(-1)[0].toLowerCase()}@${l.siteInstitution.split(' ')[0].toLowerCase()}.org`;
  if (!l.phone) l.phone = '(312) 555-0199';
  if (!l.linkedin) l.linkedin = `linkedin.com/in/${l.name.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  emit();
}

/** Convert a Lead (KOL) — mark converted, ensure the Opportunity exists, link contact. */
export function convertLead(leadId, details = {}) {
  const l = byId(state.leads, leadId);
  if (!l) return null;
  l.converted = true;
  l.leadStatus = 'Converted';
  l.convertedDate = daysAgo(0);

  // Ensure a Contact exists for this KOL
  let contact = state.contacts.find((c) => c.name === l.name);
  if (!contact) {
    contact = {
      id: nextId('contact'), name: l.name, title: l.title, accountId: l.siteAccountId,
      accountName: l.siteInstitution, specialty: l.specialty, role: 'PI',
      email: l.email, phone: l.phone, publications: '—', lastEngagement: daysAgo(0),
    };
    state.contacts.push(contact);
  }
  l.convertedContactId = contact.id;

  // The journey Opportunity is pre-seeded; if converting a different lead, create one.
  let opp = l.studyId ? state.opportunities.find((o) => o.studyId === l.studyId && o.recordType === 'Sales') : null;
  if (!opp) {
    opp = {
      id: nextId('opp'), name: details.opportunityName || `${l.studyName} — EEG Services`, recordType: 'Sales',
      accountId: l.siteAccountId, accountName: l.siteInstitution, studyId: l.studyId, studyName: l.studyName,
      indication: l.specialty, phase: '', stage: 'Qualification', amount: 0, closeDate: details.closeDate || daysFromNow(45),
      forecastCategory: 'Pipeline', owner: l.owner, awardLetterReceived: false, contractStatus: 'Not Started',
      onboardingFormSent: false, parentOpportunityId: '', asanaProjectStatus: '',
    };
    state.opportunities.push(opp);
    state.oppContactRoles.push({ id: nextId('ocr'), opportunityId: opp.id, contactId: contact.id, contactName: contact.name, role: 'Principal Investigator', title: contact.title, primary: true });
  } else if (details.closeDate) {
    opp.closeDate = details.closeDate;
  }
  emit();
  return opp;
}

/** Inline-edit an Opportunity Product's quantity / sales price. */
export function updateLineItem(itemId, patch) {
  const li = byId(state.oppLineItems, itemId);
  if (!li) return;
  if (patch.quantity != null) li.quantity = Number(patch.quantity);
  if (patch.salesPrice != null) li.salesPrice = Number(patch.salesPrice);
  recalcOpportunityAmount(li.opportunityId);
  emit();
}
function recalcOpportunityAmount(oppId) {
  const opp = byId(state.opportunities, oppId);
  if (!opp) return;
  const total = state.oppLineItems
    .filter((r) => r.opportunityId === oppId)
    .reduce((sum, r) => sum + lineItemTotal(r), 0);
  if (total > 0) opp.amount = total;
}

/** #2 Add an Opportunity Team member — fire handoff to that persona. */
export function addOppTeamMember(oppId, { userName, teamRole, opportunityAccess }) {
  const opp = byId(state.opportunities, oppId);
  if (!opp) return;
  state.oppTeam.push({ id: nextId('team'), opportunityId: oppId, userName, teamRole, opportunityAccess: opportunityAccess || 'Read Only' });
  pushNotification({
    targetPersona: teamRole,
    title: `You were added to Opportunity ${opp.name.split(' — ')[0]} as ${teamRole}`,
    body: `${userName} added you to the Opportunity Team. Review the deal and coordinate on the Team & Activity workspace.`,
    deepLink: { route: 'opportunity', recordId: oppId, tab: 'team' },
  });
  emit();
}
export function removeOppTeamMember(memberId) {
  state.oppTeam = state.oppTeam.filter((r) => r.id !== memberId);
  emit();
}

/** #3 Advance stage — fire CBO handoff when entering Request; enforce gates. */
export function advanceStage(oppId, newStage) {
  const opp = byId(state.opportunities, oppId);
  if (!opp) return { ok: false, reason: 'Opportunity not found' };

  // Gate: cannot enter Contracting until Award Letter Received
  if (newStage === 'Contracting' && !opp.awardLetterReceived) {
    return { ok: false, reason: 'An Award Letter must be received before entering Contracting.' };
  }
  // Gate: cannot mark Closed Won until the related Sales Contract is Signed
  if (newStage === 'Closed Won') {
    const signed = state.contracts.some((c) => c.opportunityId === oppId && c.status === 'Signed');
    if (!signed) {
      return { ok: false, reason: 'A related Sales Contract must be Signed before Closed Won.' };
    }
    return closeWon(oppId);
  }

  const prev = opp.stage;
  opp.stage = newStage;
  state.fieldHistory.push({ id: nextId('fh'), recordId: oppId, date: daysAgo(0), field: 'Stage', originalValue: prev, newValue: newStage, changedBy: opp.owner });

  if (newStage === 'Request') {
    pushNotification({
      targetPersona: 'CBO',
      title: `Quote pending CBO review before Consideration: ${opp.name.split(' — ')[0]}`,
      body: 'Stage reached Request. Review quote and pricing on Products & Quoting before this advances to Consideration.',
      deepLink: { route: 'opportunity', recordId: oppId, tab: 'products' },
    });
  }
  emit();
  return { ok: true };
}

/** Set the Award Letter Received flag (unlocks Contracting). */
export function setAwardLetter(oppId, received) {
  const opp = byId(state.opportunities, oppId);
  if (!opp) return;
  const prev = String(!!opp.awardLetterReceived);
  opp.awardLetterReceived = !!received;
  state.fieldHistory.push({ id: nextId('fh'), recordId: oppId, date: daysAgo(0), field: 'Award Letter Received', originalValue: prev, newValue: String(!!received), changedBy: opp.owner });
  emit();
}

/** Send for Signature (Sales Contract) — status -> Sent. */
export function sendContractForSignature(contractId) {
  const c = byId(state.contracts, contractId);
  if (!c) return;
  const prev = c.status;
  c.status = 'Sent';
  c.sentDate = daysAgo(0);
  if (!c.adobeSignAgreementId) c.adobeSignAgreementId = `CBJCHBCAABAA-${contractId.toUpperCase()}`;
  state.fieldHistory.push({ id: nextId('fh'), recordId: contractId, date: daysAgo(0), field: 'Status', originalValue: prev, newValue: 'Sent', changedBy: 'Adobe Acrobat Sign' });
  const opp = byId(state.opportunities, c.opportunityId);
  if (opp) opp.contractStatus = 'Sent';
  emit();
}

/** Simulate the sponsor advancing an Adobe Sign envelope: Sent -> Viewed -> Signed. */
export function simulateSponsorAction(contractId) {
  const c = byId(state.contracts, contractId);
  if (!c) return;
  const order = ['Draft', 'Sent', 'Viewed', 'Signed'];
  const idx = order.indexOf(c.status);
  if (idx < 0 || idx >= order.length - 1) return;
  const prev = c.status;
  const next = order[idx + 1];
  c.status = next;
  state.fieldHistory.push({ id: nextId('fh'), recordId: contractId, date: daysAgo(0), field: 'Status', originalValue: prev, newValue: next, changedBy: 'Adobe Acrobat Sign' });
  const opp = byId(state.opportunities, c.opportunityId);
  if (next === 'Viewed') c.viewedDate = daysAgo(0);
  if (next === 'Signed') {
    c.signedDate = daysAgo(0);
    if (opp) opp.contractStatus = 'Signed';
    // Executed PDF filed against the contract
    state.files.push({ id: nextId('file'), contractId, name: `${c.name.replace(/[^A-Za-z0-9]+/g, '_')}_Executed.pdf`, type: 'PDF', uploadedDate: daysAgo(0) });
    // #4 handoff to BD Rep
    pushNotification({
      targetPersona: 'BD Rep',
      title: `Sponsor signed: ${c.name}`,
      body: `${c.opportunityName}. Opportunity is ready for Closed Won.`,
      deepLink: { route: 'contract', recordId: contractId, tab: 'documents' },
    });
  }
  emit();
}

/** #5 Closed Won — auto-send onboarding form, fire ClinOps handoff, create Asana handoff. */
export function closeWon(oppId) {
  const opp = byId(state.opportunities, oppId);
  if (!opp) return { ok: false, reason: 'Opportunity not found' };
  const prev = opp.stage;
  opp.stage = 'Closed Won';
  opp.forecastCategory = 'Closed';
  opp.msaExecutedDate = daysAgo(0);
  opp.onboardingFormSent = true;
  if (!opp.onboardingFormRecipient) opp.onboardingFormRecipient = PEOPLE.clinOpsPm;
  // Populate cost info at Closed Won
  if (!opp.totalHours) {
    opp.totalHours = 4800; opp.creditedHours = 420; opp.hourlyRate = 135; opp.weeks = 48;
    opp.upfrontPayment = Math.round((opp.amount || 0) * 0.25); opp.netTerms = 'Net 45';
  }
  // Asana handoff project
  opp.asanaProjectId = `ASANA-${(opp.name.match(/[A-Z]+-\d+/) || ['NRX-214'])[0]}-${Math.floor(1000 + (seq % 9000))}`;
  opp.asanaProjectStatus = 'Onboarding';
  if (!opp.projectName) opp.projectName = `${(opp.name.split(' — ')[0])} Program`;
  state.fieldHistory.push({ id: nextId('fh'), recordId: oppId, date: daysAgo(0), field: 'Stage', originalValue: prev, newValue: 'Closed Won', changedBy: opp.owner });
  pushNotification({
    targetPersona: 'ClinOps Program Manager',
    title: `Closed Won: ${opp.name.split(' — ')[0]}`,
    body: 'Onboarding kickoff ready: capture Key Project Roles on the Opportunity.',
    deepLink: { route: 'opportunity', recordId: oppId, tab: 'details' },
  });
  emit();
  return { ok: true };
}

/** Capture Key Project Roles (Onboarding) guided action. */
export function captureKeyRoles(oppId, roles = {}) {
  const opp = byId(state.opportunities, oppId);
  if (!opp) return;
  Object.assign(opp, {
    onboardingFormRecipient: roles.onboardingFormRecipient ?? opp.onboardingFormRecipient,
    billingContact: roles.billingContact ?? opp.billingContact,
    productOwner: roles.productOwner ?? opp.productOwner,
    executiveSponsor: roles.executiveSponsor ?? opp.executiveSponsor,
    endUsers: roles.endUsers ?? opp.endUsers,
    exhibitLetter: roles.exhibitLetter ?? opp.exhibitLetter,
    projectName: roles.projectName ?? opp.projectName,
  });
  if (!roles.onboardingFormRecipient) {
    state.tasks.push({ id: nextId('task'), subject: 'Assign onboarding recipient', relatedToId: oppId, relatedToName: opp.name, relatedType: 'opportunity', assignedTo: opp.owner, dueDate: daysFromNow(2), status: 'Open', priority: 'High', origin: 'Onboarding Flow' });
  }
  emit();
}

/** #6 Simulate Asana project status: Onboarding -> Active -> Late Stage: Renewal Window. */
export function simulateAsanaStatus(oppId) {
  const opp = byId(state.opportunities, oppId);
  if (!opp) return;
  const order = ['Onboarding', 'Active', 'Late Stage: Renewal Window'];
  const idx = order.indexOf(opp.asanaProjectStatus);
  const next = idx < 0 ? 'Onboarding' : order[Math.min(idx + 1, order.length - 1)];
  if (next === opp.asanaProjectStatus) return;
  opp.asanaProjectStatus = next;
  if (next === 'Late Stage: Renewal Window') {
    state.tasks.push({ id: nextId('task'), subject: 'Identify next-phase opportunity (Change Order) — renewal window', relatedToId: oppId, relatedToName: opp.name, relatedType: 'opportunity', assignedTo: PEOPLE.bdRep, dueDate: daysFromNow(7), status: 'Open', priority: 'High', origin: 'Asana Sync' });
    pushNotification({
      targetPersona: 'BD Rep',
      title: `Project entering renewal window: ${opp.name.split(' — ')[0]}`,
      body: 'Identify the next-phase opportunity (Change Order). A matching Task was created in Activity.',
      deepLink: { route: 'opportunity', recordId: oppId, tab: 'details' },
    });
  }
  emit();
}

/** Log Schedule Extension Notification -> create a Change Order Opportunity. */
export function logScheduleExtension(oppId, details = {}) {
  const parent = byId(state.opportunities, oppId);
  if (!parent) return null;
  const co = {
    id: nextId('opp'),
    name: `${parent.name.split(' — ')[0]} — Change Order (Schedule Extension)`,
    recordType: 'Change Order',
    accountId: parent.accountId, accountName: parent.accountName, studyId: parent.studyId, studyName: parent.studyName,
    indication: parent.indication, phase: parent.phase, stage: 'Identified', amount: details.amount || 84000,
    closeDate: daysFromNow(21), forecastCategory: 'Best Case', owner: PEOPLE.bdRep, awardLetterReceived: false, contractStatus: 'Draft',
    onboardingFormSent: false, parentOpportunityId: parent.id, exhibitLetter: details.exhibitLetter || 'Exhibit A',
    projectName: parent.projectName, extensionDays: details.extensionDays || 45, scheduleExtensionNotificationDate: daysAgo(0),
    asanaProjectStatus: '',
  };
  state.opportunities.push(co);
  // time-based line items
  (details.lineItems || [
    { productId: 'prod-clinops', productName: 'Clinical Operations Support', quantity: 3, salesPrice: 18500 },
    { productId: 'prod-scipm', productName: 'Scientific PM (Monthly Retainer)', quantity: 2, salesPrice: 12500 },
  ]).forEach((li) => state.oppLineItems.push({ id: nextId('oli'), opportunityId: co.id, productId: li.productId, productName: li.productName, quantity: li.quantity, salesPrice: li.salesPrice, assetId: '' }));
  // change-order contract
  state.contracts.push({ id: nextId('contract'), name: `${co.name} (${co.exhibitLetter})`, opportunityId: co.id, opportunityName: co.name, type: 'Change Order', status: 'Draft', sentDate: '', viewedDate: '', signedDate: '', adobeSignAgreementId: '', terms: `${co.exhibitLetter} · +${co.extensionDays} day extension` });
  emit();
  return co;
}

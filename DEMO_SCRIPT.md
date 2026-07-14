# Beacon Biosignals — Life Sciences Sales Wireframe · Presenter Script

A high-fidelity, clickable wireframe of the future-state Salesforce **Life Sciences Cloud** implementation for Beacon Biosignals (EEG-based clinical-trial services sold to biopharma sponsors). **This is not a real Salesforce org** — it runs locally on fictitious seed data so the Wise Wolves consulting team can walk the client through the design during discovery.

> **Primary purpose:** *page layout and data-model discovery* — which fields display where, how tabbed record layouts bundle related lists by job-to-be-done, how list views surface the right records, and how cross-functional handoffs notify the next persona. The storyline gives the pages a narrative; **the pages are the deliverable.**

## How to drive it
- **Journey bar** (docked bottom): numbered steps 0 → 10, **Back / Next**, and **Reset Demo** (restores the seed exactly).
- **Notification bell** (global header): fills as each of the **six** cross-functional handoffs fires. Click a notification to deep-link to the exact record + tab where work resumes.
- **Discovery Mode** (global header, default ON): shows the three annotation chip types — **Best Practice** (blue), **Integration** (neutral), **Open Decision** (amber). Toggle OFF to read the app as a clean org.
- **Theme switcher** (bottom-right utility): SLDS 1 / 2 and light / dark.

Everything depicted maps to **standard Salesforce configuration or the named managed packages** (Adobe Acrobat Sign, MCAE Engagement History, Clay). Nothing on a simulated org page requires custom LWC. There are **no reports, dashboards, or charts anywhere.**

---

## Walkthrough (steps 0–10)

### 0 · Demo Guide (home)
Open on the **Demo Guide**. Walk the **Stakeholder Journey Map** (four persona lanes — BD Coordinator, BD Rep / KAM, CBO, ClinOps Program Manager — across eight lifecycle phases) and note the 🔔 markers at the six handoff points. Then the **clickable Process Diagram** below it — every node deep-links into the app; integration touchpoints (Citeline/ClinicalTrials.gov via MuleSoft, Clay, MCAE, Adobe Acrobat Sign, Asana, Slack) are labeled along the flow. **Point out the notification bell is empty.**

### 1 · Research Studies → the qualified queue
**Research Studies** tab → default list view **“This Week’s Qualified: Unassigned.”** Columns: Study Name, Sponsor, Indication, Phase, ICP Score, Citeline ID, Ingested Date. Switch the list-view picker to show the filter + columns change. Open **Neurocessa NRX-214 (Phase 2, MDD).**
- *Best Practice to pause on:* **“ICP fields grouped in their own section”** (Details → Sourcing & Qualification) — qualification data stays separate from registry data.
- *Open Decision:* **Research Study — standard LSC object vs. custom (undecided).**
- *Integration:* trial intake — *single API, up to two MuleSoft flows, up to three Salesforce objects.*

### 2 · Approve & Assign → 🔔 #1
Launch the **Approve & Assign** guided action (three-screen flow: review → select BD Rep + Approval Status → confirm). Finish → toast, and **the bell shows 1.** Open the tray: *To: BD Rep — “Research Study assigned: Neurocessa NRX-214…”* Follow the deep link to the **KOLs** tab.
- *Best Practice:* **“Filtered KOL lists split open vs converted so triage and follow-up never mix.”**

### 3 · Enrich the PI → Engagement
Open the PI lead **Dr. Elena Vasquez.** Run **Enrich with Clay** (single confirm screen, on-demand only) → Email / Phone / LinkedIn populate with an **Enriched** flag. Review the **Engagement** tab (MCAE Engagement History + Campaign History).
- *Best Practice:* **“Clay-enriched fields sit in Contact Details with an Enriched flag so reps trust provenance”** and **“Engagement tab puts MCAE history one click away before the rep dials.”**
- *Integration:* Clay — *on-demand and one-time-on-assignment enrichment only.*

### 4 · Convert (hit the validation)
Launch **Convert.** Screen 1 = duplicate check (use-existing / create-new). Screen 2 = record details — **leave Close Date blank and click Next to hit the real validation error**, then fill it and proceed. Screen 3 reviews everything the single flow establishes (Opportunity + Research Study link + Account + Clinical Sites + KOL Contacts + Opportunity Contact Roles + Opportunity Sites). Finish → lands on the **Opportunity.**

### 5 · Work the Opportunity (the centerpiece) → 🔔 #2
On **Neurocessa NRX-214 — Phase 2 MDD — EEG Services**:
- **Path** with Beacon handbook stages (Triage → … → Closed Won) — select a step to show its **Key Fields + Guidance for Success.**
- **Products & Quoting:** inline-edit Quantity / Sales Price on Opportunity Products (simple sum, no pricing rules).
- **Team & Activity:** add a **ClinOps** team member → **🔔 #2** (*To: ClinOps — added to the Opportunity Team*), deep-linking to Team & Activity.
- **Sites & Contacts:** the filtered **Engaged** vs **Non-Engaged** site lists.
- *Best Practice to pause on:* **“Compact layout carries Stage + Amount + Close Date + Forecast Category”**, **“Tabs bundle related lists by job”**, **“Filtered related lists split engaged vs non-engaged sites”**, and **“Path Guidance carries the sales handbook’s entry/exit criteria.”**

### 6 · Advance to Request → 🔔 #3 (CBO)
Mark the Path stage complete to **Request** → **🔔 #3** (*To: CBO — “Quote pending CBO review before Consideration”*), deep-linking to Products & Quoting. Open the **Quote** — note the caveat: *quoting is performed outside Salesforce; line items may lag the external quote sheet (SharePoint).*
- *Best Practice:* **“Quote records track status and totals in CRM while the working quote sheet lives in SharePoint; no CPQ or pricing rules in Phase 1.”**

### 7 · Contracting → Send for Signature → 🔔 #4
**Contracting** tab → open the **Sales Contract** → **Send for Signature** (three-screen flow; status → Sent). Use the presenter-chrome **“Simulate Sponsor Action”** control to advance **Sent → Viewed → Signed.** On **Signed**: the executed PDF appears in **Files**, the Opportunity’s Contract Status updates, and **🔔 #4** fires (*To: BD Rep — “Sponsor signed…”*), deep-linking to **Documents & History.**
- *Best Practice:* **“Status driven by the standard Adobe Acrobat Sign managed-package callback”** and **“Executed PDF auto-filed against the contract.”**
- *Open Decisions (next to Contract Field History):* **Part 11 e-signature/audit — Phase 1 vs. informational only**, and **Document storage system of record — SharePoint vs. Salesforce Files.**

### 8 · Award Letter → Contracting → Closed Won → 🔔 #5
Back on the Opportunity: **Mark Award Letter Received** (the gate that unlocks Contracting — *try Contracting first without it to show the block*). Advance the Path to **Contracting**, then to **Closed Won** (blocked until a related contract is **Signed**). Closed Won auto-sends the Onboarding Form, creates the Asana project, and fires **🔔 #5** (*To: ClinOps Program Manager*), deep-linking to Details → Onboarding. Follow it → run **Capture Key Project Roles** (Billing Contact, Product Owner, Executive Sponsor, End Users — all required to complete kickoff).

### 9 · Asana status → Renewal Window → 🔔 #6
Use the presenter-chrome **Asana status** control to move the project **Onboarding → Active → Late Stage: Renewal Window.** The Renewal transition **auto-creates a BD Task** in Activity and fires **🔔 #6** (*To: BD Rep — “Project entering renewal window”*).

### 10 · Log Schedule Extension → Change Order
Launch **Log Schedule Extension Notification** (Extension Days = 45, past the 30-day SOW trigger → select the time-based lines). Finish → a **Change Order Opportunity** (Change Order record type, linked to the parent, Exhibit A) is created and opened. Walk its **abbreviated Path** (Identified → Scoped → Contracting → Closed Won) and the Change-Order-only layout.
- *Best Practice:* **“Separate record type + page layout: change orders show only the fields that matter to an extension.”**

---

## The six handoff notifications (quick reference)
| # | Fires when | To | Deep-links to |
|---|------------|----|----|
| 1 | Approve & Assign finishes | BD Rep | Research Study → KOLs tab |
| 2 | Opportunity Team member added | that persona (e.g. ClinOps) | Opportunity → Team & Activity |
| 3 | Stage reaches Request | CBO | Opportunity → Products & Quoting |
| 4 | Contract status reaches Signed | BD Rep | Sales Contract → Documents & History |
| 5 | Opportunity Closed Won | ClinOps Program Manager | Opportunity → Details (Onboarding) |
| 6 | Asana status → Late Stage: Renewal Window | BD Rep | Opportunity → Details (+ Task in Activity) |

All six are **standard Custom Notifications sent by record-triggered Flows — configuration, not code** (see the Best Practice chip on the notification tray).

## Note on Invoicing (deferred)
**Invoice** and **Invoice Line Item** are modeled on the ERD as custom objects but invoicing is **out of Phase 1 scope**: they are intentionally represented nowhere in the UI — no tab, page, related list, or seed data.

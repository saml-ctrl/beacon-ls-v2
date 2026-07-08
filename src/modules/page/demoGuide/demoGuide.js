import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { setNavIntent } from 'data/store';

const PHASES = [
  'Trial Intake',
  'Qualification & Assignment',
  'KOL Engagement',
  'Opportunity & Quoting',
  'Contracting',
  'Closed Won & Onboarding',
  'ClinOps Handoff',
  'Renewal / Change Order',
];

// activities[laneIndex][phaseIndex] = { text, bells:[nums] }
const LANES = [
  {
    persona: 'BD Coordinator (Triage)',
    cells: [
      { text: 'Ingest Citeline / ClinicalTrials.gov study via MuleSoft; triage ICP fit.' },
      { text: 'Approve & Assign the qualified study to a BD Rep.', bells: [1] },
      {}, {}, {}, {}, {}, {},
    ],
  },
  {
    persona: 'BD Rep / Key Account Manager',
    cells: [
      {},
      { text: 'Receive the assigned study; review its KOL leads.', bells: [1] },
      { text: 'Enrich KOL (Clay); review MCAE engagement; Convert lead → Opportunity.' },
      { text: 'Work the Path; inline-quote; build site strategy; add Opportunity Team.', bells: [2, 3] },
      { text: 'Send contract for signature (Adobe Sign); sponsor signs.', bells: [4] },
      { text: 'Mark Award Letter; Closed Won; hand off to ClinOps.', bells: [5] },
      {},
      { text: 'Renewal window: log Schedule Extension → Change Order.', bells: [6] },
    ],
  },
  {
    persona: 'CBO',
    cells: [
      {}, {}, {},
      { text: 'Review quote & pricing at the Request gate before Consideration.', bells: [3] },
      {}, {}, {}, {},
    ],
  },
  {
    persona: 'ClinOps Program Manager',
    cells: [
      {}, {}, {},
      { text: 'Added to the Opportunity Team; coordinate delivery.', bells: [2] },
      {},
      { text: 'Onboarding kickoff: capture Key Project Roles.', bells: [5] },
      { text: 'Asana project runs (Onboarding → Active); device deployment.' },
      {},
    ],
  },
];

const PROCESS = [
  { key: 'p0', n: '1', label: 'Trial Intake', sublabel: 'Citeline / ClinicalTrials.gov → MuleSoft', path: '/research-studies' },
  { key: 'p1', n: '2', label: 'Qualification & Assignment', sublabel: 'Approve & Assign (bell #1)', path: '/research-studies/study-neurocessa' },
  { key: 'p2', n: '3', label: 'KOL Engagement', sublabel: 'Clay enrichment · MCAE history', path: '/leads/lead-vasquez' },
  { key: 'p3', n: '4', label: 'Opportunity & Quoting', sublabel: 'Path · Products · Team (bells #2, #3)', path: '/opportunities/opp-neurocessa' },
  { key: 'p4', n: '5', label: 'Contracting', sublabel: 'Adobe Acrobat Sign (bell #4)', path: '/opportunities/opp-neurocessa', recordId: 'opp-neurocessa', tab: 'contracting' },
  { key: 'p5', n: '6', label: 'Closed Won & Onboarding', sublabel: 'Onboarding Form · Asana (bell #5)', path: '/opportunities/opp-neurocessa', recordId: 'opp-neurocessa', tab: 'details' },
  { key: 'p6', n: '7', label: 'ClinOps Handoff', sublabel: 'Asana project · Slack collaboration', path: '/opportunities/opp-neurocessa', recordId: 'opp-neurocessa', tab: 'team' },
  { key: 'p7', n: '8', label: 'Renewal / Change Order', sublabel: 'Schedule Extension (bell #6)', path: '/opportunities/opp-neurocessa' },
];

export default class DemoGuide extends LightningElement {
  get phases() { return PHASES; }

  get gridCells() {
    const cells = [];
    cells.push({ key: 'corner', label: 'Persona ╲ Phase', cellClass: 'c-journey__corner', showLabel: true });
    PHASES.forEach((p, i) => cells.push({ key: `ph-${i}`, label: p, cellClass: 'c-journey__phase', showLabel: true }));
    LANES.forEach((lane, li) => {
      cells.push({ key: `lane-${li}`, label: lane.persona, cellClass: 'c-journey__lane', showLabel: true });
      lane.cells.forEach((c, ci) => {
        const bells = c.bells || [];
        cells.push({
          key: `c-${li}-${ci}`,
          text: c.text || '',
          bells: bells.map((n) => ({ n, key: `b-${li}-${ci}-${n}`, label: `#${n}` })),
          hasBells: bells.length > 0,
          showText: true,
          cellClass: c.text ? 'c-journey__cell c-journey__cell_active' : 'c-journey__cell',
        });
      });
    });
    return cells;
  }

  get processNodes() { return PROCESS; }

  handleNav(event) {
    event.preventDefault();
    const el = event.currentTarget;
    const path = el.dataset.path;
    const recordId = el.dataset.recordId;
    const tab = el.dataset.tab;
    if (recordId && tab) setNavIntent(recordId, tab);
    if (path) navigate(path);
  }
}

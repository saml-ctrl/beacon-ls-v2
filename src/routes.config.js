/**
 * Single source of truth for app routes.
 * Consumed by router.js (matching, titles) and app (nav maps, nav items).
 *
 * Fields:
 *   path       - URL pattern (use :param for dynamic segments). Logical, no app prefix.
 *   component  - LWC component name (must be registered in app.js ROUTE_COMPONENTS)
 *   title      - Document title (string or (params) => string)
 *   navPage    - Id for nav active state and navigate({ page }) (omit to hide from nav)
 *   navLabel   - Label shown in nav bar and in the Console object switcher
 *   navPath    - Optional; for dynamic routes, path used in nav links (e.g. /users/42)
 *   navHighlight - Optional; nav page id to highlight when this route is active (for child routes that don't create a tab)
 */

export const routes = [
  {
    path: '/',
    component: 'page-demo-guide',
    title: 'Demo Guide | Life Sciences Sales',
    navPage: 'home',
    navLabel: 'Demo Guide',
  },
  {
    path: '/research-studies',
    component: 'page-research-studies',
    title: 'Research Studies | Life Sciences Sales',
    navPage: 'research-studies',
    navLabel: 'Research Studies',
  },
  {
    path: '/research-studies/:id',
    component: 'page-research-study-detail',
    title: 'Research Study',
    navHighlight: 'research-studies',
  },
  {
    path: '/leads',
    component: 'page-leads',
    title: 'Leads | Life Sciences Sales',
    navPage: 'leads',
    navLabel: 'Leads',
  },
  {
    path: '/leads/:id',
    component: 'page-lead-detail',
    title: 'Lead',
    navHighlight: 'leads',
  },
  {
    path: '/contacts',
    component: 'page-contacts',
    title: 'Contacts | Life Sciences Sales',
    navPage: 'contacts',
    navLabel: 'Contacts',
  },
  {
    path: '/contacts/:id',
    component: 'page-contact-detail',
    title: 'Contact',
    navHighlight: 'contacts',
  },
  {
    path: '/accounts',
    component: 'page-accounts',
    title: 'Accounts | Life Sciences Sales',
    navPage: 'accounts',
    navLabel: 'Accounts',
  },
  {
    path: '/accounts/:id',
    component: 'page-account-detail',
    title: 'Account',
    navHighlight: 'accounts',
  },
  {
    path: '/opportunities',
    component: 'page-opportunities',
    title: 'Opportunities | Life Sciences Sales',
    navPage: 'opportunities',
    navLabel: 'Opportunities',
  },
  {
    path: '/opportunities/:id',
    component: 'page-opportunity-detail',
    title: 'Opportunity',
    navHighlight: 'opportunities',
  },
  {
    path: '/quotes',
    component: 'page-quotes',
    title: 'Quotes | Life Sciences Sales',
    navPage: 'quotes',
    navLabel: 'Quotes',
  },
  {
    path: '/quotes/:id',
    component: 'page-quote-detail',
    title: 'Quote',
    navHighlight: 'quotes',
  },
  {
    path: '/sales-contracts',
    component: 'page-sales-contracts',
    title: 'Sales Contracts | Life Sciences Sales',
    navPage: 'sales-contracts',
    navLabel: 'Sales Contracts',
  },
  {
    path: '/sales-contracts/:id',
    component: 'page-contract-detail',
    title: 'Sales Contract',
    navHighlight: 'sales-contracts',
  },
  {
    path: '/assets',
    component: 'page-assets',
    title: 'Assets | Life Sciences Sales',
    navPage: 'assets',
    navLabel: 'Assets',
  },
  {
    path: '/assets/:id',
    component: 'page-asset-detail',
    title: 'Asset',
    navHighlight: 'assets',
  },
];

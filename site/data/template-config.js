/*
 * Proposal-level settings.
 *
 * Keep reusable document metadata in document-index.js and portfolio ordering
 * in portfolio-index.js. This file is the only place that normally changes
 * when starting a proposal from the template.
 */
window.W_TEMPLATE_CONFIG = Object.freeze({
  passcode: "0000",
  state: "QLD",
  brand: {
    name: "W. TEMPLATE",
    logo: "w-template.png"
  },
  proposal: {
    browserTitle: "W. TEMPLATE · Private Proposal",
    addressHeading: "32 Sutherland Avenue,<br>Ascot.",
    recipients: "Sam and Alex",
    fullAddress: "32 Sutherland Avenue, Ascot QLD 4007.",
    indicativeCost: "$15.6M",
    duration: "20–22"
  },
  supportingDocuments: [
    {
      name: "W.Sutherland · Cost Plan",
      file: "assets/documents/cost/W.Sutherland - Cost Plan.xlsx"
    }
  ],
  pages: [
    { id: "submission", title: "The Submission" },
    { id: "cost", title: "Opinion of Probable Cost" },
    { id: "case-studies", title: "Case Studies" },
    { id: "technology", title: "The Technology Stack" },
    { id: "portfolio", title: "W. Portfolio" },
    { id: "detailed-proposal", title: "Detailed Proposal Example" },
    { id: "team", title: "The Project Team" },
    { id: "process", title: "Our Process" },
    { id: "business", title: "Business Details" },
    { id: "closing", title: "Let's Meet" }
  ]
});

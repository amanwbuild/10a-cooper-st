/*
 * Proposal-level settings.
 *
 * Keep reusable document metadata in document-index.js and portfolio ordering
 * in portfolio-index.js. This file is the only place that normally changes
 * when starting a proposal from the template.
 */
window.W_TEMPLATE_CONFIG = Object.freeze({
  passcode: "2481",
  state: "NSW",
  brand: {
    name: "W.FARNHAM",
    logo: "w-farnham.png"
  },
  proposal: {
    browserTitle: "10A Cooper St, Byron Bay · Private Proposal",
    addressHeading: "10A Cooper St,<br>Byron Bay.",
    recipients: "Melissa & Rob",
    fullAddress: "10A Cooper St, Byron Bay NSW 2481.",
    indicativeCost: "A$5.48M",
    duration: "20–22"
  },
  caseStudies: ["canterbury", "terralsole", "mermaid"],
  supportingDocuments: [
    {
      name: "2026-08-06 · Cost Plan Markup v1",
      file: "assets/documents/cost/2026-08-06_Cost-Plan-Markup_v1.pdf",
      type: "pdf"
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

/*
 * Canonical registry for all supplied reusable documents.
 * National policies are stored once and composed into each state's list.
 */
(function registerDocuments(){
  const nationalInsurance = [
    {
      id: "contract-works-public-liability",
      name: "Contract Works and Public Liability · Certificate of Currency",
      file: "assets/documents/business/national/Contract Works and Public Liability - Certificate of Currency.pdf"
    },
    {
      id: "professional-indemnity-public-liability",
      name: "Professional Indemnity and Public Liability · Certificate of Currency",
      file: "assets/documents/business/national/Professional Indemnity and Public Liability - Certificate of Currency.pdf"
    }
  ];

  const business = {
    VIC: {
      name: "Victoria",
      source: "assets/documents/business/VIC/VIC Business Details.rtf",
      details: [
        ["Company name", "W-CO BUILT PTY LTD"],
        ["Business name", "W.Build"],
        ["ACN", "661 539 591"],
        ["ABN", "47 661 539 591"],
        ["QLD Builders Licence", "15446229"],
        ["Address", "Tenancy 5, Level 3/111 Coventry St, Southbank VIC 3006"],
        ["Directors", "Scott Wilcox"],
        ["Mobile", "0413 688 220"],
        ["Email", "scott@w.build"]
      ],
      documents: [
        ...nationalInsurance,
        { id: "vic-dbi-eligibility", name: "DBI Letter of Eligibility", file: "assets/documents/business/VIC/DBI Letter of Eligibility.pdf" },
        { id: "vic-workcover", name: "WorkCover VIC · Certificate of Currency", file: "assets/documents/business/VIC/WorkCover VIC - Certificate of Currency.pdf" }
      ]
    },
    NSW: {
      name: "New South Wales",
      source: "assets/documents/business/NSW/NSW Business Details.rtf",
      details: [
        ["Company name", "W-CO BUILT PTY LTD"],
        ["Business name", "W.Build"],
        ["ACN", "661 539 591"],
        ["ABN", "47 661 539 591"],
        ["NSW Contractor Licence", "462852C"],
        ["Address", "14 Martin Place, Sydney"],
        ["Directors", "Scott Wilcox"],
        ["Mobile", "0498 178 678"],
        ["Email", "nick@w.build"]
      ],
      documents: [
        ...nationalInsurance,
        { id: "nsw-hbcf-eligibility", name: "Home Building Compensation Fund · Certificate of Eligibility", file: "assets/documents/business/NSW/Home Building Compensation Fund - Certificate of Eligibility.pdf" }
      ]
    },
    QLD: {
      name: "Queensland",
      source: "assets/documents/business/QLD/QLD Business Details.rtf",
      details: [
        ["Company name", "W-CO BUILT PTY LTD"],
        ["Business name", "W.Build"],
        ["ACN", "661 539 591"],
        ["ABN", "47 661 539 591"],
        ["QLD Builders Licence", "15446229"],
        ["Address", "75 Surf Parade, Broadbeach"],
        ["Directors", "Scott Wilcox"],
        ["Mobile", "0413 688 220"],
        ["Email", "scott@w.build"]
      ],
      documents: [
        ...nationalInsurance,
        { id: "qld-qbcc-revenue", name: "QBCC Maximum Revenue Amendment", file: "assets/documents/business/QLD/QBCC Maximum Revenue Amendment.pdf" },
        { id: "qld-workcover", name: "WorkCover QLD · Certificate of Currency", file: "assets/documents/business/QLD/WorkCover QLD - Certificate of Currency.pdf" }
      ]
    }
  };

  const proposal = {
    method: [
      { name: "W.SHELLBANK · 3D Methodology", file: "assets/documents/proposal/methodology/W.SHELLBANK - 3D Methodology.pdf" },
      { name: "W.MOSMAN · 3D Methodology", file: "assets/documents/proposal/methodology/W.MOSMAN - 3D Methodology.pdf" }
    ],
    boq: [
      { name: "W.SAPPHIRE · Architectural Markup", file: "assets/documents/proposal/measurements-and-boq/W.SAPPHIRE - Architectural Markup.pdf" },
      { name: "W.SAPPHIRE · Structural Markup", file: "assets/documents/proposal/measurements-and-boq/W.SAPPHIRE - Structural Markup.pdf" },
      { name: "W.SAPPHIRE · BOQ", file: "assets/documents/proposal/measurements-and-boq/W.SAPPHIRE - BOQ.pdf" }
    ],
    trade: [
      { name: "Trade Recommendation · Joinery", file: "assets/documents/proposal/trade-recommendations/Trade Recommendation - Joinery.pdf" },
      { name: "Trade Recommendation · Joinery Stone", file: "assets/documents/proposal/trade-recommendations/Trade Recommendation - Joinery Stone.pdf" },
      { name: "Trade Recommendation · Aluminium Windows", file: "assets/documents/proposal/trade-recommendations/Trade Recommendation - Aluminium Windows.pdf" }
    ]
  };

  window.W_DOCUMENT_INDEX = Object.freeze({ business, proposal });
})();

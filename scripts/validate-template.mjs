import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteRoot = path.join(repositoryRoot, 'site');
const context = vm.createContext({ window: {} });

for (const relativePath of [
  'data/template-config.js',
  'data/portfolio-index.js',
  'data/document-index.js'
]) {
  const source = fs.readFileSync(path.join(siteRoot, relativePath), 'utf8');
  vm.runInContext(source, context, { filename: relativePath });
}

const config = context.window.W_TEMPLATE_CONFIG;
const portfolio = context.window.W_PORTFOLIO_INDEX;
const documents = context.window.W_DOCUMENT_INDEX;
const html = fs.readFileSync(path.join(siteRoot, 'index.html'), 'utf8');
const failures = [];

function check(condition, message){
  if (!condition) failures.push(message);
}

function checkFile(relativePath, label){
  check(fs.existsSync(path.join(siteRoot, relativePath)), `${label}: missing ${relativePath}`);
}

check(config.passcode === '2481', 'Passcode must remain 2481 for this proposal.');
check(config.proposal.duration === '16', 'The proposal duration must be 16 months.');
check(html.includes('We anticipate a 16 month construction program, start to finish.'), 'The cost-page construction duration must be 16 months.');
checkFile(config.brand.logo, 'Brand logo');

const expectedPages = [
  'submission', 'cost', 'case-studies', 'technology', 'portfolio',
  'detailed-proposal', 'team', 'process', 'business', 'closing'
];
check(JSON.stringify(config.pages.map(page => page.id)) === JSON.stringify(expectedPages), 'Page order does not match the required template order.');
expectedPages.forEach(section => check(html.includes(`data-section="${section}"`), `Missing page section: ${section}`));

check(portfolio.length === 13, `Expected 13 portfolio projects, found ${portfolio.length}.`);
portfolio.forEach((project, index) => {
  check(project.order === index + 1, `Portfolio order gap at ${project.name}.`);
  check(html.includes(`data-project="${project.id}"`), `Missing portfolio card: ${project.id}`);
});
const expectedUnderConstruction = ['aqua', 'hedges', 'esplanade', 'hambleton', 'marine-parade'];
check(
  JSON.stringify(portfolio.filter(project => project.category === 'Under Construction').map(project => project.id)) === JSON.stringify(expectedUnderConstruction),
  'Under Construction must be ordered Aqua, Hedges, Esplanade, Hambleton and Marine Parade.'
);

check(config.pages.find(page => page.id === 'cost')?.title === 'Opinion of Probable Cost', 'The cost-page title must be Opinion of Probable Cost.');
check(config.pages.find(page => page.id === 'case-studies')?.title === 'Case Studies', 'The case-studies title must be Case Studies.');
check(html.includes('<div class="name">Nick Myhal</div>'), 'The closing contact must be Nick Myhal.');
check(!html.includes('<div class="role">Builder</div>'), 'The Builder subtitle must be removed from the closing contact.');
check(html.includes('href="tel:+61498178678">0498 178 678</a>'), 'The closing phone number is incorrect.');
check(html.includes('href="mailto:nick@w.build">nick@w.build</a>'), 'The closing email address is incorrect.');
check(/<div id="caseStudyProjects"><\/div>/.test(html), 'The Case Studies mount point is missing.');
const expectedCaseStudies = ['mermaid', 'canterbury', 'terralsole'];
check(JSON.stringify(config.caseStudies) === JSON.stringify(expectedCaseStudies), 'Case Studies must be Mermaid, Canterbury and Terralsole.');
for (const projectId of config.caseStudies) {
  check(portfolio.some(project => project.id === projectId), `Unknown case study project: ${projectId}`);
}
check(html.includes('<h2 class="rv">One Promise. True Alignment.</h2>'), 'Our Process must open with One Promise. True Alignment.');
check((html.match(/class="p-item"/g) || []).length === 4, 'Our Process must contain the four Mt Rose guarantees.');
check(!/project at<br>\s*<strong id="proposalFullAddress">/.test(html), 'The submission address must wrap naturally without a forced line break.');
check(!html.includes("The homes we've delivered, and the live projects under construction today."), 'The removed portfolio subtitle must not be rendered.');
check(config.supportingDocuments.length === 1, 'The cost-plan markup must be the only supporting document.');
check(config.supportingDocuments[0]?.name === '2026-08-06 · Cost Plan Markup v1', 'The cost-plan markup display name is incorrect.');
check(config.supportingDocuments[0]?.type === 'pdf', 'The cost-plan markup must be configured as a PDF.');
for (const document of config.supportingDocuments) checkFile(document.file, 'Cost-page supporting document');

const documentPaths = new Set();
for (const category of Object.values(documents.proposal)) {
  for (const document of category) documentPaths.add(document.file);
}
for (const [stateCode, state] of Object.entries(documents.business)) {
  check(['VIC', 'NSW', 'QLD'].includes(stateCode), `Unsupported indexed state: ${stateCode}`);
  checkFile(state.source, `${stateCode} business-details source`);
  for (const document of state.documents) documentPaths.add(document.file);
}
const nswDetails = new Map(documents.business.NSW.details);
check(nswDetails.get('Mobile') === '0498 178 678', 'The NSW business-details mobile number is incorrect.');
check(nswDetails.get('Email') === 'nick@w.build', 'The NSW business-details email address is incorrect.');
for (const documentPath of documentPaths) checkFile(documentPath, 'Indexed document');

checkFile('assets/source/Projects in order.xlsx', 'Portfolio-order source workbook');

const localAssetReferences = new Set();
for (const match of html.matchAll(/\bsrc="([^"]+)"/g)) localAssetReferences.add(match[1]);
for (const match of html.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) localAssetReferences.add(match[1]);
for (const assetReference of localAssetReferences) {
  if (/^(?:https?:|data:|about:)/.test(assetReference)) continue;
  checkFile(assetReference.split('#')[0], 'Referenced page asset');
}

if (failures.length){
  console.error(`Template validation failed (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Template validation passed: ${config.pages.length} pages, ${portfolio.length} portfolio projects, ${documentPaths.size} unique PDFs, 3 state profiles.`);

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

check(config.passcode === '0000', 'Passcode must remain 0000.');
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

check(config.pages.find(page => page.id === 'cost')?.title === 'Opinion of Probable Cost', 'The cost-page title must be Opinion of Probable Cost.');
check(config.pages.find(page => page.id === 'case-studies')?.title === 'Case Studies', 'The case-studies title must be Case Studies.');
check(/<div id="caseStudyProjects"><\/div>/.test(html), 'Case Studies must remain empty.');
check(html.includes('<h2 class="rv">One Promise. True Alignment.</h2>'), 'Our Process must open with One Promise. True Alignment.');
check((html.match(/class="p-item"/g) || []).length === 4, 'Our Process must contain the four Mt Rose guarantees.');
check(!/project at<br>\s*<strong id="proposalFullAddress">/.test(html), 'The submission address must wrap naturally without a forced line break.');
check(!html.includes("The homes we've delivered, and the live projects under construction today."), 'The removed portfolio subtitle must not be rendered.');
check(config.supportingDocuments.length === 1, 'The original cost-plan supporting document must be configured.');
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

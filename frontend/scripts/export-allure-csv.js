/* eslint-disable no-console */
// Export Allure results to CSV/HTML and optional PDF
// Usage:
//  - node scripts/export-allure-csv.js
//  - node scripts/export-allure-csv.js --pdf
// Input directory: ./allure-results
// Output: ./allure-export/report.csv, report.html, report.pdf (if --pdf)

import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_DIR = path.resolve(__dirname, '..', 'allure-results');
const OUT_DIR = path.resolve(__dirname, '..', 'allure-export');
const MAKE_PDF = process.argv.includes('--pdf');

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function readJsonSafe(filePath) {
	try {
		const raw = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(raw);
	} catch (e) {
		return null;
	}
}

function flattenSteps(steps = [], parent = []) {
	const rows = [];
	for (const step of steps) {
		const name = typeof step.name === 'string' ? step.name : JSON.stringify(step.name);
		const status = step.status || 'unknown';
		const params = Array.isArray(step.parameters)
			? step.parameters.map(p => `${p.name}=${p.value}`).join('; ')
			: '';
		// Expected/Actual are not native in Allure steps; keep empty unless encoded in name
		const expected = '';
		const actual = '';
		rows.push({
			step: [...parent, name].join(' > '),
			data: params,
			expected,
			actual,
			status
		});
		// recurse
		if (Array.isArray(step.steps) && step.steps.length) {
			rows.push(...flattenSteps(step.steps, [...parent, name]));
		}
	}
	return rows;
}

function collectResults() {
	if (!fs.existsSync(RESULTS_DIR)) {
		console.error(`No allure-results directory found at: ${RESULTS_DIR}`);
		process.exit(1);
	}
	const files = fs.readdirSync(RESULTS_DIR)
		.filter(f => f.endsWith('-result.json') || f.endsWith('result.json'));

	const results = [];
	for (const file of files) {
		const json = readJsonSafe(path.join(RESULTS_DIR, file));
		if (!json) continue;
		const testId = json.historyId || json.testCaseId || json.uuid || path.basename(file, '.json');
		const testTitle = json.name || 'Unnamed Test';
		const status = json.status || 'unknown';
		const steps = flattenSteps(json.steps || []);
		if (steps.length === 0) {
			// create a minimal row to represent the test itself
			steps.push({
				step: 'Test Execution',
				data: '',
				expected: '',
				actual: '',
				status
			});
		}
		for (const s of steps) {
			results.push({
				testId,
				testTitle,
				step: s.step,
				data: s.data,
				expected: s.expected,
				actual: s.actual,
				status: s.status
			});
		}
	}
	return results;
}

function toCsv(rows) {
	const headers = ['Test ID', 'Test Title', 'Step', 'Data', 'Expected', 'Actual', 'Status'];
	const escape = (v) => {
		if (v == null) return '';
		const s = String(v);
		if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
		return s;
	};
	const out = [headers.join(',')];
	for (const r of rows) {
		out.push([
			escape(r.testId),
			escape(r.testTitle),
			escape(r.step),
			escape(r.data),
			escape(r.expected),
			escape(r.actual),
			escape(r.status)
		].join(','));
	}
	return out.join('\n');
}

function toHtml(rows) {
	const css = `
		body { font-family: Arial, Helvetica, sans-serif; padding: 16px; }
		table { border-collapse: collapse; width: 100%; font-size: 14px; }
		th, td { border: 1px solid #e0e0e0; padding: 8px 10px; text-align: left; vertical-align: top; }
		th { background: #fafafa; }
		tr:nth-child(even) { background: #fcfcfc; }
		.status-passed { color: #0b8043; font-weight: 600; }
		.status-failed, .status-broken { color: #c5221f; font-weight: 600; }
		.status-skipped { color: #5f6368; }
		h1 { margin: 0 0 12px 0; font-size: 20px; }
		.meta { color: #5f6368; margin-bottom: 16px; }
	`;
	const rowsHtml = rows.map(r => {
		const cls = `status-${(r.status || '').toLowerCase()}`;
		return `<tr>
			<td>${r.testId || ''}</td>
			<td>${r.testTitle || ''}</td>
			<td>${r.step || ''}</td>
			<td>${r.data || ''}</td>
			<td>${r.expected || ''}</td>
			<td>${r.actual || ''}</td>
			<td class="${cls}">${r.status || ''}</td>
		</tr>`;
	}).join('\n');
	return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Allure Export</title>
<style>${css}</style>
</head>
<body>
<h1>Allure Export</h1>
<div class="meta">Generated: ${new Date().toLocaleString()}</div>
<table>
	<thead>
	<tr>
		<th>Test ID</th>
		<th>Test Title</th>
		<th>Step</th>
		<th>Data</th>
		<th>Expected</th>
		<th>Actual</th>
		<th>Status</th>
	</tr>
	</thead>
	<tbody>
	${rowsHtml}
	</tbody>
</table>
</body>
</html>`;
}

async function maybeGeneratePdf(htmlPath, pdfPath) {
	if (!MAKE_PDF) return;
	let puppeteer;
	try {
		puppeteer = await import('puppeteer');
	} catch (e) {
		console.error('Puppeteer is not installed. Run: npm i -D puppeteer');
		process.exit(1);
	}
	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});
	try {
		const page = await browser.newPage();
		await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
		await page.pdf({
			path: pdfPath,
			format: 'A4',
			printBackground: true,
			margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' }
		});
	} finally {
		await browser.close();
	}
}

async function main() {
	ensureDir(OUT_DIR);
	const rows = collectResults();
	if (rows.length === 0) {
		console.warn('No Allure result rows found to export.');
		return;
	}
	const csvPath = path.join(OUT_DIR, 'report.csv');
	const htmlPath = path.join(OUT_DIR, 'report.html');
	const pdfPath = path.join(OUT_DIR, 'report.pdf');

	fs.writeFileSync(csvPath, toCsv(rows), 'utf8');
	fs.writeFileSync(htmlPath, toHtml(rows), 'utf8');
	console.log(`CSV: ${csvPath}`);
	console.log(`HTML: ${htmlPath}`);

	await maybeGeneratePdf(htmlPath, pdfPath);
	if (MAKE_PDF) {
		console.log(`PDF: ${pdfPath}`);
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});



import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import {
	checklistPreview,
	metricsPreview,
	quotePreview,
	recordPreview,
} from "../src/core/index";
import { Checklist, Metrics, Quote, Record } from "../src/react/index";

const outputDirectory = resolve("evidence");
const htmlPath = resolve(outputDirectory, "component-gallery.html");
const screenshotPath = resolve(outputDirectory, "component-gallery.png");
const componentCss = await readFile("src/react/styles.css", "utf8");

const gallery = renderToStaticMarkup(
	<main className="evidence-gallery">
		<header className="evidence-gallery__header">
			<p>Generative UI Pack · v0.1.0</p>
			<h1>Read-only component evidence</h1>
			<p>
				Canonical preview fixtures rendered through the public React components.
			</p>
		</header>
		<section aria-label="Component previews" className="evidence-gallery__grid">
			<Record {...recordPreview} mode="preview" />
			<Metrics {...metricsPreview} mode="preview" />
			<Checklist {...checklistPreview} mode="preview" />
			<Quote {...quotePreview} mode="preview" />
		</section>
	</main>,
);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Generative UI Pack evidence</title>
<style>
${componentCss}
html { color-scheme: light; background: #eef1f5; }
body { margin: 0; color: #17202b; font-family: var(--gui-font-body); }
.evidence-gallery { width: min(72rem, calc(100% - 2rem)); margin: 3rem auto; }
.evidence-gallery__header { margin-bottom: 2rem; }
.evidence-gallery__header p { margin: 0.35rem 0 0; color: #5d6878; }
.evidence-gallery__header p:first-child { color: #355f8a; font-size: 0.75rem; font-weight: 750; letter-spacing: 0.12em; text-transform: uppercase; }
.evidence-gallery__header h1 { margin: 0.45rem 0 0; font-size: clamp(2rem, 5vw, 3.5rem); letter-spacing: -0.045em; line-height: 1; }
.evidence-gallery__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: 1.25rem; }
@media (max-width: 48rem) { .evidence-gallery__grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>${gallery}</body>
</html>\n`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(htmlPath, html, "utf8");

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
	const page = await browser.newPage({
		viewport: { width: 1440, height: 1100 },
		deviceScaleFactor: 1,
	});
	await page.goto(`file://${htmlPath}`);
	await page.screenshot({ path: screenshotPath, fullPage: true });
} finally {
	await browser.close();
}

process.stdout.write(`Rendered ${htmlPath}\nScreenshot ${screenshotPath}\n`);

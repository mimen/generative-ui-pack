import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
	checklistPreview,
	metricsPreview,
	quotePreview,
	recordPreview,
} from "../src/core/index";
import { Checklist, Metrics, Quote, Record } from "../src/react/index";

describe("read-only React renderers", () => {
	test("SSR renders semantic record and metrics structures", () => {
		const recordHtml = renderToStaticMarkup(
			<Record {...recordPreview} mode="preview" />,
		);
		const metricsHtml = renderToStaticMarkup(
			<Metrics {...metricsPreview} mode="preview" />,
		);

		expect(recordHtml).toContain("<figure");
		expect(recordHtml).toContain("<h3");
		expect(recordHtml).toContain("<dl");
		expect(recordHtml).toContain("<dt>Amount</dt>");
		expect(recordHtml).toContain("<dd>$4,280.00</dd>");
		expect(recordHtml).toContain('data-gui-mode="preview"');
		expect(recordHtml).toContain("Tone: positive. ");
		expect(metricsHtml).toContain("<dl");
		expect(metricsHtml).toContain("Tone: caution. ");
		expect(metricsHtml).toContain("<dt>Revenue</dt>");
		expect(metricsHtml).toContain("$412k");
	});

	test("checklist state and quote attribution remain in the accessibility tree", () => {
		const checklistHtml = renderToStaticMarkup(
			<Checklist {...checklistPreview} mode="preview" />,
		);
		const quoteHtml = renderToStaticMarkup(
			<Quote {...quotePreview} mode="preview" />,
		);

		expect(checklistHtml).toContain("Completed: ");
		expect(checklistHtml).toContain("Not completed: ");
		expect(checklistHtml).toContain('aria-label="2 of 3 completed"');
		expect(quoteHtml).toContain("<blockquote");
		expect(quoteHtml).toContain("<footer>— The expense policy</footer>");
	});

	test("renderers expose no controls or event handlers", () => {
		const html = [
			renderToStaticMarkup(<Record {...recordPreview} />),
			renderToStaticMarkup(<Metrics {...metricsPreview} />),
			renderToStaticMarkup(<Checklist {...checklistPreview} />),
			renderToStaticMarkup(<Quote {...quotePreview} />),
		].join("");

		expect(html).not.toContain("<button");
		expect(html).not.toContain("<input");
		expect(html).not.toContain("onClick");
		expect(html.match(/data-gui-read-only="true"/g)?.length).toBe(4);
	});
});

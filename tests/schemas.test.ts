import { describe, expect, test } from "bun:test";
import {
	ChecklistViewSchema,
	MetricsViewSchema,
	PREVIEW_FIXTURES,
	QuoteViewSchema,
	RecordViewSchema,
} from "../src/core/index";

describe("strict view schemas", () => {
	test("accept every canonical preview fixture", () => {
		expect(RecordViewSchema.safeParse(PREVIEW_FIXTURES.record).success).toBe(
			true,
		);
		expect(MetricsViewSchema.safeParse(PREVIEW_FIXTURES.metrics).success).toBe(
			true,
		);
		expect(
			ChecklistViewSchema.safeParse(PREVIEW_FIXTURES.checklist).success,
		).toBe(true);
		expect(QuoteViewSchema.safeParse(PREVIEW_FIXTURES.quote).success).toBe(
			true,
		);
	});

	test("rejects undeclared fields at every view boundary", () => {
		expect(
			RecordViewSchema.safeParse({
				...PREVIEW_FIXTURES.record,
				hostCallId: "must-not-enter-the-view",
			}).success,
		).toBe(false);
		expect(
			ChecklistViewSchema.safeParse({
				...PREVIEW_FIXTURES.checklist,
				items: [
					{
						text: "One item",
						done: false,
						action: "complete",
					},
				],
			}).success,
		).toBe(false);
	});

	test("enforces the shared metrics limit", () => {
		expect(
			MetricsViewSchema.safeParse({
				title: "Too many",
				metrics: Array.from({ length: 7 }, (_, index) => ({
					label: `Metric ${index}`,
					value: String(index),
				})),
			}).success,
		).toBe(false);
	});
});

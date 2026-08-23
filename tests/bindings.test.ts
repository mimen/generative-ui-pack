import { describe, expect, test } from "bun:test";
import { RecordViewSchema } from "../src/core/index";
import {
	OPENBOT_BINDINGS,
	OpenBotRecordInputSchema,
	openBotRecordBinding,
} from "../src/openbot/index";
import {
	OPENMAUS_BINDINGS,
	OpenMausRecordInputSchema,
} from "../src/openmaus/index";

describe("host binding contracts", () => {
	test("preserves each host's native tool name and kind", () => {
		expect(
			OPENBOT_BINDINGS.map(({ toolName, kind }) => [toolName, kind]),
		).toEqual([
			["showRecord", "card"],
			["showMetrics", "card"],
			["showChecklist", "card"],
			["showQuote", "card"],
		]);
		expect(
			OPENMAUS_BINDINGS.map(({ toolName, kind }) => [toolName, kind]),
		).toEqual([
			["show_record_card", "card"],
			["show_metrics_card", "card"],
			["show_checklist", "list"],
			["show_quote", "card"],
		]);
	});

	test("keeps permissive OpenBot inputs separate from strict portable views", () => {
		const input = {
			title: "Invoice",
			fields: [],
			hostOnlyField: "accepted and stripped by the pinned OpenBot schema",
		};

		expect(OpenBotRecordInputSchema.safeParse(input).success).toBe(true);
		expect(RecordViewSchema.safeParse(input).success).toBe(false);
		expect(openBotRecordBinding.inputSchema).not.toBe(
			openBotRecordBinding.viewSchema,
		);
	});

	test("keeps OpenMaus input limits separate from the canonical resolved view", () => {
		expect(
			OpenMausRecordInputSchema.safeParse({
				title: "x".repeat(201),
				fields: [],
			}).success,
		).toBe(false);
		expect(
			OpenMausRecordInputSchema.safeParse({ title: "", fields: [] }).success,
		).toBe(true);
	});
});

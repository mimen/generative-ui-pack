// Adapted from OpenBot's gallery contracts at the pinned public baseline; modified as portable host bindings. See NOTICE.
import { z } from "zod";
import {
	checklistDefinition,
	metricsDefinition,
	quoteDefinition,
	recordDefinition,
} from "../core/definitions";

const OpenBotToneSchema = z
	.enum(["neutral", "positive", "caution", "negative"])
	.describe(
		"How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable",
	);

export const OpenBotRecordInputSchema = z.object({
	title: z.string().describe("What this record is, e.g. a person or an order"),
	subtitle: z
		.string()
		.optional()
		.describe("One line of context under the title"),
	status: z.string().optional().describe("A short status word, e.g. Approved"),
	statusTone: OpenBotToneSchema.optional(),
	fields: z
		.array(
			z.object({
				label: z.string(),
				value: z.string().describe("Already formatted for a person to read"),
			}),
		)
		.describe("The fields, in the order they should be read"),
});

export const OpenBotMetricsInputSchema = z.object({
	title: z.string().describe("What these figures are about"),
	caption: z.string().optional(),
	metrics: z
		.array(
			z.object({
				label: z.string(),
				value: z
					.string()
					.describe("Already formatted, including any unit or currency"),
				change: z
					.string()
					.optional()
					.describe("The movement, e.g. '+12% on last month'"),
				changeTone: OpenBotToneSchema.optional(),
			}),
		)
		.max(6)
		.describe("Up to six figures. More than that wanted a table"),
});

export const OpenBotChecklistInputSchema = z.object({
	title: z.string().describe("What this list is"),
	caption: z.string().optional(),
	items: z
		.array(
			z.object({
				text: z.string(),
				done: z.boolean().describe("Whether this one is already finished"),
				note: z
					.string()
					.optional()
					.describe("A short aside, e.g. who it is waiting on"),
			}),
		)
		.describe("The items, in the order they should be done"),
});

export const OpenBotQuoteInputSchema = z.object({
	quote: z
		.string()
		.describe("The quotation itself, without surrounding quote marks"),
	attribution: z
		.string()
		.describe(
			"Who said or wrote it, e.g. 'Grace Hopper' or 'the 2026 annual report'",
		),
	context: z
		.string()
		.optional()
		.describe(
			"One short line of context: where it is from, or why it matters here",
		),
});

export const openBotRecordBinding = {
	componentId: "record",
	viewVersion: 1,
	toolName: "showRecord",
	kind: "card",
	title: "Record",
	description:
		"Show one thing and its fields, an order, a person, a ticket. Use instead of describing a record in prose.",
	readOnly: true,
	inputSchema: OpenBotRecordInputSchema,
	viewSchema: recordDefinition.viewSchema,
	preview: recordDefinition.preview,
	confirmation: "The record is now on screen for the person.",
} as const;

export const openBotMetricsBinding = {
	componentId: "metrics",
	viewVersion: 1,
	toolName: "showMetrics",
	kind: "card",
	title: "Headline figures",
	description:
		"Show up to six headline figures, each with an optional movement. Use for a summary somebody reads at a glance.",
	readOnly: true,
	inputSchema: OpenBotMetricsInputSchema,
	viewSchema: metricsDefinition.viewSchema,
	preview: metricsDefinition.preview,
	confirmation: "The figures are now on screen for the person.",
} as const;

export const openBotChecklistBinding = {
	componentId: "checklist",
	viewVersion: 1,
	toolName: "showChecklist",
	kind: "card",
	title: "Checklist",
	description:
		"Show a list of things and which are done. Reporting only, the person cannot tick these, so do not use it to ask for anything.",
	readOnly: true,
	inputSchema: OpenBotChecklistInputSchema,
	viewSchema: checklistDefinition.viewSchema,
	preview: checklistDefinition.preview,
	confirmation: "The checklist is now on screen for the person.",
} as const;

export const openBotQuoteBinding = {
	componentId: "quote",
	viewVersion: 1,
	toolName: "showQuote",
	kind: "card",
	title: "Quotation",
	description:
		"Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.",
	readOnly: true,
	inputSchema: OpenBotQuoteInputSchema,
	viewSchema: quoteDefinition.viewSchema,
	preview: quoteDefinition.preview,
	confirmation: "The quotation is now on screen for the person.",
} as const;

export const OPENBOT_BINDINGS = [
	openBotRecordBinding,
	openBotMetricsBinding,
	openBotChecklistBinding,
	openBotQuoteBinding,
] as const;

export type OpenBotBinding = (typeof OPENBOT_BINDINGS)[number];

// Adapted from OpenMausBot's GallerySpec contracts at the pinned host commit; modified as portable host bindings. See NOTICE.
import { z } from "zod";
import type { JsonObject } from "../compiler/types";
import {
	checklistDefinition,
	metricsDefinition,
	quoteDefinition,
	recordDefinition,
} from "../core/definitions";
import { ToneSchema } from "../core/schemas";

const OPENMAUS_LIMITS = {
	title: 200,
	subtitle: 400,
	label: 120,
	value: 2_000,
	content: 2_000,
	recordRows: 50,
	checklistRows: 100,
	metricsRows: 6,
} as const;

const OpenMausToneParameters = {
	type: "string",
	enum: ["neutral", "positive", "caution", "negative"],
	description:
		"How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable.",
} as const satisfies JsonObject;

export const OpenMausRecordParameters = {
	type: "object",
	additionalProperties: false,
	required: ["title", "fields"],
	properties: {
		title: {
			type: "string",
			maxLength: OPENMAUS_LIMITS.title,
			description: "What this record is, e.g. a person or an order",
		},
		subtitle: {
			type: "string",
			maxLength: OPENMAUS_LIMITS.subtitle,
			description: "One line of context under the title",
		},
		status: {
			type: "string",
			maxLength: OPENMAUS_LIMITS.label,
			description: "A short status word, e.g. Approved",
		},
		statusTone: OpenMausToneParameters,
		fields: {
			type: "array",
			description: "The fields, in the order they should be read",
			maxItems: OPENMAUS_LIMITS.recordRows,
			items: {
				type: "object",
				additionalProperties: false,
				required: ["label", "value"],
				properties: {
					label: { type: "string", maxLength: OPENMAUS_LIMITS.label },
					value: {
						type: "string",
						maxLength: OPENMAUS_LIMITS.value,
						description: "Already formatted for a person to read",
					},
				},
			},
		},
	},
} as const satisfies JsonObject;

export const OpenMausMetricsParameters = {
	type: "object",
	additionalProperties: false,
	required: ["title", "metrics"],
	properties: {
		title: {
			type: "string",
			maxLength: OPENMAUS_LIMITS.title,
			description: "What these figures are about",
		},
		caption: { type: "string", maxLength: OPENMAUS_LIMITS.subtitle },
		metrics: {
			type: "array",
			maxItems: OPENMAUS_LIMITS.metricsRows,
			description: "Up to six figures. More than that wanted a table.",
			items: {
				type: "object",
				additionalProperties: false,
				required: ["label", "value"],
				properties: {
					label: { type: "string", maxLength: OPENMAUS_LIMITS.label },
					value: {
						type: "string",
						maxLength: OPENMAUS_LIMITS.value,
						description: "Already formatted, including any unit or currency",
					},
					change: {
						type: "string",
						maxLength: OPENMAUS_LIMITS.subtitle,
						description: "The movement, e.g. '+12% on last month'",
					},
					changeTone: OpenMausToneParameters,
				},
			},
		},
	},
} as const satisfies JsonObject;

export const OpenMausChecklistParameters = {
	type: "object",
	additionalProperties: false,
	required: ["title", "items"],
	properties: {
		title: {
			type: "string",
			maxLength: OPENMAUS_LIMITS.title,
			description: "What this list is",
		},
		caption: { type: "string", maxLength: OPENMAUS_LIMITS.subtitle },
		items: {
			type: "array",
			description: "The items, in the order they should be done",
			maxItems: OPENMAUS_LIMITS.checklistRows,
			items: {
				type: "object",
				additionalProperties: false,
				required: ["text", "done"],
				properties: {
					text: { type: "string", maxLength: OPENMAUS_LIMITS.content },
					done: {
						type: "boolean",
						description: "Whether this one is already finished",
					},
					note: {
						type: "string",
						maxLength: OPENMAUS_LIMITS.subtitle,
						description: "A short aside, e.g. who it is waiting on",
					},
				},
			},
		},
	},
} as const satisfies JsonObject;

export const OpenMausQuoteParameters = {
	type: "object",
	additionalProperties: false,
	required: ["quote", "attribution"],
	properties: {
		quote: {
			type: "string",
			maxLength: OPENMAUS_LIMITS.value,
			description: "The quotation itself, without surrounding quote marks",
		},
		attribution: {
			type: "string",
			maxLength: OPENMAUS_LIMITS.subtitle,
			description:
				"Who said or wrote it, e.g. 'Grace Hopper' or 'the 2026 annual report'",
		},
		context: {
			type: "string",
			maxLength: OPENMAUS_LIMITS.subtitle,
			description:
				"One short line of context: where it is from, or why it matters here",
		},
	},
} as const satisfies JsonObject;

export const OpenMausRecordInputSchema = z
	.object({
		title: z.string().max(OPENMAUS_LIMITS.title),
		subtitle: z.string().max(OPENMAUS_LIMITS.subtitle).optional(),
		status: z.string().max(OPENMAUS_LIMITS.label).optional(),
		statusTone: ToneSchema.optional(),
		fields: z
			.array(
				z
					.object({
						label: z.string().max(OPENMAUS_LIMITS.label),
						value: z.string().max(OPENMAUS_LIMITS.value),
					})
					.strict(),
			)
			.max(OPENMAUS_LIMITS.recordRows),
	})
	.strict();

export const OpenMausMetricsInputSchema = z
	.object({
		title: z.string().max(OPENMAUS_LIMITS.title),
		caption: z.string().max(OPENMAUS_LIMITS.subtitle).optional(),
		metrics: z
			.array(
				z
					.object({
						label: z.string().max(OPENMAUS_LIMITS.label),
						value: z.string().max(OPENMAUS_LIMITS.value),
						change: z.string().max(OPENMAUS_LIMITS.subtitle).optional(),
						changeTone: ToneSchema.optional(),
					})
					.strict(),
			)
			.max(OPENMAUS_LIMITS.metricsRows),
	})
	.strict();

export const OpenMausChecklistInputSchema = z
	.object({
		title: z.string().max(OPENMAUS_LIMITS.title),
		caption: z.string().max(OPENMAUS_LIMITS.subtitle).optional(),
		items: z
			.array(
				z
					.object({
						text: z.string().max(OPENMAUS_LIMITS.content),
						done: z.boolean(),
						note: z.string().max(OPENMAUS_LIMITS.subtitle).optional(),
					})
					.strict(),
			)
			.max(OPENMAUS_LIMITS.checklistRows),
	})
	.strict();

export const OpenMausQuoteInputSchema = z
	.object({
		quote: z.string().max(OPENMAUS_LIMITS.value),
		attribution: z.string().max(OPENMAUS_LIMITS.subtitle),
		context: z.string().max(OPENMAUS_LIMITS.subtitle).optional(),
	})
	.strict();

const validationAdapter = {
	kind: "json-schema-validator",
	module: "server/ui/validate.ts",
	exportName: "validateArgs",
	contractVersion: 1,
} as const;

export const openMausRecordBinding = {
	componentId: "record",
	viewVersion: 1,
	toolName: "show_record_card",
	kind: "card",
	title: "Record",
	description:
		"Show a structured record on screen: a person, an order, a file, anything with labeled fields. Use instead of a markdown table when the person should read one thing at a glance.",
	readOnly: true,
	inputSchema: OpenMausRecordInputSchema,
	parameters: OpenMausRecordParameters,
	viewSchema: recordDefinition.viewSchema,
	preview: recordDefinition.preview,
	confirmation: "The record is now on screen for the person.",
	validationAdapter,
	legacyToolNames: ["show_record_card"],
} as const;

export const openMausMetricsBinding = {
	componentId: "metrics",
	viewVersion: 1,
	toolName: "show_metrics_card",
	kind: "card",
	title: "Figures",
	description:
		"Show up to six figures with labels. Use when the person should compare numbers, not when a table or a full report is needed.",
	readOnly: true,
	inputSchema: OpenMausMetricsInputSchema,
	parameters: OpenMausMetricsParameters,
	viewSchema: metricsDefinition.viewSchema,
	preview: metricsDefinition.preview,
	confirmation: "The figures are now on screen for the person.",
	validationAdapter,
	legacyToolNames: ["show_metrics_card"],
} as const;

export const openMausChecklistBinding = {
	componentId: "checklist",
	viewVersion: 1,
	toolName: "show_checklist",
	kind: "list",
	title: "Checklist",
	description:
		"Show a read-only checklist. Use for a set of items and whether each is already done. Do not use this for Todoist tasks the person should complete — use show_todoist_tasks for those.",
	readOnly: true,
	inputSchema: OpenMausChecklistInputSchema,
	parameters: OpenMausChecklistParameters,
	viewSchema: checklistDefinition.viewSchema,
	preview: checklistDefinition.preview,
	confirmation: "The checklist is now on screen for the person.",
	validationAdapter,
	legacyToolNames: ["show_checklist"],
} as const;

export const openMausQuoteBinding = {
	componentId: "quote",
	viewVersion: 1,
	toolName: "show_quote",
	kind: "card",
	title: "Quotation",
	description:
		"Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.",
	readOnly: true,
	inputSchema: OpenMausQuoteInputSchema,
	parameters: OpenMausQuoteParameters,
	viewSchema: quoteDefinition.viewSchema,
	preview: quoteDefinition.preview,
	confirmation: "The quotation is now on screen for the person.",
	validationAdapter,
	legacyToolNames: ["show_quote"],
} as const;

export const OPENMAUS_BINDINGS = [
	openMausRecordBinding,
	openMausMetricsBinding,
	openMausChecklistBinding,
	openMausQuoteBinding,
] as const;

export type OpenMausBinding = (typeof OPENMAUS_BINDINGS)[number];

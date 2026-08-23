import {
	checklistPreview,
	metricsPreview,
	quotePreview,
	recordPreview,
} from "./fixtures";
import {
	ChecklistViewSchema,
	MetricsViewSchema,
	QuoteViewSchema,
	RecordViewSchema,
} from "./schemas";
import type { ComponentId } from "./types";

export const recordDefinition = {
	id: "record",
	viewVersion: 1,
	title: "Record",
	description:
		"Show one named record and its display-ready fields instead of describing the record in prose.",
	readOnly: true,
	viewSchema: RecordViewSchema,
	preview: recordPreview,
} as const;

export const metricsDefinition = {
	id: "metrics",
	viewVersion: 1,
	title: "Headline figures",
	description:
		"Show up to six display-ready figures with optional changes for an at-a-glance summary.",
	readOnly: true,
	viewSchema: MetricsViewSchema,
	preview: metricsPreview,
} as const;

export const checklistDefinition = {
	id: "checklist",
	viewVersion: 1,
	title: "Checklist",
	description:
		"Report checklist completion without offering controls or implying that the viewer can change state.",
	readOnly: true,
	viewSchema: ChecklistViewSchema,
	preview: checklistPreview,
} as const;

export const quoteDefinition = {
	id: "quote",
	viewVersion: 1,
	title: "Quotation",
	description:
		"Show exact quoted words with attribution and optional source context.",
	readOnly: true,
	viewSchema: QuoteViewSchema,
	preview: quotePreview,
} as const;

export const COMPONENT_DEFINITIONS = [
	recordDefinition,
	metricsDefinition,
	checklistDefinition,
	quoteDefinition,
] as const;

export type AnyComponentDefinition = (typeof COMPONENT_DEFINITIONS)[number];

export function getComponentDefinition(
	id: ComponentId,
): AnyComponentDefinition {
	switch (id) {
		case "record":
			return recordDefinition;
		case "metrics":
			return metricsDefinition;
		case "checklist":
			return checklistDefinition;
		case "quote":
			return quoteDefinition;
	}
}

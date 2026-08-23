// Adapted from OpenBot preview fixtures; modified as canonical portable evidence. See NOTICE.
import type {
	ChecklistView,
	ComponentViewMap,
	MetricsView,
	QuoteView,
	RecordView,
} from "./types";

export const recordPreview = {
	title: "Invoice 2043",
	subtitle: "Northwind Traders",
	status: "Approved",
	statusTone: "positive",
	fields: [
		{ label: "Amount", value: "$4,280.00" },
		{ label: "Raised", value: "12 March" },
		{ label: "Owner", value: "Priya Raman" },
	],
} as const satisfies RecordView;

export const metricsPreview = {
	title: "This month",
	caption: "Compared with the previous month",
	metrics: [
		{
			label: "Revenue",
			value: "$412k",
			change: "+12% on last month",
			changeTone: "positive",
		},
		{ label: "Open deals", value: "38" },
		{
			label: "Churn",
			value: "1.4%",
			change: "+0.3pt",
			changeTone: "caution",
		},
	],
} as const satisfies MetricsView;

export const checklistPreview = {
	title: "Before the release",
	caption: "Read-only progress report",
	items: [
		{ text: "Migrations applied", done: true },
		{ text: "Changelog written", done: true },
		{ text: "Load test", done: false, note: "Waiting on staging" },
	],
} as const satisfies ChecklistView;

export const quotePreview = {
	quote:
		"Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.",
	attribution: "The expense policy",
	context: "Last changed in March.",
} as const satisfies QuoteView;

export const PREVIEW_FIXTURES = {
	record: recordPreview,
	metrics: metricsPreview,
	checklist: checklistPreview,
	quote: quotePreview,
} as const satisfies ComponentViewMap;

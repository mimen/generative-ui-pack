export const COMPONENT_IDS = [
	"record",
	"metrics",
	"checklist",
	"quote",
] as const;

export type ComponentId = (typeof COMPONENT_IDS)[number];
export type ViewVersion = 1;
export type Tone = "neutral" | "positive" | "caution" | "negative";

export interface ComponentViewMap {
	readonly record: RecordView;
	readonly metrics: MetricsView;
	readonly checklist: ChecklistView;
	readonly quote: QuoteView;
}

export interface RecordField {
	readonly label: string;
	readonly value: string;
}

export interface RecordView {
	readonly title: string;
	readonly subtitle?: string | undefined;
	readonly status?: string | undefined;
	readonly statusTone?: Tone | undefined;
	readonly fields: readonly RecordField[];
}

export interface Metric {
	readonly label: string;
	readonly value: string;
	readonly change?: string | undefined;
	readonly changeTone?: Tone | undefined;
}

export interface MetricsView {
	readonly title: string;
	readonly caption?: string | undefined;
	readonly metrics: readonly Metric[];
}

export interface ChecklistItem {
	readonly text: string;
	readonly done: boolean;
	readonly note?: string | undefined;
}

export interface ChecklistView {
	readonly title: string;
	readonly caption?: string | undefined;
	readonly items: readonly ChecklistItem[];
}

export interface QuoteView {
	readonly quote: string;
	readonly attribution: string;
	readonly context?: string | undefined;
}

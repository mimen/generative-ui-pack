declare const COMPONENT_IDS: readonly ["record", "metrics", "checklist", "quote"];
type ComponentId = (typeof COMPONENT_IDS)[number];
type ViewVersion = 1;
type Tone = "neutral" | "positive" | "caution" | "negative";
interface ComponentViewMap {
    readonly record: RecordView;
    readonly metrics: MetricsView;
    readonly checklist: ChecklistView;
    readonly quote: QuoteView;
}
interface RecordField {
    readonly label: string;
    readonly value: string;
}
interface RecordView {
    readonly title: string;
    readonly subtitle?: string | undefined;
    readonly status?: string | undefined;
    readonly statusTone?: Tone | undefined;
    readonly fields: readonly RecordField[];
}
interface Metric {
    readonly label: string;
    readonly value: string;
    readonly change?: string | undefined;
    readonly changeTone?: Tone | undefined;
}
interface MetricsView {
    readonly title: string;
    readonly caption?: string | undefined;
    readonly metrics: readonly Metric[];
}
interface ChecklistItem {
    readonly text: string;
    readonly done: boolean;
    readonly note?: string | undefined;
}
interface ChecklistView {
    readonly title: string;
    readonly caption?: string | undefined;
    readonly items: readonly ChecklistItem[];
}
interface QuoteView {
    readonly quote: string;
    readonly attribution: string;
    readonly context?: string | undefined;
}

export { type ComponentId as C, type Metric as M, type QuoteView as Q, type RecordField as R, type Tone as T, type ViewVersion as V, COMPONENT_IDS as a, type ChecklistItem as b, type ChecklistView as c, type ComponentViewMap as d, type MetricsView as e, type RecordView as f };

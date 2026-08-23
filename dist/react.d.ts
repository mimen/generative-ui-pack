import { ReactNode, ReactElement } from 'react';
import { T as Tone, c as ChecklistView, e as MetricsView, Q as QuoteView, f as RecordView } from './types-oGaoYaPx.js';

type ReadOnlyRenderMode = "live" | "preview";
interface FrameProps {
    readonly title: string;
    readonly caption?: string | undefined;
    readonly badge?: ReactNode | undefined;
    readonly children: ReactNode;
    readonly mode?: ReadOnlyRenderMode | undefined;
}
declare function Frame({ title, caption, badge, children, mode, }: FrameProps): ReactElement;
interface BadgeProps {
    readonly tone?: Tone | undefined;
    readonly children: ReactNode;
}
declare function Badge({ tone, children, }: BadgeProps): ReactElement;

interface ChecklistProps extends ChecklistView {
    readonly mode?: ReadOnlyRenderMode;
}
declare function Checklist({ title, caption, items, mode, }: ChecklistProps): ReactElement;

interface MetricsProps extends MetricsView {
    readonly mode?: ReadOnlyRenderMode;
}
declare function Metrics({ title, caption, metrics, mode, }: MetricsProps): ReactElement;

interface QuoteProps extends QuoteView {
    readonly mode?: ReadOnlyRenderMode;
}
declare function Quote({ quote, attribution, context, mode, }: QuoteProps): ReactElement;

interface RecordProps extends RecordView {
    readonly mode?: ReadOnlyRenderMode;
}
declare function Record({ title, subtitle, status, statusTone, fields, mode, }: RecordProps): ReactElement;

declare const READ_ONLY_RENDERERS: {
    readonly record: typeof Record;
    readonly metrics: typeof Metrics;
    readonly checklist: typeof Checklist;
    readonly quote: typeof Quote;
};

export { Badge, type BadgeProps, Checklist, type ChecklistProps, Frame, type FrameProps, Metrics, type MetricsProps, Quote, type QuoteProps, READ_ONLY_RENDERERS, type ReadOnlyRenderMode, Record, type RecordProps };

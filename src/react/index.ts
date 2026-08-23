export type { ChecklistProps } from "./checklist";
export { Checklist } from "./checklist";
export type {
	BadgeProps,
	FrameProps,
	ReadOnlyRenderMode,
} from "./frame";
export { Badge, Frame } from "./frame";
export type { MetricsProps } from "./metrics";
export { Metrics } from "./metrics";
export type { QuoteProps } from "./quote";
export { Quote } from "./quote";
export type { RecordProps } from "./record";
export { Record } from "./record";

import { Checklist } from "./checklist";
import { Metrics } from "./metrics";
import { Quote } from "./quote";
import { Record } from "./record";

export const READ_ONLY_RENDERERS = {
	record: Record,
	metrics: Metrics,
	checklist: Checklist,
	quote: Quote,
} as const;

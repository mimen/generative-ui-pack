// Adapted from OpenMausBot's Metrics card; modified for the portable read-only contract. See NOTICE.
import type { ReactElement } from "react";
import type { MetricsView } from "../core/types";
import { Badge, Frame, type ReadOnlyRenderMode } from "./frame";

export interface MetricsProps extends MetricsView {
	readonly mode?: ReadOnlyRenderMode;
}

export function Metrics({
	title,
	caption,
	metrics,
	mode,
}: MetricsProps): ReactElement {
	return (
		<Frame caption={caption} mode={mode} title={title}>
			<dl className="gui-metrics">
				{metrics.map((metric, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: immutable ordered metrics have no stable IDs or local state.
					<div className="gui-metrics__metric" key={index}>
						<dt>{metric.label}</dt>
						<dd className="gui-metrics__value">{metric.value}</dd>
						{metric.change ? (
							<dd className="gui-metrics__change">
								<Badge tone={metric.changeTone}>{metric.change}</Badge>
							</dd>
						) : null}
					</div>
				))}
			</dl>
		</Frame>
	);
}

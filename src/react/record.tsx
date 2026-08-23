// Adapted from OpenMausBot's Record card; modified for the portable read-only contract. See NOTICE.
import type { ReactElement } from "react";
import type { RecordView } from "../core/types";
import { Badge, Frame, type ReadOnlyRenderMode } from "./frame";

export interface RecordProps extends RecordView {
	readonly mode?: ReadOnlyRenderMode;
}

export function Record({
	title,
	subtitle,
	status,
	statusTone,
	fields,
	mode,
}: RecordProps): ReactElement {
	return (
		<Frame
			badge={status ? <Badge tone={statusTone}>{status}</Badge> : undefined}
			caption={subtitle}
			mode={mode}
			title={title}
		>
			<dl className="gui-record">
				{fields.map((field, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: immutable ordered rows have no stable IDs or local state.
					<div className="gui-record__field" key={index}>
						<dt>{field.label}</dt>
						<dd>{field.value}</dd>
					</div>
				))}
			</dl>
		</Frame>
	);
}

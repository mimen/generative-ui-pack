// Adapted from OpenMausBot's Checklist card; modified for the portable read-only contract. See NOTICE.
import type { ReactElement } from "react";
import type { ChecklistView } from "../core/types";
import { Badge, Frame, type ReadOnlyRenderMode } from "./frame";

export interface ChecklistProps extends ChecklistView {
	readonly mode?: ReadOnlyRenderMode;
}

export function Checklist({
	title,
	caption,
	items,
	mode,
}: ChecklistProps): ReactElement {
	const completedCount = items.filter((item) => item.done).length;
	const completionLabel = `${completedCount} of ${items.length} completed`;

	return (
		<Frame
			badge={
				<Badge
					tone={
						completedCount === items.length && items.length > 0
							? "positive"
							: "neutral"
					}
				>
					{completionLabel}
				</Badge>
			}
			caption={caption}
			mode={mode}
			title={title}
		>
			<ul aria-label={completionLabel} className="gui-checklist">
				{items.map((item, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: immutable ordered checklist rows have no stable IDs or local state.
					<li className="gui-checklist__item" key={index}>
						<span className="gui-visually-hidden">
							{item.done ? "Completed: " : "Not completed: "}
						</span>
						<span
							aria-hidden="true"
							className="gui-checklist__mark"
							data-completed={item.done ? "true" : "false"}
						>
							{item.done ? "✓" : ""}
						</span>
						<span className="gui-checklist__copy">
							<span data-completed={item.done ? "true" : "false"}>
								{item.text}
							</span>
							{item.note ? (
								<span className="gui-checklist__note">{item.note}</span>
							) : null}
						</span>
					</li>
				))}
			</ul>
		</Frame>
	);
}

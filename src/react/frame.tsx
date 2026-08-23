// Adapted from OpenMausBot's UI frame; modified for portable semantic CSS and accessibility. See NOTICE.
import { type ReactElement, type ReactNode, useId } from "react";
import type { Tone } from "../core/types";

export type ReadOnlyRenderMode = "live" | "preview";

export interface FrameProps {
	readonly title: string;
	readonly caption?: string | undefined;
	readonly badge?: ReactNode | undefined;
	readonly children: ReactNode;
	readonly mode?: ReadOnlyRenderMode | undefined;
}

export function Frame({
	title,
	caption,
	badge,
	children,
	mode = "live",
}: FrameProps): ReactElement {
	const titleId = useId();
	const captionId = useId();
	const describedBy = caption ? captionId : undefined;

	return (
		<figure
			aria-describedby={describedBy}
			aria-labelledby={titleId}
			className="gui-frame"
			data-gui-mode={mode}
			data-gui-read-only="true"
		>
			<figcaption className="gui-frame__header">
				<span className="gui-frame__heading">
					<h3 className="gui-frame__title" id={titleId}>
						{title}
					</h3>
					{caption ? (
						<span className="gui-frame__caption" id={captionId}>
							{caption}
						</span>
					) : null}
				</span>
				{badge ? <span className="gui-frame__badge">{badge}</span> : null}
			</figcaption>
			<div className="gui-frame__body">{children}</div>
		</figure>
	);
}

export interface BadgeProps {
	readonly tone?: Tone | undefined;
	readonly children: ReactNode;
}

export function Badge({
	tone = "neutral",
	children,
}: BadgeProps): ReactElement {
	return (
		<span className="gui-badge" data-tone={tone}>
			{tone === "neutral" ? null : (
				<span className="gui-visually-hidden">Tone: {tone}. </span>
			)}
			{children}
		</span>
	);
}

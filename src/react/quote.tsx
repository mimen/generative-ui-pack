// Adapted from OpenMausBot's Quote card; modified for the portable read-only contract. See NOTICE.
import type { ReactElement } from "react";
import type { QuoteView } from "../core/types";
import { Frame, type ReadOnlyRenderMode } from "./frame";

export interface QuoteProps extends QuoteView {
	readonly mode?: ReadOnlyRenderMode;
}

export function Quote({
	quote,
	attribution,
	context,
	mode,
}: QuoteProps): ReactElement {
	return (
		<Frame caption={context} mode={mode} title="Quotation">
			<blockquote className="gui-quote">
				<p>{quote}</p>
				<footer>— {attribution}</footer>
			</blockquote>
		</Frame>
	);
}

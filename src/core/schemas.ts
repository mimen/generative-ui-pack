// Adapted from OpenBot and OpenMausBot view contracts; modified as strict portable schemas. See NOTICE.
import { z } from "zod";

export const ToneSchema = z.enum([
	"neutral",
	"positive",
	"caution",
	"negative",
]);

const DisplayTextSchema = z.string();

export const RecordViewSchema = z
	.object({
		title: DisplayTextSchema,
		subtitle: DisplayTextSchema.optional(),
		status: DisplayTextSchema.optional(),
		statusTone: ToneSchema.optional(),
		fields: z.array(
			z
				.object({
					label: DisplayTextSchema,
					value: DisplayTextSchema,
				})
				.strict(),
		),
	})
	.strict();

export const MetricsViewSchema = z
	.object({
		title: DisplayTextSchema,
		caption: DisplayTextSchema.optional(),
		metrics: z
			.array(
				z
					.object({
						label: DisplayTextSchema,
						value: DisplayTextSchema,
						change: DisplayTextSchema.optional(),
						changeTone: ToneSchema.optional(),
					})
					.strict(),
			)
			.max(6),
	})
	.strict();

export const ChecklistViewSchema = z
	.object({
		title: DisplayTextSchema,
		caption: DisplayTextSchema.optional(),
		items: z.array(
			z
				.object({
					text: DisplayTextSchema,
					done: z.boolean(),
					note: DisplayTextSchema.optional(),
				})
				.strict(),
		),
	})
	.strict();

export const QuoteViewSchema = z
	.object({
		quote: DisplayTextSchema,
		attribution: DisplayTextSchema,
		context: DisplayTextSchema.optional(),
	})
	.strict();

// src/openbot/index.ts
import { z as z2 } from "zod";

// src/core/fixtures.ts
var recordPreview = {
  title: "Invoice 2043",
  subtitle: "Northwind Traders",
  status: "Approved",
  statusTone: "positive",
  fields: [
    { label: "Amount", value: "$4,280.00" },
    { label: "Raised", value: "12 March" },
    { label: "Owner", value: "Priya Raman" }
  ]
};
var metricsPreview = {
  title: "This month",
  caption: "Compared with the previous month",
  metrics: [
    {
      label: "Revenue",
      value: "$412k",
      change: "+12% on last month",
      changeTone: "positive"
    },
    { label: "Open deals", value: "38" },
    {
      label: "Churn",
      value: "1.4%",
      change: "+0.3pt",
      changeTone: "caution"
    }
  ]
};
var checklistPreview = {
  title: "Before the release",
  caption: "Read-only progress report",
  items: [
    { text: "Migrations applied", done: true },
    { text: "Changelog written", done: true },
    { text: "Load test", done: false, note: "Waiting on staging" }
  ]
};
var quotePreview = {
  quote: "Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.",
  attribution: "The expense policy",
  context: "Last changed in March."
};

// src/core/schemas.ts
import { z } from "zod";
var ToneSchema = z.enum([
  "neutral",
  "positive",
  "caution",
  "negative"
]);
var DisplayTextSchema = z.string();
var RecordViewSchema = z.object({
  title: DisplayTextSchema,
  subtitle: DisplayTextSchema.optional(),
  status: DisplayTextSchema.optional(),
  statusTone: ToneSchema.optional(),
  fields: z.array(
    z.object({
      label: DisplayTextSchema,
      value: DisplayTextSchema
    }).strict()
  )
}).strict();
var MetricsViewSchema = z.object({
  title: DisplayTextSchema,
  caption: DisplayTextSchema.optional(),
  metrics: z.array(
    z.object({
      label: DisplayTextSchema,
      value: DisplayTextSchema,
      change: DisplayTextSchema.optional(),
      changeTone: ToneSchema.optional()
    }).strict()
  ).max(6)
}).strict();
var ChecklistViewSchema = z.object({
  title: DisplayTextSchema,
  caption: DisplayTextSchema.optional(),
  items: z.array(
    z.object({
      text: DisplayTextSchema,
      done: z.boolean(),
      note: DisplayTextSchema.optional()
    }).strict()
  )
}).strict();
var QuoteViewSchema = z.object({
  quote: DisplayTextSchema,
  attribution: DisplayTextSchema,
  context: DisplayTextSchema.optional()
}).strict();

// src/core/definitions.ts
var recordDefinition = {
  id: "record",
  viewVersion: 1,
  title: "Record",
  description: "Show one named record and its display-ready fields instead of describing the record in prose.",
  readOnly: true,
  viewSchema: RecordViewSchema,
  preview: recordPreview
};
var metricsDefinition = {
  id: "metrics",
  viewVersion: 1,
  title: "Headline figures",
  description: "Show up to six display-ready figures with optional changes for an at-a-glance summary.",
  readOnly: true,
  viewSchema: MetricsViewSchema,
  preview: metricsPreview
};
var checklistDefinition = {
  id: "checklist",
  viewVersion: 1,
  title: "Checklist",
  description: "Report checklist completion without offering controls or implying that the viewer can change state.",
  readOnly: true,
  viewSchema: ChecklistViewSchema,
  preview: checklistPreview
};
var quoteDefinition = {
  id: "quote",
  viewVersion: 1,
  title: "Quotation",
  description: "Show exact quoted words with attribution and optional source context.",
  readOnly: true,
  viewSchema: QuoteViewSchema,
  preview: quotePreview
};

// src/openbot/index.ts
var OpenBotToneSchema = z2.enum(["neutral", "positive", "caution", "negative"]).describe(
  "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable"
);
var OpenBotRecordInputSchema = z2.object({
  title: z2.string().describe("What this record is, e.g. a person or an order"),
  subtitle: z2.string().optional().describe("One line of context under the title"),
  status: z2.string().optional().describe("A short status word, e.g. Approved"),
  statusTone: OpenBotToneSchema.optional(),
  fields: z2.array(
    z2.object({
      label: z2.string(),
      value: z2.string().describe("Already formatted for a person to read")
    })
  ).describe("The fields, in the order they should be read")
});
var OpenBotMetricsInputSchema = z2.object({
  title: z2.string().describe("What these figures are about"),
  caption: z2.string().optional(),
  metrics: z2.array(
    z2.object({
      label: z2.string(),
      value: z2.string().describe("Already formatted, including any unit or currency"),
      change: z2.string().optional().describe("The movement, e.g. '+12% on last month'"),
      changeTone: OpenBotToneSchema.optional()
    })
  ).max(6).describe("Up to six figures. More than that wanted a table")
});
var OpenBotChecklistInputSchema = z2.object({
  title: z2.string().describe("What this list is"),
  caption: z2.string().optional(),
  items: z2.array(
    z2.object({
      text: z2.string(),
      done: z2.boolean().describe("Whether this one is already finished"),
      note: z2.string().optional().describe("A short aside, e.g. who it is waiting on")
    })
  ).describe("The items, in the order they should be done")
});
var OpenBotQuoteInputSchema = z2.object({
  quote: z2.string().describe("The quotation itself, without surrounding quote marks"),
  attribution: z2.string().describe(
    "Who said or wrote it, e.g. 'Grace Hopper' or 'the 2026 annual report'"
  ),
  context: z2.string().optional().describe(
    "One short line of context: where it is from, or why it matters here"
  )
});
var openBotRecordBinding = {
  componentId: "record",
  viewVersion: 1,
  toolName: "showRecord",
  kind: "card",
  title: "Record",
  description: "Show one thing and its fields, an order, a person, a ticket. Use instead of describing a record in prose.",
  readOnly: true,
  inputSchema: OpenBotRecordInputSchema,
  viewSchema: recordDefinition.viewSchema,
  preview: recordDefinition.preview,
  confirmation: "The record is now on screen for the person."
};
var openBotMetricsBinding = {
  componentId: "metrics",
  viewVersion: 1,
  toolName: "showMetrics",
  kind: "card",
  title: "Headline figures",
  description: "Show up to six headline figures, each with an optional movement. Use for a summary somebody reads at a glance.",
  readOnly: true,
  inputSchema: OpenBotMetricsInputSchema,
  viewSchema: metricsDefinition.viewSchema,
  preview: metricsDefinition.preview,
  confirmation: "The figures are now on screen for the person."
};
var openBotChecklistBinding = {
  componentId: "checklist",
  viewVersion: 1,
  toolName: "showChecklist",
  kind: "card",
  title: "Checklist",
  description: "Show a list of things and which are done. Reporting only, the person cannot tick these, so do not use it to ask for anything.",
  readOnly: true,
  inputSchema: OpenBotChecklistInputSchema,
  viewSchema: checklistDefinition.viewSchema,
  preview: checklistDefinition.preview,
  confirmation: "The checklist is now on screen for the person."
};
var openBotQuoteBinding = {
  componentId: "quote",
  viewVersion: 1,
  toolName: "showQuote",
  kind: "card",
  title: "Quotation",
  description: "Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.",
  readOnly: true,
  inputSchema: OpenBotQuoteInputSchema,
  viewSchema: quoteDefinition.viewSchema,
  preview: quoteDefinition.preview,
  confirmation: "The quotation is now on screen for the person."
};
var OPENBOT_BINDINGS = [
  openBotRecordBinding,
  openBotMetricsBinding,
  openBotChecklistBinding,
  openBotQuoteBinding
];
export {
  OPENBOT_BINDINGS,
  OpenBotChecklistInputSchema,
  OpenBotMetricsInputSchema,
  OpenBotQuoteInputSchema,
  OpenBotRecordInputSchema,
  openBotChecklistBinding,
  openBotMetricsBinding,
  openBotQuoteBinding,
  openBotRecordBinding
};
//# sourceMappingURL=openbot.js.map
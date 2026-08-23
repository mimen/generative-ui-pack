// src/openmaus/index.ts
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

// src/openmaus/index.ts
var OPENMAUS_LIMITS = {
  title: 200,
  subtitle: 400,
  label: 120,
  value: 2e3,
  content: 2e3,
  recordRows: 50,
  checklistRows: 100,
  metricsRows: 6
};
var OpenMausToneParameters = {
  type: "string",
  enum: ["neutral", "positive", "caution", "negative"],
  description: "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable."
};
var OpenMausRecordParameters = {
  type: "object",
  additionalProperties: false,
  required: ["title", "fields"],
  properties: {
    title: {
      type: "string",
      maxLength: OPENMAUS_LIMITS.title,
      description: "What this record is, e.g. a person or an order"
    },
    subtitle: {
      type: "string",
      maxLength: OPENMAUS_LIMITS.subtitle,
      description: "One line of context under the title"
    },
    status: {
      type: "string",
      maxLength: OPENMAUS_LIMITS.label,
      description: "A short status word, e.g. Approved"
    },
    statusTone: OpenMausToneParameters,
    fields: {
      type: "array",
      description: "The fields, in the order they should be read",
      maxItems: OPENMAUS_LIMITS.recordRows,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value"],
        properties: {
          label: { type: "string", maxLength: OPENMAUS_LIMITS.label },
          value: {
            type: "string",
            maxLength: OPENMAUS_LIMITS.value,
            description: "Already formatted for a person to read"
          }
        }
      }
    }
  }
};
var OpenMausMetricsParameters = {
  type: "object",
  additionalProperties: false,
  required: ["title", "metrics"],
  properties: {
    title: {
      type: "string",
      maxLength: OPENMAUS_LIMITS.title,
      description: "What these figures are about"
    },
    caption: { type: "string", maxLength: OPENMAUS_LIMITS.subtitle },
    metrics: {
      type: "array",
      maxItems: OPENMAUS_LIMITS.metricsRows,
      description: "Up to six figures. More than that wanted a table.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value"],
        properties: {
          label: { type: "string", maxLength: OPENMAUS_LIMITS.label },
          value: {
            type: "string",
            maxLength: OPENMAUS_LIMITS.value,
            description: "Already formatted, including any unit or currency"
          },
          change: {
            type: "string",
            maxLength: OPENMAUS_LIMITS.subtitle,
            description: "The movement, e.g. '+12% on last month'"
          },
          changeTone: OpenMausToneParameters
        }
      }
    }
  }
};
var OpenMausChecklistParameters = {
  type: "object",
  additionalProperties: false,
  required: ["title", "items"],
  properties: {
    title: {
      type: "string",
      maxLength: OPENMAUS_LIMITS.title,
      description: "What this list is"
    },
    caption: { type: "string", maxLength: OPENMAUS_LIMITS.subtitle },
    items: {
      type: "array",
      description: "The items, in the order they should be done",
      maxItems: OPENMAUS_LIMITS.checklistRows,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "done"],
        properties: {
          text: { type: "string", maxLength: OPENMAUS_LIMITS.content },
          done: {
            type: "boolean",
            description: "Whether this one is already finished"
          },
          note: {
            type: "string",
            maxLength: OPENMAUS_LIMITS.subtitle,
            description: "A short aside, e.g. who it is waiting on"
          }
        }
      }
    }
  }
};
var OpenMausQuoteParameters = {
  type: "object",
  additionalProperties: false,
  required: ["quote", "attribution"],
  properties: {
    quote: {
      type: "string",
      maxLength: OPENMAUS_LIMITS.value,
      description: "The quotation itself, without surrounding quote marks"
    },
    attribution: {
      type: "string",
      maxLength: OPENMAUS_LIMITS.subtitle,
      description: "Who said or wrote it, e.g. 'Grace Hopper' or 'the 2026 annual report'"
    },
    context: {
      type: "string",
      maxLength: OPENMAUS_LIMITS.subtitle,
      description: "One short line of context: where it is from, or why it matters here"
    }
  }
};
var OpenMausRecordInputSchema = z2.object({
  title: z2.string().max(OPENMAUS_LIMITS.title),
  subtitle: z2.string().max(OPENMAUS_LIMITS.subtitle).optional(),
  status: z2.string().max(OPENMAUS_LIMITS.label).optional(),
  statusTone: ToneSchema.optional(),
  fields: z2.array(
    z2.object({
      label: z2.string().max(OPENMAUS_LIMITS.label),
      value: z2.string().max(OPENMAUS_LIMITS.value)
    }).strict()
  ).max(OPENMAUS_LIMITS.recordRows)
}).strict();
var OpenMausMetricsInputSchema = z2.object({
  title: z2.string().max(OPENMAUS_LIMITS.title),
  caption: z2.string().max(OPENMAUS_LIMITS.subtitle).optional(),
  metrics: z2.array(
    z2.object({
      label: z2.string().max(OPENMAUS_LIMITS.label),
      value: z2.string().max(OPENMAUS_LIMITS.value),
      change: z2.string().max(OPENMAUS_LIMITS.subtitle).optional(),
      changeTone: ToneSchema.optional()
    }).strict()
  ).max(OPENMAUS_LIMITS.metricsRows)
}).strict();
var OpenMausChecklistInputSchema = z2.object({
  title: z2.string().max(OPENMAUS_LIMITS.title),
  caption: z2.string().max(OPENMAUS_LIMITS.subtitle).optional(),
  items: z2.array(
    z2.object({
      text: z2.string().max(OPENMAUS_LIMITS.content),
      done: z2.boolean(),
      note: z2.string().max(OPENMAUS_LIMITS.subtitle).optional()
    }).strict()
  ).max(OPENMAUS_LIMITS.checklistRows)
}).strict();
var OpenMausQuoteInputSchema = z2.object({
  quote: z2.string().max(OPENMAUS_LIMITS.value),
  attribution: z2.string().max(OPENMAUS_LIMITS.subtitle),
  context: z2.string().max(OPENMAUS_LIMITS.subtitle).optional()
}).strict();
var validationAdapter = {
  kind: "json-schema-validator",
  module: "server/ui/validate.ts",
  exportName: "validateArgs",
  contractVersion: 1
};
var openMausRecordBinding = {
  componentId: "record",
  viewVersion: 1,
  toolName: "show_record_card",
  kind: "card",
  title: "Record",
  description: "Show a structured record on screen: a person, an order, a file, anything with labeled fields. Use instead of a markdown table when the person should read one thing at a glance.",
  readOnly: true,
  inputSchema: OpenMausRecordInputSchema,
  parameters: OpenMausRecordParameters,
  viewSchema: recordDefinition.viewSchema,
  preview: recordDefinition.preview,
  confirmation: "The record is now on screen for the person.",
  validationAdapter,
  legacyToolNames: ["show_record_card"]
};
var openMausMetricsBinding = {
  componentId: "metrics",
  viewVersion: 1,
  toolName: "show_metrics_card",
  kind: "card",
  title: "Figures",
  description: "Show up to six figures with labels. Use when the person should compare numbers, not when a table or a full report is needed.",
  readOnly: true,
  inputSchema: OpenMausMetricsInputSchema,
  parameters: OpenMausMetricsParameters,
  viewSchema: metricsDefinition.viewSchema,
  preview: metricsDefinition.preview,
  confirmation: "The figures are now on screen for the person.",
  validationAdapter,
  legacyToolNames: ["show_metrics_card"]
};
var openMausChecklistBinding = {
  componentId: "checklist",
  viewVersion: 1,
  toolName: "show_checklist",
  kind: "list",
  title: "Checklist",
  description: "Show a read-only checklist. Use for a set of items and whether each is already done. Do not use this for Todoist tasks the person should complete \u2014 use show_todoist_tasks for those.",
  readOnly: true,
  inputSchema: OpenMausChecklistInputSchema,
  parameters: OpenMausChecklistParameters,
  viewSchema: checklistDefinition.viewSchema,
  preview: checklistDefinition.preview,
  confirmation: "The checklist is now on screen for the person.",
  validationAdapter,
  legacyToolNames: ["show_checklist"]
};
var openMausQuoteBinding = {
  componentId: "quote",
  viewVersion: 1,
  toolName: "show_quote",
  kind: "card",
  title: "Quotation",
  description: "Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.",
  readOnly: true,
  inputSchema: OpenMausQuoteInputSchema,
  parameters: OpenMausQuoteParameters,
  viewSchema: quoteDefinition.viewSchema,
  preview: quoteDefinition.preview,
  confirmation: "The quotation is now on screen for the person.",
  validationAdapter,
  legacyToolNames: ["show_quote"]
};
var OPENMAUS_BINDINGS = [
  openMausRecordBinding,
  openMausMetricsBinding,
  openMausChecklistBinding,
  openMausQuoteBinding
];
export {
  OPENMAUS_BINDINGS,
  OpenMausChecklistInputSchema,
  OpenMausChecklistParameters,
  OpenMausMetricsInputSchema,
  OpenMausMetricsParameters,
  OpenMausQuoteInputSchema,
  OpenMausQuoteParameters,
  OpenMausRecordInputSchema,
  OpenMausRecordParameters,
  openMausChecklistBinding,
  openMausMetricsBinding,
  openMausQuoteBinding,
  openMausRecordBinding
};
//# sourceMappingURL=openmaus.js.map
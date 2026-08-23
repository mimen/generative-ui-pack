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
var PREVIEW_FIXTURES = {
  record: recordPreview,
  metrics: metricsPreview,
  checklist: checklistPreview,
  quote: quotePreview
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
var COMPONENT_DEFINITIONS = [
  recordDefinition,
  metricsDefinition,
  checklistDefinition,
  quoteDefinition
];
function getComponentDefinition(id) {
  switch (id) {
    case "record":
      return recordDefinition;
    case "metrics":
      return metricsDefinition;
    case "checklist":
      return checklistDefinition;
    case "quote":
      return quoteDefinition;
  }
}

// src/core/hosts.ts
function toSerializableHostBinding(binding) {
  return {
    componentId: binding.componentId,
    viewVersion: binding.viewVersion,
    toolName: binding.toolName,
    kind: binding.kind,
    title: binding.title,
    description: binding.description,
    readOnly: binding.readOnly,
    schemaId: `${binding.componentId}@${binding.viewVersion}`
  };
}

// src/core/types.ts
var COMPONENT_IDS = [
  "record",
  "metrics",
  "checklist",
  "quote"
];

// src/core/version.ts
var PACKAGE_VERSION = "0.1.0";
export {
  COMPONENT_DEFINITIONS,
  COMPONENT_IDS,
  ChecklistViewSchema,
  MetricsViewSchema,
  PACKAGE_VERSION,
  PREVIEW_FIXTURES,
  QuoteViewSchema,
  RecordViewSchema,
  ToneSchema,
  checklistDefinition,
  checklistPreview,
  getComponentDefinition,
  metricsDefinition,
  metricsPreview,
  quoteDefinition,
  quotePreview,
  recordDefinition,
  recordPreview,
  toSerializableHostBinding
};
//# sourceMappingURL=core.js.map
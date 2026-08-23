#!/usr/bin/env bun

// src/cli.ts
import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";

// src/compiler/compile.ts
import { z as z4 } from "zod";

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

// src/core/version.ts
var PACKAGE_VERSION = "0.1.0";

// src/openbot/index.ts
import { z as z2 } from "zod";
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

// src/openmaus/index.ts
import { z as z3 } from "zod";
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
var OpenMausRecordInputSchema = z3.object({
  title: z3.string().max(OPENMAUS_LIMITS.title),
  subtitle: z3.string().max(OPENMAUS_LIMITS.subtitle).optional(),
  status: z3.string().max(OPENMAUS_LIMITS.label).optional(),
  statusTone: ToneSchema.optional(),
  fields: z3.array(
    z3.object({
      label: z3.string().max(OPENMAUS_LIMITS.label),
      value: z3.string().max(OPENMAUS_LIMITS.value)
    }).strict()
  ).max(OPENMAUS_LIMITS.recordRows)
}).strict();
var OpenMausMetricsInputSchema = z3.object({
  title: z3.string().max(OPENMAUS_LIMITS.title),
  caption: z3.string().max(OPENMAUS_LIMITS.subtitle).optional(),
  metrics: z3.array(
    z3.object({
      label: z3.string().max(OPENMAUS_LIMITS.label),
      value: z3.string().max(OPENMAUS_LIMITS.value),
      change: z3.string().max(OPENMAUS_LIMITS.subtitle).optional(),
      changeTone: ToneSchema.optional()
    }).strict()
  ).max(OPENMAUS_LIMITS.metricsRows)
}).strict();
var OpenMausChecklistInputSchema = z3.object({
  title: z3.string().max(OPENMAUS_LIMITS.title),
  caption: z3.string().max(OPENMAUS_LIMITS.subtitle).optional(),
  items: z3.array(
    z3.object({
      text: z3.string().max(OPENMAUS_LIMITS.content),
      done: z3.boolean(),
      note: z3.string().max(OPENMAUS_LIMITS.subtitle).optional()
    }).strict()
  ).max(OPENMAUS_LIMITS.checklistRows)
}).strict();
var OpenMausQuoteInputSchema = z3.object({
  quote: z3.string().max(OPENMAUS_LIMITS.value),
  attribution: z3.string().max(OPENMAUS_LIMITS.subtitle),
  context: z3.string().max(OPENMAUS_LIMITS.subtitle).optional()
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

// src/compiler/manifest.ts
var COMPATIBILITY_MANIFEST = {
  packageVersion: PACKAGE_VERSION,
  generatedFileFormatVersion: 1,
  viewVersions: {
    record: 1,
    metrics: 1,
    checklist: 1,
    quote: 1
  },
  targets: {
    openbot: {
      repository: "https://github.com/CopilotKit/openbot.git",
      commit: "6826e11afd52f03c30af2d873203792acad95f63",
      ref: "refs/tags/v0.0.4",
      contractVersion: 1,
      components: ["record", "metrics", "checklist", "quote"],
      sourceBlobs: {
        "app/src/components/gallery/cards.tsx": "ab4b6be182c45ee111ef7161a318cee2a1111895e5807772b195c79d761238b5",
        "app/src/components/gallery/quote.tsx": "7df5a48839b93127b47140290280927418561f879790ec1dc898c550c11aa2c1",
        "app/src/lib/copilot/gallery-registry.ts": "684664511012086bd1a18959bc7d93c7db9dc8d61a53d8f124f868beae92c608"
      }
    },
    openmaus: {
      repository: "https://github.com/mimen/OpenMausBot.git",
      commit: "696ff1d5388342259379e1446b511ba82ae95afa",
      contractVersion: 1,
      components: ["record", "metrics", "checklist", "quote"]
    }
  }
};
function compatibilityManifestJson() {
  return {
    packageVersion: COMPATIBILITY_MANIFEST.packageVersion,
    generatedFileFormatVersion: COMPATIBILITY_MANIFEST.generatedFileFormatVersion,
    viewVersions: { ...COMPATIBILITY_MANIFEST.viewVersions },
    targets: {
      openbot: {
        ...COMPATIBILITY_MANIFEST.targets.openbot,
        components: [...COMPATIBILITY_MANIFEST.targets.openbot.components]
      },
      openmaus: {
        ...COMPATIBILITY_MANIFEST.targets.openmaus,
        components: [...COMPATIBILITY_MANIFEST.targets.openmaus.components]
      }
    }
  };
}

// src/compiler/stable-json.ts
function normalize(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => normalize(entry));
  }
  if (value !== null && typeof value === "object") {
    const sortedEntries = Object.entries(value).sort(([left], [right]) => {
      if (left === right) return 0;
      return left < right ? -1 : 1;
    });
    const normalized = {};
    for (const [key, entry] of sortedEntries) {
      normalized[key] = normalize(entry);
    }
    return normalized;
  }
  return value;
}
function stableJson(value) {
  return `${JSON.stringify(normalize(value), null, 2)}
`;
}

// src/compiler/compile.ts
function genericBindingJson(binding) {
  const serializable = toSerializableHostBinding(binding);
  return {
    componentId: serializable.componentId,
    viewVersion: serializable.viewVersion,
    toolName: serializable.toolName,
    kind: serializable.kind,
    title: serializable.title,
    description: serializable.description,
    readOnly: serializable.readOnly,
    schemaId: serializable.schemaId
  };
}
function jsonSchemaObject(schema) {
  return JSON.parse(JSON.stringify(schema));
}
function openBotBindingJson(binding) {
  const inputSchema = jsonSchemaObject(
    z4.toJSONSchema(binding.inputSchema, { io: "input" })
  );
  return {
    ...genericBindingJson(binding),
    confirmation: binding.confirmation,
    inputSchema
  };
}
function openMausBindingJson(binding) {
  return {
    ...genericBindingJson(binding),
    confirmation: binding.confirmation,
    parameters: binding.parameters,
    validationAdapter: binding.validationAdapter
  };
}
function bindingsJson(target) {
  const bindings = target === "openbot" ? OPENBOT_BINDINGS.map((binding) => openBotBindingJson(binding)) : OPENMAUS_BINDINGS.map((binding) => openMausBindingJson(binding));
  return {
    generatedFileFormatVersion: COMPATIBILITY_MANIFEST.generatedFileFormatVersion,
    target,
    bindings
  };
}
function compileTarget(target) {
  const files = [
    {
      path: "compatibility-manifest.json",
      content: stableJson(compatibilityManifestJson())
    },
    {
      path: `${target}/bindings.json`,
      content: stableJson(bindingsJson(target))
    }
  ].sort((left, right) => {
    if (left.path === right.path) return 0;
    return left.path < right.path ? -1 : 1;
  });
  return { target, files };
}

// src/cli.ts
function optionValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : void 0;
}
function parseTarget(value) {
  if (value === "openbot" || value === "openmaus") {
    return value;
  }
  throw new Error("--target must be openbot or openmaus");
}
function parseCompileOptions(args) {
  return {
    target: parseTarget(optionValue(args, "--target")),
    outDir: resolve(optionValue(args, "--out-dir") ?? "generated")
  };
}
async function writeCompiledTarget(options) {
  const result = compileTarget(options.target);
  for (const file of result.files) {
    const destination = resolve(options.outDir, file.path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.content, "utf8");
  }
}
function usage() {
  return [
    "generative-ui-pack manifest",
    "generative-ui-pack compile --target <openbot|openmaus> [--out-dir generated]"
  ].join("\n");
}
async function main(args) {
  const command = args[0];
  if (command === "manifest") {
    process.stdout.write(stableJson(compatibilityManifestJson()));
    return 0;
  }
  if (command === "compile") {
    const options = parseCompileOptions(args.slice(1));
    await writeCompiledTarget(options);
    process.stdout.write(
      `Compiled ${options.target} format ${COMPATIBILITY_MANIFEST.generatedFileFormatVersion} to ${options.outDir}
`
    );
    return 0;
  }
  process.stderr.write(`${usage()}
`);
  return 1;
}
if (import.meta.main) {
  try {
    process.exitCode = await main(process.argv.slice(2));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Compilation failed";
    process.stderr.write(`${message}
`);
    process.exitCode = 1;
  }
}
export {
  main
};
//# sourceMappingURL=cli.js.map
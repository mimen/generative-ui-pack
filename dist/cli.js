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

// src/compiler/openbot-overlay.ts
import { createHash } from "crypto";

// src/compiler/openbot-baseline/app-package.json.txt
var app_package_json_default = '{\n  "name": "app",\n  "license": "MIT",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "build": "vite build",\n    "dev": "vite",\n    "prebuild": "bun run --cwd .. generate:app-config",\n    "predev": "bun run --cwd .. generate:app-config",\n    "pretypecheck": "bun run --cwd .. generate:app-config",\n    "typecheck": "tsc --noEmit"\n  },\n  "dependencies": {\n    "@ag-ui/core": "0.0.57",\n    "@base-ui/react": "^1.6.0",\n    "@better-auth/sso": "^1.7.1",\n    "@copilotkit/react-core": "1.68.3",\n    "@fontsource-variable/inter": "^5.3.0",\n    "@shadcn/react": "^0.3.0",\n    "@tabler/icons-react": "^3.36.1",\n    "@tanstack/react-form": "^1.33.5",\n    "@tanstack/react-query": "^5.101.4",\n    "@tanstack/react-router": "^1.170.27",\n    "better-auth": "^1.6.27",\n    "boring-avatars": "^2.0.4",\n    "class-variance-authority": "^0.7.1",\n    "clsx": "^2.1.1",\n    "motion": "^13.1.0",\n    "prompt-area": "^0.6.3",\n    "react": "^19.2.0",\n    "react-dom": "^19.2.0",\n    "shadcn": "^4.17.0",\n    "streamdown": "^2.5.0",\n    "tailwind-merge": "^3.6.0",\n    "tw-animate-css": "^1.4.0",\n    "zod": "^4.4.3"\n  },\n  "devDependencies": {\n    "@happy-dom/global-registrator": "^20.11.2",\n    "@tailwindcss/vite": "^4.3.3",\n    "@tanstack/router-plugin": "^1.168.30",\n    "@testing-library/react": "^16.3.2",\n    "@testing-library/user-event": "^14.6.4",\n    "@types/node": "^26.2.0",\n    "@types/react": "^19.2.0",\n    "@types/react-dom": "^19.2.0",\n    "@vitejs/plugin-react": "^5.0.4",\n    "happy-dom": "^20.11.2",\n    "tailwindcss": "^4.3.3",\n    "vite": "^7.1.12"\n  }\n}\n';

// src/compiler/openbot-baseline/cards.tsx.txt
var cards_tsx_default = 'import { z } from "zod";\nimport type { GalleryComponent } from "@/lib/copilot/gallery-registry";\nimport { Badge, GalleryFrame, type Tone } from "./frame";\n\nconst tone = z\n  .enum(["neutral", "positive", "caution", "negative"])\n  .describe(\n    "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable",\n  );\n\nexport const RecordCardProps = z.object({\n  title: z.string().describe("What this record is, e.g. a person or an order"),\n  subtitle: z\n    .string()\n    .optional()\n    .describe("One line of context under the title"),\n  status: z.string().optional().describe("A short status word, e.g. Approved"),\n  statusTone: tone.optional(),\n  fields: z\n    .array(\n      z.object({\n        label: z.string(),\n        value: z.string().describe("Already formatted for a person to read"),\n      }),\n    )\n    .describe("The fields, in the order they should be read"),\n});\n\nexport function RecordCard({\n  title,\n  subtitle,\n  status,\n  statusTone,\n  fields: given,\n}: Partial<z.infer<typeof RecordCardProps>>) {\n  const fields = given ?? [];\n  return (\n    <GalleryFrame\n      action={\n        status ? <Badge tone={statusTone as Tone}>{status}</Badge> : undefined\n      }\n      caption={subtitle}\n      title={title}\n    >\n      <dl className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-4 gap-y-2 text-sm">\n        {fields.map((field) => (\n          <div className="contents" key={field.label}>\n            <dt className="truncate text-muted-foreground">{field.label}</dt>\n            {/* Field values wrap because truncation can hide the reported data. */}\n            <dd className="min-w-0 break-words">{field.value}</dd>\n          </div>\n        ))}\n      </dl>\n    </GalleryFrame>\n  );\n}\n\nexport const MetricsCardProps = z.object({\n  title: z.string().describe("What these figures are about"),\n  caption: z.string().optional(),\n  metrics: z\n    .array(\n      z.object({\n        label: z.string(),\n        value: z\n          .string()\n          .describe("Already formatted, including any unit or currency"),\n        change: z\n          .string()\n          .optional()\n          .describe("The movement, e.g. \'+12% on last month\'"),\n        changeTone: tone.optional(),\n      }),\n    )\n    .max(6)\n    .describe("Up to six figures. More than that wanted a table"),\n});\n\nexport function MetricsCard({\n  title,\n  caption,\n  metrics: given,\n}: Partial<z.infer<typeof MetricsCardProps>>) {\n  const metrics = given ?? [];\n  return (\n    <GalleryFrame caption={caption} title={title}>\n      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">\n        {metrics.map((metric) => (\n          <div key={metric.label}>\n            <p className="truncate text-xs text-muted-foreground">\n              {metric.label}\n            </p>\n            <p className="mt-0.5 text-xl font-semibold tabular-nums">\n              {metric.value}\n            </p>\n            {metric.change ? (\n              <p className="mt-0.5">\n                <Badge tone={metric.changeTone as Tone}>{metric.change}</Badge>\n              </p>\n            ) : null}\n          </div>\n        ))}\n      </div>\n    </GalleryFrame>\n  );\n}\n\nexport const ChecklistCardProps = z.object({\n  title: z.string().describe("What this list is"),\n  caption: z.string().optional(),\n  items: z\n    .array(\n      z.object({\n        text: z.string(),\n        done: z.boolean().describe("Whether this one is already finished"),\n        note: z\n          .string()\n          .optional()\n          .describe("A short aside, e.g. who it is waiting on"),\n      }),\n    )\n    .describe("The items, in the order they should be done"),\n});\n\n/**\n * A read-only checklist. Interactive decisions use the approval components where answers go back\n * to the Bot.\n */\nexport function ChecklistCard({\n  title,\n  caption,\n  items: given,\n}: Partial<z.infer<typeof ChecklistCardProps>>) {\n  const items = given ?? [];\n  const done = items.filter((item) => item.done).length;\n  return (\n    <GalleryFrame\n      action={\n        <Badge\n          tone={\n            done === items.length && items.length > 0 ? "positive" : "neutral"\n          }\n        >\n          {done} of {items.length}\n        </Badge>\n      }\n      caption={caption}\n      title={title}\n    >\n      <ul className="space-y-2">\n        {items.map((item) => (\n          <li className="flex items-start gap-2.5 text-sm" key={item.text}>\n            <span\n              aria-hidden="true"\n              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[5px] border text-[10px] ${\n                item.done\n                  ? "border-transparent bg-emerald-500 text-white"\n                  : "border-border"\n              }`}\n            >\n              {item.done ? "\u2713" : ""}\n            </span>\n            <span className="min-w-0">\n              <span\n                className={\n                  item.done ? "text-muted-foreground line-through" : ""\n                }\n              >\n                {item.text}\n              </span>\n              {item.note ? (\n                <span className="block text-xs text-muted-foreground">\n                  {item.note}\n                </span>\n              ) : null}\n            </span>\n          </li>\n        ))}\n      </ul>\n    </GalleryFrame>\n  );\n}\n\nexport const NoticeCardProps = z.object({\n  title: z.string().describe("The headline, in a few words"),\n  body: z.string().describe("The explanation, in one or two sentences"),\n  tone: tone.optional(),\n  points: z\n    .array(z.string())\n    .optional()\n    .describe("Supporting points, if there are any"),\n});\n\nexport function NoticeCard({\n  title,\n  body,\n  tone: noticeTone,\n  points,\n}: Partial<z.infer<typeof NoticeCardProps>>) {\n  return (\n    <GalleryFrame\n      action={\n        noticeTone && noticeTone !== "neutral" ? (\n          <Badge tone={noticeTone}>{noticeTone}</Badge>\n        ) : undefined\n      }\n      title={title}\n    >\n      <p className="text-sm">{body}</p>\n      {points?.length ? (\n        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">\n          {points.map((entry) => (\n            <li className="flex gap-2" key={entry}>\n              <span aria-hidden="true">\xB7</span>\n              <span className="min-w-0">{entry}</span>\n            </li>\n          ))}\n        </ul>\n      ) : null}\n    </GalleryFrame>\n  );\n}\n\nexport const GALLERY: GalleryComponent[] = [\n  {\n    name: "showRecord",\n    title: "Record",\n    kind: "card",\n    description:\n      "Show one thing and its fields, an order, a person, a ticket. Use instead of describing a record in prose.",\n    parameters: RecordCardProps,\n    Component: RecordCard as GalleryComponent["Component"],\n    preview: {\n      title: "Invoice 2043",\n      subtitle: "Northwind Traders",\n      status: "Approved",\n      fields: [\n        { label: "Amount", value: "$4,280.00" },\n        { label: "Raised", value: "12 March" },\n        { label: "Owner", value: "Priya Raman" },\n      ],\n    },\n    confirmation: "The record is now on screen for the person.",\n  },\n  {\n    name: "showMetrics",\n    title: "Headline figures",\n    kind: "card",\n    description:\n      "Show up to six headline figures, each with an optional movement. Use for a summary somebody reads at a glance.",\n    parameters: MetricsCardProps,\n    Component: MetricsCard as GalleryComponent["Component"],\n    preview: {\n      title: "This month",\n      metrics: [\n        {\n          label: "Revenue",\n          value: "$412k",\n          change: "+12% on last month",\n          changeTone: "positive",\n        },\n        { label: "Open deals", value: "38" },\n        {\n          label: "Churn",\n          value: "1.4%",\n          change: "+0.3pt",\n          changeTone: "caution",\n        },\n      ],\n    },\n    confirmation: "The figures are now on screen for the person.",\n  },\n  {\n    name: "showChecklist",\n    title: "Checklist",\n    kind: "card",\n    description:\n      "Show a list of things and which are done. Reporting only, the person cannot tick these, so do not use it to ask for anything.",\n    parameters: ChecklistCardProps,\n    Component: ChecklistCard as GalleryComponent["Component"],\n    preview: {\n      title: "Before the release",\n      items: [\n        { text: "Migrations applied", done: true },\n        { text: "Changelog written", done: true },\n        { text: "Load test", done: false, note: "Waiting on staging" },\n      ],\n    },\n    confirmation: "The checklist is now on screen for the person.",\n  },\n  {\n    name: "showNotice",\n    title: "Notice",\n    kind: "card",\n    description:\n      "Show a headline, a short explanation and optional supporting points. Use instead of writing several paragraphs of prose.",\n    parameters: NoticeCardProps,\n    Component: NoticeCard as GalleryComponent["Component"],\n    preview: {\n      title: "Certificate expires in 30 days",\n      body: "The checkout certificate has an owner now, and this is the first of the new alerts.",\n      tone: "caution",\n      points: ["Owner: Platform", "Renews automatically once approved"],\n    },\n    confirmation: "The notice is now on screen for the person.",\n  },\n];\n';

// src/compiler/openbot-baseline/gallery-registry.ts.txt
var gallery_registry_ts_default = 'import type { useFrontendTool } from "@copilotkit/react-core/v2";\nimport type { ReactElement } from "react";\n\n/**\n * Discover gallery components from files that export `GALLERY`; deployment state owns publication,\n * grants, and published descriptions after first announcement.\n */\n\n/** The schema type the SDK itself accepts, so a component never needs a cast to register. */\nexport type ToolParameters = Parameters<\n  typeof useFrontendTool\n>[0]["parameters"];\n\n/** Grouping for the Admin page only. Never read by the model. */\nexport type GalleryKind = "chart" | "card" | "decision";\n\nexport type GalleryComponent = {\n  /**\n   * The tool name the model calls, the catalogue key, and the stable fork-facing component id.\n   */\n  name: string;\n  /** What a person sees in Admin and in a refusal. */\n  title: string;\n  kind: GalleryKind;\n  /**\n   * What the model reads while deciding whether to call this. A starting value only: a deployment\n   * edits and publishes its own, and that is what a running Bot is given.\n   */\n  description: string;\n  parameters: ToolParameters;\n  /**\n   * The props that show this component at its best, for anywhere it is displayed rather than called.\n   *\n   * A gallery of names tells somebody nothing: the question they arrived with is "what does an\n   * answer from this thing look like", and only the component itself answers that. Kept beside the\n   * component so a new one cannot be added without deciding how it introduces itself.\n   *\n   * Props rather than tool arguments, because they are not always the same thing: a component that\n   * suspends the run is handed the whole interaction, `{ status, args, respond }`, and would crash\n   * on arguments alone.\n   *\n   * Omitted by a component that cannot be drawn away from a conversation, which is then shown as an\n   * unpreviewable tile rather than as a component that failed.\n   */\n  preview?: Record<string, unknown>;\n  Component: (props: Record<string, unknown>) => ReactElement | null;\n  /**\n   * The line the model is given once it is on screen. Ignored for a `decision`, whose result is the\n   * user\'s answer.\n   */\n  confirmation?: string;\n  /**\n   * The data functions this component will read, given the arguments it was called with.\n   *\n   * A component that reads nothing omits it. One that does declares it here so the grant covering\n   * that data is decided before the model is told the component is on screen.\n   */\n  reads?: (args: Record<string, unknown>) => readonly string[];\n};\n\n/**\n * Every gallery module, loaded eagerly because the list has to exist before the first render: it\n * decides how many hooks are registered, and a hook count that arrives late is a hook count that\n * changed.\n *\n * Uses a relative pattern because `import.meta.glob` does not resolve the `@/` alias. Files without\n * a `GALLERY` export are skipped.\n */\nlet modules: Record<string, { GALLERY?: GalleryComponent[] }> = {};\ntry {\n  // Keep this call inline: Vite replaces `import.meta.glob` at build time.\n  modules = import.meta.glob<{ GALLERY?: GalleryComponent[] }>(\n    "../../components/gallery/*.tsx",\n    { eager: true },\n  );\n} catch {\n  // Outside Vite/test-runner contexts, `import.meta.glob` may be unavailable; empty gallery is the safe fallback.\n  modules = {};\n}\n\n/**\n * Stable order is required because this list drives hook registration order.\n */\nexport const GALLERY_COMPONENTS: GalleryComponent[] = Object.values(modules)\n  .flatMap((module) => module.GALLERY ?? [])\n  .sort((left, right) => left.name.localeCompare(right.name));\n\n/** What the server is told exists. Deliberately not the schema or the renderer: it cannot use either. */\nexport type GalleryManifestEntry = {\n  name: string;\n  title: string;\n  kind: GalleryKind;\n  description: string;\n};\n\nexport function galleryManifest(): GalleryManifestEntry[] {\n  return GALLERY_COMPONENTS.map(({ name, title, kind, description }) => ({\n    name,\n    title,\n    kind,\n    description,\n  }));\n}\n\n/** The names this build can actually draw, for telling a catalogue row from a component. */\nexport const RENDERABLE_NAMES: ReadonlySet<string> = new Set(\n  GALLERY_COMPONENTS.map((component) => component.name),\n);\n\nconst BY_NAME: ReadonlyMap<string, GalleryComponent> = new Map(\n  GALLERY_COMPONENTS.map((component) => [component.name, component]),\n);\n\n/**\n * The component behind a catalogue name, or `undefined` where this build has no renderer for it.\n *\n * A deployment\'s component rows are governance state and outlive the build that drew them, so a\n * name arriving from the server is not a promise that anything here can draw it.\n */\nexport function galleryComponent(name: string): GalleryComponent | undefined {\n  return BY_NAME.get(name);\n}\n';

// src/compiler/openbot-baseline/main.tsx.txt
var main_tsx_default = 'import { QueryClientProvider } from "@tanstack/react-query";\nimport { RouterProvider } from "@tanstack/react-router";\nimport { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport { queryClient } from "./query-client";\nimport { router } from "./router";\nimport "@copilotkit/react-core/v2/styles.css";\nimport "./styles.css";\n\nconst rootElement = document.getElementById("root");\n\nif (!rootElement) {\n  throw new Error("OpenBot could not find the application root element.");\n}\n\ncreateRoot(rootElement).render(\n  <StrictMode>\n    <QueryClientProvider client={queryClient}>\n      <RouterProvider router={router} context={{ queryClient }} />\n    </QueryClientProvider>\n  </StrictMode>,\n);\n';

// src/compiler/openbot-baseline/portable-pack.candidate.tsx.txt
var portable_pack_candidate_tsx_default = '// Generated by @mimen/generative-ui-pack. Do not edit.\nimport type { GalleryComponent } from "@/lib/copilot/gallery-registry";\nimport type { Tone } from "@mimen/generative-ui-pack/core";\nimport {\n  Checklist,\n  Metrics,\n  Quote,\n  Record,\n} from "@mimen/generative-ui-pack/react";\nimport {\n  openBotChecklistBinding,\n  openBotMetricsBinding,\n  openBotQuoteBinding,\n  openBotRecordBinding,\n} from "@mimen/generative-ui-pack/openbot";\nimport { z } from "zod";\n\nfunction portableEntry(\n  binding:\n    | typeof openBotRecordBinding\n    | typeof openBotMetricsBinding\n    | typeof openBotChecklistBinding\n    | typeof openBotQuoteBinding,\n  Component: GalleryComponent["Component"],\n): GalleryComponent {\n  return {\n    name: binding.toolName,\n    title: binding.title,\n    kind: binding.kind,\n    description: binding.description,\n    parameters: binding.inputSchema,\n    Component,\n    preview: { ...binding.preview },\n    confirmation: binding.confirmation,\n  };\n}\n\nconst StreamTone = z\n  .string()\n  .optional()\n  .transform((value): Tone | undefined => {\n    if (\n      value === "neutral" ||\n      value === "positive" ||\n      value === "caution" ||\n      value === "negative"\n    ) {\n      return value;\n    }\n    return undefined;\n  });\nconst StreamRecord = z\n  .object({\n    title: z.string().optional(),\n    subtitle: z.string().optional(),\n    status: z.string().optional(),\n    statusTone: StreamTone,\n    fields: z\n      .array(\n        z\n          .object({\n            label: z.string().optional(),\n            value: z.string().optional(),\n          })\n          .passthrough(),\n      )\n      .optional(),\n  })\n  .passthrough();\nconst StreamMetrics = z\n  .object({\n    title: z.string().optional(),\n    caption: z.string().optional(),\n    metrics: z\n      .array(\n        z\n          .object({\n            label: z.string().optional(),\n            value: z.string().optional(),\n            change: z.string().optional(),\n            changeTone: StreamTone,\n          })\n          .passthrough(),\n      )\n      .optional(),\n  })\n  .passthrough();\nconst StreamChecklist = z\n  .object({\n    title: z.string().optional(),\n    caption: z.string().optional(),\n    items: z\n      .array(\n        z\n          .object({\n            text: z.string().optional(),\n            done: z.boolean().optional(),\n            note: z.string().optional(),\n          })\n          .passthrough(),\n      )\n      .optional(),\n  })\n  .passthrough();\nconst StreamQuote = z\n  .object({\n    quote: z.string().optional(),\n    attribution: z.string().optional(),\n    context: z.string().optional(),\n  })\n  .passthrough();\n\nconst PortableRecord: GalleryComponent["Component"] = (props) => {\n  const parsed = StreamRecord.parse(props);\n  return (\n    <Record\n      {...parsed}\n      title={parsed.title ?? ""}\n      fields={(parsed.fields ?? []).map((field) => ({\n        label: field.label ?? "",\n        value: field.value ?? "",\n      }))}\n    />\n  );\n};\nconst PortableMetrics: GalleryComponent["Component"] = (props) => {\n  const parsed = StreamMetrics.parse(props);\n  return (\n    <Metrics\n      {...parsed}\n      title={parsed.title ?? ""}\n      metrics={(parsed.metrics ?? []).map((metric) => ({\n        label: metric.label ?? "",\n        value: metric.value ?? "",\n        change: metric.change,\n        changeTone: metric.changeTone,\n      }))}\n    />\n  );\n};\nconst PortableChecklist: GalleryComponent["Component"] = (props) => {\n  const parsed = StreamChecklist.parse(props);\n  return (\n    <Checklist\n      {...parsed}\n      title={parsed.title ?? ""}\n      items={(parsed.items ?? []).map((item) => ({\n        text: item.text ?? "",\n        done: item.done ?? false,\n        note: item.note,\n      }))}\n    />\n  );\n};\nconst PortableQuote: GalleryComponent["Component"] = (props) => {\n  const parsed = StreamQuote.parse(props);\n  return (\n    <Quote\n      {...parsed}\n      quote={parsed.quote ?? ""}\n      attribution={parsed.attribution ?? ""}\n    />\n  );\n};\n\nexport const OPENBOT_CARD_GALLERY: GalleryComponent[] = [\n  portableEntry(openBotRecordBinding, PortableRecord),\n  portableEntry(openBotMetricsBinding, PortableMetrics),\n  portableEntry(openBotChecklistBinding, PortableChecklist),\n];\n\nexport const OPENBOT_QUOTE_GALLERY: GalleryComponent[] = [\n  portableEntry(openBotQuoteBinding, PortableQuote),\n];\n';

// src/compiler/openbot-baseline/quote.tsx.txt
var quote_tsx_default = `import { z } from "zod";
import type { GalleryComponent } from "@/lib/copilot/gallery-registry";
import { GalleryFrame } from "./frame";

export const QuoteCardProps = z.object({
  quote: z
    .string()
    .describe("The quotation itself, without surrounding quote marks"),
  attribution: z
    .string()
    .describe(
      "Who said or wrote it, e.g. 'Grace Hopper' or 'the 2026 annual report'",
    ),
  context: z
    .string()
    .optional()
    .describe(
      "One short line of context: where it is from, or why it matters here",
    ),
});

type QuoteArgs = z.infer<typeof QuoteCardProps>;

export function QuoteCard({ quote, attribution, context }: Partial<QuoteArgs>) {
  if (!quote) {
    return (
      <GalleryFrame title="Quotation">
        <p className="text-sm text-muted-foreground">
          There is nothing to quote.
        </p>
      </GalleryFrame>
    );
  }

  return (
    <GalleryFrame caption={context} title="Quotation">
      <blockquote className="border-l-2 border-border pl-4">
        <p className="text-sm leading-relaxed">{quote}</p>
        {attribution ? (
          <footer className="mt-2 text-xs text-muted-foreground">
            , {attribution}
          </footer>
        ) : null}
      </blockquote>
    </GalleryFrame>
  );
}

export const GALLERY: GalleryComponent[] = [
  {
    name: "showQuote",
    title: "Quotation",
    kind: "card",
    description:
      "Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.",
    parameters: QuoteCardProps,
    Component: QuoteCard as GalleryComponent["Component"],
    preview: {
      quote:
        "Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.",
      attribution: "the expense policy",
      context: "Last changed in March.",
    },
    confirmation: "The quotation is now on screen for the person.",
  },
];
`;

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

// src/compiler/openbot-overlay.ts
var OPENBOT_OVERLAY_HOST_SHA = "6826e11afd52f03c30af2d873203792acad95f63";
var OPENBOT_DEFAULT_PACK_REF = "v0.1.0";
function isSafePackRef(ref) {
  return /^[0-9A-Za-z._/-]{1,100}$/.test(ref) && !ref.startsWith("-");
}
function openBotPackageSpec(ref) {
  if (!isSafePackRef(ref)) throw new Error(`Unsafe package ref: ${ref}`);
  return `github:mimen/generative-ui-pack#${ref}`;
}
var OWNED_NAMES = [
  "showRecord",
  "showMetrics",
  "showChecklist",
  "showQuote"
];
var RETAINED_NAMES = [
  "askApproval",
  "askChoice",
  "showActivityReport",
  "showAreaChart",
  "showBarChart",
  "showLineChart",
  "showNotice",
  "showPieChart",
  "showProgress"
];
var ALL_BASELINE_NAMES = [...OWNED_NAMES, ...RETAINED_NAMES].sort();
var BASELINE_BY_PATH = {
  "app/package.json": app_package_json_default,
  "app/src/main.tsx": main_tsx_default,
  "app/src/components/gallery/cards.tsx": cards_tsx_default,
  "app/src/components/gallery/quote.tsx": quote_tsx_default
};
function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}
function jsonObject(value) {
  return JSON.parse(JSON.stringify(value));
}
function lineCount(content) {
  return content.split("\n").length;
}
function replaceOnce(source, needle, replacement) {
  const index = source.indexOf(needle);
  if (index < 0 || source.indexOf(needle, index + needle.length) >= 0) {
    throw new Error(`Expected one overlay anchor: ${needle}`);
  }
  return `${source.slice(0, index)}${replacement}${source.slice(index + needle.length)}`;
}
function packageOutput(packRef) {
  const parsed = JSON.parse(app_package_json_default);
  parsed.dependencies["@mimen/generative-ui-pack"] = openBotPackageSpec(packRef);
  return `${JSON.stringify(parsed, null, 2)}
`;
}
function mainOutput() {
  return replaceOnce(
    main_tsx_default,
    'import "./styles.css";',
    'import "@mimen/generative-ui-pack/styles.css";\nimport "./styles.css";'
  );
}
function adapterOutput() {
  return portable_pack_candidate_tsx_default;
}
function cardsOutput() {
  const ownedStart = cards_tsx_default.indexOf("export const RecordCardProps");
  const noticeStart = cards_tsx_default.indexOf("export const NoticeCardProps");
  const galleryStart = cards_tsx_default.indexOf(
    "export const GALLERY: GalleryComponent[] = ["
  );
  const noticeObjectStart = cards_tsx_default.indexOf(
    '  {\n    name: "showNotice"',
    galleryStart
  );
  const galleryEnd = cards_tsx_default.lastIndexOf("];\n");
  if (ownedStart < 0 || noticeStart < 0 || galleryStart < 0 || noticeObjectStart < 0 || galleryEnd < 0) {
    throw new Error("Pinned cards.tsx anchors no longer match");
  }
  const importsAndTone = cards_tsx_default.slice(0, ownedStart);
  const noticeDefinition = cards_tsx_default.slice(noticeStart, galleryStart);
  const noticeObject = cards_tsx_default.slice(noticeObjectStart, galleryEnd);
  const withPortableImport = replaceOnce(
    importsAndTone,
    'import { Badge, GalleryFrame, type Tone } from "./frame";',
    'import { Badge, GalleryFrame } from "./frame";\nimport { OPENBOT_CARD_GALLERY } from "./portable-pack";'
  );
  return `${withPortableImport}${noticeDefinition}export const GALLERY: GalleryComponent[] = [
  ...OPENBOT_CARD_GALLERY,
${noticeObject}];
`;
}
function quoteOutput() {
  return `// Generated by @mimen/generative-ui-pack. Do not edit.
export { OPENBOT_QUOTE_GALLERY as GALLERY } from "./portable-pack";
`;
}
function galleryNames(source) {
  return [...source.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]).filter((name) => name !== void 0);
}
function replacementRanges(path, output) {
  const baseline = BASELINE_BY_PATH[path];
  if (baseline === void 0) {
    return [
      {
        label: "generated",
        startLine: 1,
        endLine: lineCount(output)
      }
    ];
  }
  const changed = [...changedBaselineLines(baseline, output)].sort(
    (left, right) => left - right
  );
  const ranges = [];
  for (const line of changed) {
    const previous = ranges.at(-1);
    if (previous && line === previous.endLine + 1) {
      ranges[ranges.length - 1] = { ...previous, endLine: line };
    } else {
      ranges.push({
        label: `diff-${ranges.length + 1}`,
        startLine: line,
        endLine: line
      });
    }
  }
  return ranges;
}
function buildOverlay(packRef) {
  const outputs = {
    "app/package.json": packageOutput(packRef),
    "app/src/main.tsx": mainOutput(),
    "app/src/components/gallery/cards.tsx": cardsOutput(),
    "app/src/components/gallery/quote.tsx": quoteOutput(),
    "app/src/components/gallery/portable-pack.tsx": adapterOutput()
  };
  const localOwnedNames = [
    ...galleryNames(cards_tsx_default),
    ...galleryNames(quote_tsx_default)
  ].sort();
  if (JSON.stringify(localOwnedNames) !== JSON.stringify([...OWNED_NAMES, "showNotice"].sort())) {
    throw new Error("Pinned owned gallery names no longer match");
  }
  const expectedNamesBefore = [...ALL_BASELINE_NAMES];
  const expectedNamesAfter = [...ALL_BASELINE_NAMES];
  const patches = [
    {
      path: "app/package.json",
      expectedSha256: sha256(app_package_json_default),
      outputSha256: sha256(outputs["app/package.json"]),
      ranges: replacementRanges(
        "app/package.json",
        outputs["app/package.json"]
      ),
      generated: false
    },
    {
      path: "app/src/main.tsx",
      expectedSha256: sha256(main_tsx_default),
      outputSha256: sha256(outputs["app/src/main.tsx"]),
      ranges: replacementRanges(
        "app/src/main.tsx",
        outputs["app/src/main.tsx"]
      ),
      generated: false
    },
    {
      path: "app/src/components/gallery/cards.tsx",
      expectedSha256: sha256(cards_tsx_default),
      outputSha256: sha256(outputs["app/src/components/gallery/cards.tsx"]),
      ranges: replacementRanges(
        "app/src/components/gallery/cards.tsx",
        outputs["app/src/components/gallery/cards.tsx"]
      ),
      generated: false
    },
    {
      path: "app/src/components/gallery/quote.tsx",
      expectedSha256: sha256(quote_tsx_default),
      outputSha256: sha256(outputs["app/src/components/gallery/quote.tsx"]),
      ranges: replacementRanges(
        "app/src/components/gallery/quote.tsx",
        outputs["app/src/components/gallery/quote.tsx"]
      ),
      generated: false
    },
    {
      path: "app/src/components/gallery/portable-pack.tsx",
      expectedSha256: null,
      outputSha256: sha256(
        outputs["app/src/components/gallery/portable-pack.tsx"]
      ),
      ranges: replacementRanges(
        "app/src/components/gallery/portable-pack.tsx",
        outputs["app/src/components/gallery/portable-pack.tsx"]
      ),
      generated: true
    }
  ];
  const manifest = {
    formatVersion: 1,
    target: "openbot",
    hostCommit: OPENBOT_OVERLAY_HOST_SHA,
    packageRef: packRef,
    packageSpec: openBotPackageSpec(packRef),
    ownedNames: OWNED_NAMES,
    retainedNames: RETAINED_NAMES,
    expectedNamesBefore: [...expectedNamesBefore].sort(),
    expectedNamesAfter,
    guards: [
      {
        path: "app/src/lib/copilot/gallery-registry.ts",
        expectedSha256: sha256(gallery_registry_ts_default)
      },
      {
        path: "app/src/components/gallery/activity.tsx",
        expectedSha256: "443ba030aba99700437989bb19c907d066919e03699d5700571b90d0cdbc60d9"
      },
      {
        path: "app/src/components/gallery/charts.tsx",
        expectedSha256: "673b59694b754f0c03d3c4ed41cc1fc7eb6d7b16a26023f8acfc8c04cbc02f70"
      },
      {
        path: "app/src/components/gallery/decisions.tsx",
        expectedSha256: "cc762a549667b1ee05bb0381c43b67b5e00fa7b1e2c37eedc389bb93dd20bd19"
      },
      {
        path: "app/src/components/gallery/frame.tsx",
        expectedSha256: "86bba59a0792f88ce087ff6da6d8f8abe5c5294f7d6723b4acff013630a49f2e"
      },
      {
        path: "app/src/components/gallery/preview.tsx",
        expectedSha256: "c620c7c52820abf5a7caa3227c13b72e6ed484f3f94a10264f4f92ed351205af"
      },
      {
        path: "app/src/components/gallery/refused.tsx",
        expectedSha256: "17ea998c07dc59c3daedf77fd68dbe4161553d4482251cce7a7c7854aca83eea"
      }
    ],
    patches
  };
  validateOverlayManifest(manifest, outputs);
  return { manifest, outputs };
}
function changedBaselineLines(before, after) {
  const left = before.split("\n");
  const right = after.split("\n");
  const width = right.length + 1;
  const lengths = new Uint32Array((left.length + 1) * width);
  for (let leftIndex2 = left.length - 1; leftIndex2 >= 0; leftIndex2 -= 1) {
    for (let rightIndex2 = right.length - 1; rightIndex2 >= 0; rightIndex2 -= 1) {
      const offset = leftIndex2 * width + rightIndex2;
      lengths[offset] = left[leftIndex2] === right[rightIndex2] ? 1 + (lengths[(leftIndex2 + 1) * width + rightIndex2 + 1] ?? 0) : Math.max(
        lengths[(leftIndex2 + 1) * width + rightIndex2] ?? 0,
        lengths[leftIndex2 * width + rightIndex2 + 1] ?? 0
      );
    }
  }
  const changed = /* @__PURE__ */ new Set();
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length || rightIndex < right.length) {
    if (leftIndex < left.length && rightIndex < right.length && left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }
    const deletionScore = leftIndex < left.length ? lengths[(leftIndex + 1) * width + rightIndex] ?? 0 : -1;
    const insertionScore = rightIndex < right.length ? lengths[leftIndex * width + rightIndex + 1] ?? 0 : -1;
    if (leftIndex < left.length && deletionScore >= insertionScore) {
      changed.add(leftIndex + 1);
      leftIndex += 1;
    } else if (rightIndex < right.length) {
      changed.add(Math.min(left.length, leftIndex + 1));
      rightIndex += 1;
    }
  }
  return changed;
}
function validateOverlayManifest(manifest, outputs) {
  const outputPaths = Object.keys(outputs).sort();
  const patchPaths = manifest.patches.map((patch) => patch.path).sort();
  if (new Set(patchPaths).size !== patchPaths.length) {
    throw new Error("Overlay patch paths must be unique");
  }
  if (JSON.stringify(outputPaths) !== JSON.stringify(patchPaths)) {
    throw new Error("Overlay outputs must exactly match declared patch paths");
  }
  for (const patch of manifest.patches) {
    const output = outputs[patch.path];
    if (output === void 0 || sha256(output) !== patch.outputSha256) {
      throw new Error(`Overlay output hash mismatch for ${patch.path}`);
    }
    const rangeBoundary = lineCount(BASELINE_BY_PATH[patch.path] ?? output);
    for (const range of patch.ranges) {
      if (range.startLine < 1 || range.endLine < range.startLine || range.endLine > rangeBoundary) {
        throw new Error(
          `Invalid overlay range for ${patch.path}: ${range.label}`
        );
      }
    }
    const expectedRanges = replacementRanges(patch.path, output);
    if (JSON.stringify(patch.ranges) !== JSON.stringify(expectedRanges)) {
      throw new Error(
        `Overlay ranges do not equal actual diff for ${patch.path}`
      );
    }
  }
  const beforeNames = manifest.expectedNamesBefore;
  const names = manifest.expectedNamesAfter;
  if (new Set(beforeNames).size !== beforeNames.length) {
    throw new Error("Pre-overlay component names must be unique");
  }
  if (new Set(names).size !== names.length) {
    throw new Error("Post-overlay component names must be unique");
  }
  for (const previousName of beforeNames) {
    if (!names.includes(previousName)) {
      throw new Error(`Pre-overlay component name was lost: ${previousName}`);
    }
  }
  for (const retained of manifest.retainedNames) {
    if (!manifest.expectedNamesBefore.includes(retained) || !names.includes(retained)) {
      throw new Error(`Retained OpenBot name is not preserved: ${retained}`);
    }
  }
}
function compileOpenBotOverlayFiles(packRef = OPENBOT_DEFAULT_PACK_REF) {
  const { manifest, outputs } = buildOverlay(packRef);
  const files = [
    {
      path: "openbot/overlay-manifest.json",
      content: stableJson(jsonObject(manifest))
    },
    {
      path: "openbot/source-patches.json",
      content: stableJson(
        jsonObject({
          formatVersion: 1,
          patches: manifest.patches.filter((patch) => !patch.generated),
          generatedFiles: manifest.patches.filter((patch) => patch.generated)
        })
      )
    },
    {
      path: "openbot/package-dependency.json",
      content: stableJson(
        jsonObject({
          name: "@mimen/generative-ui-pack",
          spec: openBotPackageSpec(packRef),
          ref: packRef,
          lockfile: "regenerated by the installing host"
        })
      )
    }
  ];
  for (const [path, content] of Object.entries(outputs)) {
    files.push({ path: `openbot/files/${path}`, content });
  }
  return files.sort((left, right) => {
    if (left.path === right.path) return 0;
    return left.path < right.path ? -1 : 1;
  });
}
var OPENBOT_BASELINE_REGISTRY_SHA256 = sha256(gallery_registry_ts_default);

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
    },
    ...target === "openbot" ? compileOpenBotOverlayFiles() : []
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
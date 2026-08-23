import { z } from 'zod';

declare const OpenMausRecordParameters: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["title", "fields"];
    readonly properties: {
        readonly title: {
            readonly type: "string";
            readonly maxLength: 200;
            readonly description: "What this record is, e.g. a person or an order";
        };
        readonly subtitle: {
            readonly type: "string";
            readonly maxLength: 400;
            readonly description: "One line of context under the title";
        };
        readonly status: {
            readonly type: "string";
            readonly maxLength: 120;
            readonly description: "A short status word, e.g. Approved";
        };
        readonly statusTone: {
            readonly type: "string";
            readonly enum: readonly ["neutral", "positive", "caution", "negative"];
            readonly description: "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable.";
        };
        readonly fields: {
            readonly type: "array";
            readonly description: "The fields, in the order they should be read";
            readonly maxItems: 50;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["label", "value"];
                readonly properties: {
                    readonly label: {
                        readonly type: "string";
                        readonly maxLength: 120;
                    };
                    readonly value: {
                        readonly type: "string";
                        readonly maxLength: 2000;
                        readonly description: "Already formatted for a person to read";
                    };
                };
            };
        };
    };
};
declare const OpenMausMetricsParameters: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["title", "metrics"];
    readonly properties: {
        readonly title: {
            readonly type: "string";
            readonly maxLength: 200;
            readonly description: "What these figures are about";
        };
        readonly caption: {
            readonly type: "string";
            readonly maxLength: 400;
        };
        readonly metrics: {
            readonly type: "array";
            readonly maxItems: 6;
            readonly description: "Up to six figures. More than that wanted a table.";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["label", "value"];
                readonly properties: {
                    readonly label: {
                        readonly type: "string";
                        readonly maxLength: 120;
                    };
                    readonly value: {
                        readonly type: "string";
                        readonly maxLength: 2000;
                        readonly description: "Already formatted, including any unit or currency";
                    };
                    readonly change: {
                        readonly type: "string";
                        readonly maxLength: 400;
                        readonly description: "The movement, e.g. '+12% on last month'";
                    };
                    readonly changeTone: {
                        readonly type: "string";
                        readonly enum: readonly ["neutral", "positive", "caution", "negative"];
                        readonly description: "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable.";
                    };
                };
            };
        };
    };
};
declare const OpenMausChecklistParameters: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["title", "items"];
    readonly properties: {
        readonly title: {
            readonly type: "string";
            readonly maxLength: 200;
            readonly description: "What this list is";
        };
        readonly caption: {
            readonly type: "string";
            readonly maxLength: 400;
        };
        readonly items: {
            readonly type: "array";
            readonly description: "The items, in the order they should be done";
            readonly maxItems: 100;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["text", "done"];
                readonly properties: {
                    readonly text: {
                        readonly type: "string";
                        readonly maxLength: 2000;
                    };
                    readonly done: {
                        readonly type: "boolean";
                        readonly description: "Whether this one is already finished";
                    };
                    readonly note: {
                        readonly type: "string";
                        readonly maxLength: 400;
                        readonly description: "A short aside, e.g. who it is waiting on";
                    };
                };
            };
        };
    };
};
declare const OpenMausQuoteParameters: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["quote", "attribution"];
    readonly properties: {
        readonly quote: {
            readonly type: "string";
            readonly maxLength: 2000;
            readonly description: "The quotation itself, without surrounding quote marks";
        };
        readonly attribution: {
            readonly type: "string";
            readonly maxLength: 400;
            readonly description: "Who said or wrote it, e.g. 'Grace Hopper' or 'the 2026 annual report'";
        };
        readonly context: {
            readonly type: "string";
            readonly maxLength: 400;
            readonly description: "One short line of context: where it is from, or why it matters here";
        };
    };
};
declare const OpenMausRecordInputSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    statusTone: z.ZodOptional<z.ZodEnum<{
        neutral: "neutral";
        positive: "positive";
        caution: "caution";
        negative: "negative";
    }>>;
    fields: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
declare const OpenMausMetricsInputSchema: z.ZodObject<{
    title: z.ZodString;
    caption: z.ZodOptional<z.ZodString>;
    metrics: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
        change: z.ZodOptional<z.ZodString>;
        changeTone: z.ZodOptional<z.ZodEnum<{
            neutral: "neutral";
            positive: "positive";
            caution: "caution";
            negative: "negative";
        }>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
declare const OpenMausChecklistInputSchema: z.ZodObject<{
    title: z.ZodString;
    caption: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        done: z.ZodBoolean;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
declare const OpenMausQuoteInputSchema: z.ZodObject<{
    quote: z.ZodString;
    attribution: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
declare const openMausRecordBinding: {
    readonly componentId: "record";
    readonly viewVersion: 1;
    readonly toolName: "show_record_card";
    readonly kind: "card";
    readonly title: "Record";
    readonly description: "Show a structured record on screen: a person, an order, a file, anything with labeled fields. Use instead of a markdown table when the person should read one thing at a glance.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        statusTone: z.ZodOptional<z.ZodEnum<{
            neutral: "neutral";
            positive: "positive";
            caution: "caution";
            negative: "negative";
        }>>;
        fields: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly parameters: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["title", "fields"];
        readonly properties: {
            readonly title: {
                readonly type: "string";
                readonly maxLength: 200;
                readonly description: "What this record is, e.g. a person or an order";
            };
            readonly subtitle: {
                readonly type: "string";
                readonly maxLength: 400;
                readonly description: "One line of context under the title";
            };
            readonly status: {
                readonly type: "string";
                readonly maxLength: 120;
                readonly description: "A short status word, e.g. Approved";
            };
            readonly statusTone: {
                readonly type: "string";
                readonly enum: readonly ["neutral", "positive", "caution", "negative"];
                readonly description: "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable.";
            };
            readonly fields: {
                readonly type: "array";
                readonly description: "The fields, in the order they should be read";
                readonly maxItems: 50;
                readonly items: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly required: readonly ["label", "value"];
                    readonly properties: {
                        readonly label: {
                            readonly type: "string";
                            readonly maxLength: 120;
                        };
                        readonly value: {
                            readonly type: "string";
                            readonly maxLength: 2000;
                            readonly description: "Already formatted for a person to read";
                        };
                    };
                };
            };
        };
    };
    readonly viewSchema: z.ZodObject<{
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        statusTone: z.ZodOptional<z.ZodEnum<{
            neutral: "neutral";
            positive: "positive";
            caution: "caution";
            negative: "negative";
        }>>;
        fields: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly preview: {
        readonly title: "Invoice 2043";
        readonly subtitle: "Northwind Traders";
        readonly status: "Approved";
        readonly statusTone: "positive";
        readonly fields: readonly [{
            readonly label: "Amount";
            readonly value: "$4,280.00";
        }, {
            readonly label: "Raised";
            readonly value: "12 March";
        }, {
            readonly label: "Owner";
            readonly value: "Priya Raman";
        }];
    };
    readonly confirmation: "The record is now on screen for the person.";
    readonly validationAdapter: {
        readonly kind: "json-schema-validator";
        readonly module: "server/ui/validate.ts";
        readonly exportName: "validateArgs";
        readonly contractVersion: 1;
    };
    readonly legacyToolNames: readonly ["show_record_card"];
};
declare const openMausMetricsBinding: {
    readonly componentId: "metrics";
    readonly viewVersion: 1;
    readonly toolName: "show_metrics_card";
    readonly kind: "card";
    readonly title: "Figures";
    readonly description: "Show up to six figures with labels. Use when the person should compare numbers, not when a table or a full report is needed.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        metrics: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
            change: z.ZodOptional<z.ZodString>;
            changeTone: z.ZodOptional<z.ZodEnum<{
                neutral: "neutral";
                positive: "positive";
                caution: "caution";
                negative: "negative";
            }>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly parameters: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["title", "metrics"];
        readonly properties: {
            readonly title: {
                readonly type: "string";
                readonly maxLength: 200;
                readonly description: "What these figures are about";
            };
            readonly caption: {
                readonly type: "string";
                readonly maxLength: 400;
            };
            readonly metrics: {
                readonly type: "array";
                readonly maxItems: 6;
                readonly description: "Up to six figures. More than that wanted a table.";
                readonly items: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly required: readonly ["label", "value"];
                    readonly properties: {
                        readonly label: {
                            readonly type: "string";
                            readonly maxLength: 120;
                        };
                        readonly value: {
                            readonly type: "string";
                            readonly maxLength: 2000;
                            readonly description: "Already formatted, including any unit or currency";
                        };
                        readonly change: {
                            readonly type: "string";
                            readonly maxLength: 400;
                            readonly description: "The movement, e.g. '+12% on last month'";
                        };
                        readonly changeTone: {
                            readonly type: "string";
                            readonly enum: readonly ["neutral", "positive", "caution", "negative"];
                            readonly description: "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable.";
                        };
                    };
                };
            };
        };
    };
    readonly viewSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        metrics: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
            change: z.ZodOptional<z.ZodString>;
            changeTone: z.ZodOptional<z.ZodEnum<{
                neutral: "neutral";
                positive: "positive";
                caution: "caution";
                negative: "negative";
            }>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly preview: {
        readonly title: "This month";
        readonly caption: "Compared with the previous month";
        readonly metrics: readonly [{
            readonly label: "Revenue";
            readonly value: "$412k";
            readonly change: "+12% on last month";
            readonly changeTone: "positive";
        }, {
            readonly label: "Open deals";
            readonly value: "38";
        }, {
            readonly label: "Churn";
            readonly value: "1.4%";
            readonly change: "+0.3pt";
            readonly changeTone: "caution";
        }];
    };
    readonly confirmation: "The figures are now on screen for the person.";
    readonly validationAdapter: {
        readonly kind: "json-schema-validator";
        readonly module: "server/ui/validate.ts";
        readonly exportName: "validateArgs";
        readonly contractVersion: 1;
    };
    readonly legacyToolNames: readonly ["show_metrics_card"];
};
declare const openMausChecklistBinding: {
    readonly componentId: "checklist";
    readonly viewVersion: 1;
    readonly toolName: "show_checklist";
    readonly kind: "list";
    readonly title: "Checklist";
    readonly description: "Show a read-only checklist. Use for a set of items and whether each is already done. Do not use this for Todoist tasks the person should complete — use show_todoist_tasks for those.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            done: z.ZodBoolean;
            note: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly parameters: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["title", "items"];
        readonly properties: {
            readonly title: {
                readonly type: "string";
                readonly maxLength: 200;
                readonly description: "What this list is";
            };
            readonly caption: {
                readonly type: "string";
                readonly maxLength: 400;
            };
            readonly items: {
                readonly type: "array";
                readonly description: "The items, in the order they should be done";
                readonly maxItems: 100;
                readonly items: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly required: readonly ["text", "done"];
                    readonly properties: {
                        readonly text: {
                            readonly type: "string";
                            readonly maxLength: 2000;
                        };
                        readonly done: {
                            readonly type: "boolean";
                            readonly description: "Whether this one is already finished";
                        };
                        readonly note: {
                            readonly type: "string";
                            readonly maxLength: 400;
                            readonly description: "A short aside, e.g. who it is waiting on";
                        };
                    };
                };
            };
        };
    };
    readonly viewSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            done: z.ZodBoolean;
            note: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly preview: {
        readonly title: "Before the release";
        readonly caption: "Read-only progress report";
        readonly items: readonly [{
            readonly text: "Migrations applied";
            readonly done: true;
        }, {
            readonly text: "Changelog written";
            readonly done: true;
        }, {
            readonly text: "Load test";
            readonly done: false;
            readonly note: "Waiting on staging";
        }];
    };
    readonly confirmation: "The checklist is now on screen for the person.";
    readonly validationAdapter: {
        readonly kind: "json-schema-validator";
        readonly module: "server/ui/validate.ts";
        readonly exportName: "validateArgs";
        readonly contractVersion: 1;
    };
    readonly legacyToolNames: readonly ["show_checklist"];
};
declare const openMausQuoteBinding: {
    readonly componentId: "quote";
    readonly viewVersion: 1;
    readonly toolName: "show_quote";
    readonly kind: "card";
    readonly title: "Quotation";
    readonly description: "Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        quote: z.ZodString;
        attribution: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly parameters: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["quote", "attribution"];
        readonly properties: {
            readonly quote: {
                readonly type: "string";
                readonly maxLength: 2000;
                readonly description: "The quotation itself, without surrounding quote marks";
            };
            readonly attribution: {
                readonly type: "string";
                readonly maxLength: 400;
                readonly description: "Who said or wrote it, e.g. 'Grace Hopper' or 'the 2026 annual report'";
            };
            readonly context: {
                readonly type: "string";
                readonly maxLength: 400;
                readonly description: "One short line of context: where it is from, or why it matters here";
            };
        };
    };
    readonly viewSchema: z.ZodObject<{
        quote: z.ZodString;
        attribution: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly preview: {
        readonly quote: "Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.";
        readonly attribution: "The expense policy";
        readonly context: "Last changed in March.";
    };
    readonly confirmation: "The quotation is now on screen for the person.";
    readonly validationAdapter: {
        readonly kind: "json-schema-validator";
        readonly module: "server/ui/validate.ts";
        readonly exportName: "validateArgs";
        readonly contractVersion: 1;
    };
    readonly legacyToolNames: readonly ["show_quote"];
};
declare const OPENMAUS_BINDINGS: readonly [{
    readonly componentId: "record";
    readonly viewVersion: 1;
    readonly toolName: "show_record_card";
    readonly kind: "card";
    readonly title: "Record";
    readonly description: "Show a structured record on screen: a person, an order, a file, anything with labeled fields. Use instead of a markdown table when the person should read one thing at a glance.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        statusTone: z.ZodOptional<z.ZodEnum<{
            neutral: "neutral";
            positive: "positive";
            caution: "caution";
            negative: "negative";
        }>>;
        fields: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly parameters: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["title", "fields"];
        readonly properties: {
            readonly title: {
                readonly type: "string";
                readonly maxLength: 200;
                readonly description: "What this record is, e.g. a person or an order";
            };
            readonly subtitle: {
                readonly type: "string";
                readonly maxLength: 400;
                readonly description: "One line of context under the title";
            };
            readonly status: {
                readonly type: "string";
                readonly maxLength: 120;
                readonly description: "A short status word, e.g. Approved";
            };
            readonly statusTone: {
                readonly type: "string";
                readonly enum: readonly ["neutral", "positive", "caution", "negative"];
                readonly description: "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable.";
            };
            readonly fields: {
                readonly type: "array";
                readonly description: "The fields, in the order they should be read";
                readonly maxItems: 50;
                readonly items: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly required: readonly ["label", "value"];
                    readonly properties: {
                        readonly label: {
                            readonly type: "string";
                            readonly maxLength: 120;
                        };
                        readonly value: {
                            readonly type: "string";
                            readonly maxLength: 2000;
                            readonly description: "Already formatted for a person to read";
                        };
                    };
                };
            };
        };
    };
    readonly viewSchema: z.ZodObject<{
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        statusTone: z.ZodOptional<z.ZodEnum<{
            neutral: "neutral";
            positive: "positive";
            caution: "caution";
            negative: "negative";
        }>>;
        fields: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly preview: {
        readonly title: "Invoice 2043";
        readonly subtitle: "Northwind Traders";
        readonly status: "Approved";
        readonly statusTone: "positive";
        readonly fields: readonly [{
            readonly label: "Amount";
            readonly value: "$4,280.00";
        }, {
            readonly label: "Raised";
            readonly value: "12 March";
        }, {
            readonly label: "Owner";
            readonly value: "Priya Raman";
        }];
    };
    readonly confirmation: "The record is now on screen for the person.";
    readonly validationAdapter: {
        readonly kind: "json-schema-validator";
        readonly module: "server/ui/validate.ts";
        readonly exportName: "validateArgs";
        readonly contractVersion: 1;
    };
    readonly legacyToolNames: readonly ["show_record_card"];
}, {
    readonly componentId: "metrics";
    readonly viewVersion: 1;
    readonly toolName: "show_metrics_card";
    readonly kind: "card";
    readonly title: "Figures";
    readonly description: "Show up to six figures with labels. Use when the person should compare numbers, not when a table or a full report is needed.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        metrics: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
            change: z.ZodOptional<z.ZodString>;
            changeTone: z.ZodOptional<z.ZodEnum<{
                neutral: "neutral";
                positive: "positive";
                caution: "caution";
                negative: "negative";
            }>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly parameters: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["title", "metrics"];
        readonly properties: {
            readonly title: {
                readonly type: "string";
                readonly maxLength: 200;
                readonly description: "What these figures are about";
            };
            readonly caption: {
                readonly type: "string";
                readonly maxLength: 400;
            };
            readonly metrics: {
                readonly type: "array";
                readonly maxItems: 6;
                readonly description: "Up to six figures. More than that wanted a table.";
                readonly items: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly required: readonly ["label", "value"];
                    readonly properties: {
                        readonly label: {
                            readonly type: "string";
                            readonly maxLength: 120;
                        };
                        readonly value: {
                            readonly type: "string";
                            readonly maxLength: 2000;
                            readonly description: "Already formatted, including any unit or currency";
                        };
                        readonly change: {
                            readonly type: "string";
                            readonly maxLength: 400;
                            readonly description: "The movement, e.g. '+12% on last month'";
                        };
                        readonly changeTone: {
                            readonly type: "string";
                            readonly enum: readonly ["neutral", "positive", "caution", "negative"];
                            readonly description: "How this reads at a glance. Use negative and caution sparingly, for a refusal, a breach or a failure, not for anything merely notable.";
                        };
                    };
                };
            };
        };
    };
    readonly viewSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        metrics: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
            change: z.ZodOptional<z.ZodString>;
            changeTone: z.ZodOptional<z.ZodEnum<{
                neutral: "neutral";
                positive: "positive";
                caution: "caution";
                negative: "negative";
            }>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly preview: {
        readonly title: "This month";
        readonly caption: "Compared with the previous month";
        readonly metrics: readonly [{
            readonly label: "Revenue";
            readonly value: "$412k";
            readonly change: "+12% on last month";
            readonly changeTone: "positive";
        }, {
            readonly label: "Open deals";
            readonly value: "38";
        }, {
            readonly label: "Churn";
            readonly value: "1.4%";
            readonly change: "+0.3pt";
            readonly changeTone: "caution";
        }];
    };
    readonly confirmation: "The figures are now on screen for the person.";
    readonly validationAdapter: {
        readonly kind: "json-schema-validator";
        readonly module: "server/ui/validate.ts";
        readonly exportName: "validateArgs";
        readonly contractVersion: 1;
    };
    readonly legacyToolNames: readonly ["show_metrics_card"];
}, {
    readonly componentId: "checklist";
    readonly viewVersion: 1;
    readonly toolName: "show_checklist";
    readonly kind: "list";
    readonly title: "Checklist";
    readonly description: "Show a read-only checklist. Use for a set of items and whether each is already done. Do not use this for Todoist tasks the person should complete — use show_todoist_tasks for those.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            done: z.ZodBoolean;
            note: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly parameters: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["title", "items"];
        readonly properties: {
            readonly title: {
                readonly type: "string";
                readonly maxLength: 200;
                readonly description: "What this list is";
            };
            readonly caption: {
                readonly type: "string";
                readonly maxLength: 400;
            };
            readonly items: {
                readonly type: "array";
                readonly description: "The items, in the order they should be done";
                readonly maxItems: 100;
                readonly items: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly required: readonly ["text", "done"];
                    readonly properties: {
                        readonly text: {
                            readonly type: "string";
                            readonly maxLength: 2000;
                        };
                        readonly done: {
                            readonly type: "boolean";
                            readonly description: "Whether this one is already finished";
                        };
                        readonly note: {
                            readonly type: "string";
                            readonly maxLength: 400;
                            readonly description: "A short aside, e.g. who it is waiting on";
                        };
                    };
                };
            };
        };
    };
    readonly viewSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            done: z.ZodBoolean;
            note: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly preview: {
        readonly title: "Before the release";
        readonly caption: "Read-only progress report";
        readonly items: readonly [{
            readonly text: "Migrations applied";
            readonly done: true;
        }, {
            readonly text: "Changelog written";
            readonly done: true;
        }, {
            readonly text: "Load test";
            readonly done: false;
            readonly note: "Waiting on staging";
        }];
    };
    readonly confirmation: "The checklist is now on screen for the person.";
    readonly validationAdapter: {
        readonly kind: "json-schema-validator";
        readonly module: "server/ui/validate.ts";
        readonly exportName: "validateArgs";
        readonly contractVersion: 1;
    };
    readonly legacyToolNames: readonly ["show_checklist"];
}, {
    readonly componentId: "quote";
    readonly viewVersion: 1;
    readonly toolName: "show_quote";
    readonly kind: "card";
    readonly title: "Quotation";
    readonly description: "Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        quote: z.ZodString;
        attribution: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly parameters: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["quote", "attribution"];
        readonly properties: {
            readonly quote: {
                readonly type: "string";
                readonly maxLength: 2000;
                readonly description: "The quotation itself, without surrounding quote marks";
            };
            readonly attribution: {
                readonly type: "string";
                readonly maxLength: 400;
                readonly description: "Who said or wrote it, e.g. 'Grace Hopper' or 'the 2026 annual report'";
            };
            readonly context: {
                readonly type: "string";
                readonly maxLength: 400;
                readonly description: "One short line of context: where it is from, or why it matters here";
            };
        };
    };
    readonly viewSchema: z.ZodObject<{
        quote: z.ZodString;
        attribution: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly preview: {
        readonly quote: "Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.";
        readonly attribution: "The expense policy";
        readonly context: "Last changed in March.";
    };
    readonly confirmation: "The quotation is now on screen for the person.";
    readonly validationAdapter: {
        readonly kind: "json-schema-validator";
        readonly module: "server/ui/validate.ts";
        readonly exportName: "validateArgs";
        readonly contractVersion: 1;
    };
    readonly legacyToolNames: readonly ["show_quote"];
}];
type OpenMausBinding = (typeof OPENMAUS_BINDINGS)[number];

export { OPENMAUS_BINDINGS, type OpenMausBinding, OpenMausChecklistInputSchema, OpenMausChecklistParameters, OpenMausMetricsInputSchema, OpenMausMetricsParameters, OpenMausQuoteInputSchema, OpenMausQuoteParameters, OpenMausRecordInputSchema, OpenMausRecordParameters, openMausChecklistBinding, openMausMetricsBinding, openMausQuoteBinding, openMausRecordBinding };

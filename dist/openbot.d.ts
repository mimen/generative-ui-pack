import { z } from 'zod';

declare const OpenBotRecordInputSchema: z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const OpenBotMetricsInputSchema: z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const OpenBotChecklistInputSchema: z.ZodObject<{
    title: z.ZodString;
    caption: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        done: z.ZodBoolean;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const OpenBotQuoteInputSchema: z.ZodObject<{
    quote: z.ZodString;
    attribution: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const openBotRecordBinding: {
    readonly componentId: "record";
    readonly viewVersion: 1;
    readonly toolName: "showRecord";
    readonly kind: "card";
    readonly title: "Record";
    readonly description: "Show one thing and its fields, an order, a person, a ticket. Use instead of describing a record in prose.";
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
        }, z.core.$strip>>;
    }, z.core.$strip>;
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
};
declare const openBotMetricsBinding: {
    readonly componentId: "metrics";
    readonly viewVersion: 1;
    readonly toolName: "showMetrics";
    readonly kind: "card";
    readonly title: "Headline figures";
    readonly description: "Show up to six headline figures, each with an optional movement. Use for a summary somebody reads at a glance.";
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
        }, z.core.$strip>>;
    }, z.core.$strip>;
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
};
declare const openBotChecklistBinding: {
    readonly componentId: "checklist";
    readonly viewVersion: 1;
    readonly toolName: "showChecklist";
    readonly kind: "card";
    readonly title: "Checklist";
    readonly description: "Show a list of things and which are done. Reporting only, the person cannot tick these, so do not use it to ask for anything.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            done: z.ZodBoolean;
            note: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
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
};
declare const openBotQuoteBinding: {
    readonly componentId: "quote";
    readonly viewVersion: 1;
    readonly toolName: "showQuote";
    readonly kind: "card";
    readonly title: "Quotation";
    readonly description: "Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        quote: z.ZodString;
        attribution: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
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
};
declare const OPENBOT_BINDINGS: readonly [{
    readonly componentId: "record";
    readonly viewVersion: 1;
    readonly toolName: "showRecord";
    readonly kind: "card";
    readonly title: "Record";
    readonly description: "Show one thing and its fields, an order, a person, a ticket. Use instead of describing a record in prose.";
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
        }, z.core.$strip>>;
    }, z.core.$strip>;
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
}, {
    readonly componentId: "metrics";
    readonly viewVersion: 1;
    readonly toolName: "showMetrics";
    readonly kind: "card";
    readonly title: "Headline figures";
    readonly description: "Show up to six headline figures, each with an optional movement. Use for a summary somebody reads at a glance.";
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
        }, z.core.$strip>>;
    }, z.core.$strip>;
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
}, {
    readonly componentId: "checklist";
    readonly viewVersion: 1;
    readonly toolName: "showChecklist";
    readonly kind: "card";
    readonly title: "Checklist";
    readonly description: "Show a list of things and which are done. Reporting only, the person cannot tick these, so do not use it to ask for anything.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        title: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            done: z.ZodBoolean;
            note: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
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
}, {
    readonly componentId: "quote";
    readonly viewVersion: 1;
    readonly toolName: "showQuote";
    readonly kind: "card";
    readonly title: "Quotation";
    readonly description: "Show a quotation with its attribution. Use when the exact words matter, something a person said, or a line from a document you were given.";
    readonly readOnly: true;
    readonly inputSchema: z.ZodObject<{
        quote: z.ZodString;
        attribution: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
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
}];
type OpenBotBinding = (typeof OPENBOT_BINDINGS)[number];

export { OPENBOT_BINDINGS, type OpenBotBinding, OpenBotChecklistInputSchema, OpenBotMetricsInputSchema, OpenBotQuoteInputSchema, OpenBotRecordInputSchema, openBotChecklistBinding, openBotMetricsBinding, openBotQuoteBinding, openBotRecordBinding };

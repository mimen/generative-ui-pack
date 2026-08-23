import * as zod_v4_core from 'zod/v4/core';
import * as zod from 'zod';
import { z } from 'zod';
import { C as ComponentId } from './types-oGaoYaPx.js';
export { a as COMPONENT_IDS, b as ChecklistItem, c as ChecklistView, d as ComponentViewMap, M as Metric, e as MetricsView, Q as QuoteView, R as RecordField, f as RecordView, T as Tone, V as ViewVersion } from './types-oGaoYaPx.js';
export { a as HostBindingMetadata, b as HostKind, H as HostTarget, S as SerializableHostBinding, t as toSerializableHostBinding } from './hosts-D6FqS1QZ.js';

declare const recordDefinition: {
    readonly id: "record";
    readonly viewVersion: 1;
    readonly title: "Record";
    readonly description: "Show one named record and its display-ready fields instead of describing the record in prose.";
    readonly readOnly: true;
    readonly viewSchema: zod.ZodObject<{
        title: zod.ZodString;
        subtitle: zod.ZodOptional<zod.ZodString>;
        status: zod.ZodOptional<zod.ZodString>;
        statusTone: zod.ZodOptional<zod.ZodEnum<{
            neutral: "neutral";
            positive: "positive";
            caution: "caution";
            negative: "negative";
        }>>;
        fields: zod.ZodArray<zod.ZodObject<{
            label: zod.ZodString;
            value: zod.ZodString;
        }, zod_v4_core.$strict>>;
    }, zod_v4_core.$strict>;
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
};
declare const metricsDefinition: {
    readonly id: "metrics";
    readonly viewVersion: 1;
    readonly title: "Headline figures";
    readonly description: "Show up to six display-ready figures with optional changes for an at-a-glance summary.";
    readonly readOnly: true;
    readonly viewSchema: zod.ZodObject<{
        title: zod.ZodString;
        caption: zod.ZodOptional<zod.ZodString>;
        metrics: zod.ZodArray<zod.ZodObject<{
            label: zod.ZodString;
            value: zod.ZodString;
            change: zod.ZodOptional<zod.ZodString>;
            changeTone: zod.ZodOptional<zod.ZodEnum<{
                neutral: "neutral";
                positive: "positive";
                caution: "caution";
                negative: "negative";
            }>>;
        }, zod_v4_core.$strict>>;
    }, zod_v4_core.$strict>;
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
};
declare const checklistDefinition: {
    readonly id: "checklist";
    readonly viewVersion: 1;
    readonly title: "Checklist";
    readonly description: "Report checklist completion without offering controls or implying that the viewer can change state.";
    readonly readOnly: true;
    readonly viewSchema: zod.ZodObject<{
        title: zod.ZodString;
        caption: zod.ZodOptional<zod.ZodString>;
        items: zod.ZodArray<zod.ZodObject<{
            text: zod.ZodString;
            done: zod.ZodBoolean;
            note: zod.ZodOptional<zod.ZodString>;
        }, zod_v4_core.$strict>>;
    }, zod_v4_core.$strict>;
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
};
declare const quoteDefinition: {
    readonly id: "quote";
    readonly viewVersion: 1;
    readonly title: "Quotation";
    readonly description: "Show exact quoted words with attribution and optional source context.";
    readonly readOnly: true;
    readonly viewSchema: zod.ZodObject<{
        quote: zod.ZodString;
        attribution: zod.ZodString;
        context: zod.ZodOptional<zod.ZodString>;
    }, zod_v4_core.$strict>;
    readonly preview: {
        readonly quote: "Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.";
        readonly attribution: "The expense policy";
        readonly context: "Last changed in March.";
    };
};
declare const COMPONENT_DEFINITIONS: readonly [{
    readonly id: "record";
    readonly viewVersion: 1;
    readonly title: "Record";
    readonly description: "Show one named record and its display-ready fields instead of describing the record in prose.";
    readonly readOnly: true;
    readonly viewSchema: zod.ZodObject<{
        title: zod.ZodString;
        subtitle: zod.ZodOptional<zod.ZodString>;
        status: zod.ZodOptional<zod.ZodString>;
        statusTone: zod.ZodOptional<zod.ZodEnum<{
            neutral: "neutral";
            positive: "positive";
            caution: "caution";
            negative: "negative";
        }>>;
        fields: zod.ZodArray<zod.ZodObject<{
            label: zod.ZodString;
            value: zod.ZodString;
        }, zod_v4_core.$strict>>;
    }, zod_v4_core.$strict>;
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
}, {
    readonly id: "metrics";
    readonly viewVersion: 1;
    readonly title: "Headline figures";
    readonly description: "Show up to six display-ready figures with optional changes for an at-a-glance summary.";
    readonly readOnly: true;
    readonly viewSchema: zod.ZodObject<{
        title: zod.ZodString;
        caption: zod.ZodOptional<zod.ZodString>;
        metrics: zod.ZodArray<zod.ZodObject<{
            label: zod.ZodString;
            value: zod.ZodString;
            change: zod.ZodOptional<zod.ZodString>;
            changeTone: zod.ZodOptional<zod.ZodEnum<{
                neutral: "neutral";
                positive: "positive";
                caution: "caution";
                negative: "negative";
            }>>;
        }, zod_v4_core.$strict>>;
    }, zod_v4_core.$strict>;
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
}, {
    readonly id: "checklist";
    readonly viewVersion: 1;
    readonly title: "Checklist";
    readonly description: "Report checklist completion without offering controls or implying that the viewer can change state.";
    readonly readOnly: true;
    readonly viewSchema: zod.ZodObject<{
        title: zod.ZodString;
        caption: zod.ZodOptional<zod.ZodString>;
        items: zod.ZodArray<zod.ZodObject<{
            text: zod.ZodString;
            done: zod.ZodBoolean;
            note: zod.ZodOptional<zod.ZodString>;
        }, zod_v4_core.$strict>>;
    }, zod_v4_core.$strict>;
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
}, {
    readonly id: "quote";
    readonly viewVersion: 1;
    readonly title: "Quotation";
    readonly description: "Show exact quoted words with attribution and optional source context.";
    readonly readOnly: true;
    readonly viewSchema: zod.ZodObject<{
        quote: zod.ZodString;
        attribution: zod.ZodString;
        context: zod.ZodOptional<zod.ZodString>;
    }, zod_v4_core.$strict>;
    readonly preview: {
        readonly quote: "Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.";
        readonly attribution: "The expense policy";
        readonly context: "Last changed in March.";
    };
}];
type AnyComponentDefinition = (typeof COMPONENT_DEFINITIONS)[number];
declare function getComponentDefinition(id: ComponentId): AnyComponentDefinition;

declare const recordPreview: {
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
declare const metricsPreview: {
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
declare const checklistPreview: {
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
declare const quotePreview: {
    readonly quote: "Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.";
    readonly attribution: "The expense policy";
    readonly context: "Last changed in March.";
};
declare const PREVIEW_FIXTURES: {
    readonly record: {
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
    readonly metrics: {
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
    readonly checklist: {
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
    readonly quote: {
        readonly quote: "Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.";
        readonly attribution: "The expense policy";
        readonly context: "Last changed in March.";
    };
};

declare const ToneSchema: z.ZodEnum<{
    neutral: "neutral";
    positive: "positive";
    caution: "caution";
    negative: "negative";
}>;
declare const RecordViewSchema: z.ZodObject<{
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
declare const MetricsViewSchema: z.ZodObject<{
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
declare const ChecklistViewSchema: z.ZodObject<{
    title: z.ZodString;
    caption: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        done: z.ZodBoolean;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
declare const QuoteViewSchema: z.ZodObject<{
    quote: z.ZodString;
    attribution: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;

declare const PACKAGE_VERSION: "0.1.0";

export { type AnyComponentDefinition, COMPONENT_DEFINITIONS, ChecklistViewSchema, ComponentId, MetricsViewSchema, PACKAGE_VERSION, PREVIEW_FIXTURES, QuoteViewSchema, RecordViewSchema, ToneSchema, checklistDefinition, checklistPreview, getComponentDefinition, metricsDefinition, metricsPreview, quoteDefinition, quotePreview, recordDefinition, recordPreview };

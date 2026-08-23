// src/react/frame.tsx
import { useId } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function Frame({
  title,
  caption,
  badge,
  children,
  mode = "live"
}) {
  const titleId = useId();
  const captionId = useId();
  const describedBy = caption ? captionId : void 0;
  return /* @__PURE__ */ jsxs(
    "figure",
    {
      "aria-describedby": describedBy,
      "aria-labelledby": titleId,
      className: "gui-frame",
      "data-gui-mode": mode,
      "data-gui-read-only": "true",
      children: [
        /* @__PURE__ */ jsxs("figcaption", { className: "gui-frame__header", children: [
          /* @__PURE__ */ jsxs("span", { className: "gui-frame__heading", children: [
            /* @__PURE__ */ jsx("h3", { className: "gui-frame__title", id: titleId, children: title }),
            caption ? /* @__PURE__ */ jsx("span", { className: "gui-frame__caption", id: captionId, children: caption }) : null
          ] }),
          badge ? /* @__PURE__ */ jsx("span", { className: "gui-frame__badge", children: badge }) : null
        ] }),
        /* @__PURE__ */ jsx("div", { className: "gui-frame__body", children })
      ]
    }
  );
}
function Badge({
  tone = "neutral",
  children
}) {
  return /* @__PURE__ */ jsxs("span", { className: "gui-badge", "data-tone": tone, children: [
    tone === "neutral" ? null : /* @__PURE__ */ jsxs("span", { className: "gui-visually-hidden", children: [
      "Tone: ",
      tone,
      ". "
    ] }),
    children
  ] });
}

// src/react/checklist.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function Checklist({
  title,
  caption,
  items,
  mode
}) {
  const completedCount = items.filter((item) => item.done).length;
  const completionLabel = `${completedCount} of ${items.length} completed`;
  return /* @__PURE__ */ jsx2(
    Frame,
    {
      badge: /* @__PURE__ */ jsx2(
        Badge,
        {
          tone: completedCount === items.length && items.length > 0 ? "positive" : "neutral",
          children: completionLabel
        }
      ),
      caption,
      mode,
      title,
      children: /* @__PURE__ */ jsx2("ul", { "aria-label": completionLabel, className: "gui-checklist", children: items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: immutable ordered checklist rows have no stable IDs or local state.
        /* @__PURE__ */ jsxs2("li", { className: "gui-checklist__item", children: [
          /* @__PURE__ */ jsx2("span", { className: "gui-visually-hidden", children: item.done ? "Completed: " : "Not completed: " }),
          /* @__PURE__ */ jsx2(
            "span",
            {
              "aria-hidden": "true",
              className: "gui-checklist__mark",
              "data-completed": item.done ? "true" : "false",
              children: item.done ? "\u2713" : ""
            }
          ),
          /* @__PURE__ */ jsxs2("span", { className: "gui-checklist__copy", children: [
            /* @__PURE__ */ jsx2("span", { "data-completed": item.done ? "true" : "false", children: item.text }),
            item.note ? /* @__PURE__ */ jsx2("span", { className: "gui-checklist__note", children: item.note }) : null
          ] })
        ] }, index)
      )) })
    }
  );
}

// src/react/metrics.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function Metrics({
  title,
  caption,
  metrics,
  mode
}) {
  return /* @__PURE__ */ jsx3(Frame, { caption, mode, title, children: /* @__PURE__ */ jsx3("dl", { className: "gui-metrics", children: metrics.map((metric, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: immutable ordered metrics have no stable IDs or local state.
    /* @__PURE__ */ jsxs3("div", { className: "gui-metrics__metric", children: [
      /* @__PURE__ */ jsx3("dt", { children: metric.label }),
      /* @__PURE__ */ jsx3("dd", { className: "gui-metrics__value", children: metric.value }),
      metric.change ? /* @__PURE__ */ jsx3("dd", { className: "gui-metrics__change", children: /* @__PURE__ */ jsx3(Badge, { tone: metric.changeTone, children: metric.change }) }) : null
    ] }, index)
  )) }) });
}

// src/react/quote.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function Quote({
  quote,
  attribution,
  context,
  mode
}) {
  return /* @__PURE__ */ jsx4(Frame, { caption: context, mode, title: "Quotation", children: /* @__PURE__ */ jsxs4("blockquote", { className: "gui-quote", children: [
    /* @__PURE__ */ jsx4("p", { children: quote }),
    /* @__PURE__ */ jsxs4("footer", { children: [
      "\u2014 ",
      attribution
    ] })
  ] }) });
}

// src/react/record.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function Record({
  title,
  subtitle,
  status,
  statusTone,
  fields,
  mode
}) {
  return /* @__PURE__ */ jsx5(
    Frame,
    {
      badge: status ? /* @__PURE__ */ jsx5(Badge, { tone: statusTone, children: status }) : void 0,
      caption: subtitle,
      mode,
      title,
      children: /* @__PURE__ */ jsx5("dl", { className: "gui-record", children: fields.map((field, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: immutable ordered rows have no stable IDs or local state.
        /* @__PURE__ */ jsxs5("div", { className: "gui-record__field", children: [
          /* @__PURE__ */ jsx5("dt", { children: field.label }),
          /* @__PURE__ */ jsx5("dd", { children: field.value })
        ] }, index)
      )) })
    }
  );
}

// src/react/index.ts
var READ_ONLY_RENDERERS = {
  record: Record,
  metrics: Metrics,
  checklist: Checklist,
  quote: Quote
};
export {
  Badge,
  Checklist,
  Frame,
  Metrics,
  Quote,
  READ_ONLY_RENDERERS,
  Record
};
//# sourceMappingURL=react.js.map
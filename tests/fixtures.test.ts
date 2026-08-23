import { describe, expect, test } from "bun:test";
import {
	COMPONENT_DEFINITIONS,
	COMPONENT_IDS,
	PREVIEW_FIXTURES,
} from "../src/core/index";

describe("canonical definitions and fixtures", () => {
	test("keeps canonical IDs unique and versioned", () => {
		expect(COMPONENT_DEFINITIONS.map((definition) => definition.id)).toEqual([
			...COMPONENT_IDS,
		]);
		expect(
			new Set(COMPONENT_DEFINITIONS.map((definition) => definition.id)).size,
		).toBe(COMPONENT_DEFINITIONS.length);
		expect(
			COMPONENT_DEFINITIONS.every(
				(definition) => definition.viewVersion === 1 && definition.readOnly,
			),
		).toBe(true);
	});

	test("keeps preview fixtures byte-stable", () => {
		expect(JSON.stringify(PREVIEW_FIXTURES)).toBe(
			'{"record":{"title":"Invoice 2043","subtitle":"Northwind Traders","status":"Approved","statusTone":"positive","fields":[{"label":"Amount","value":"$4,280.00"},{"label":"Raised","value":"12 March"},{"label":"Owner","value":"Priya Raman"}]},"metrics":{"title":"This month","caption":"Compared with the previous month","metrics":[{"label":"Revenue","value":"$412k","change":"+12% on last month","changeTone":"positive"},{"label":"Open deals","value":"38"},{"label":"Churn","value":"1.4%","change":"+0.3pt","changeTone":"caution"}]},"checklist":{"title":"Before the release","caption":"Read-only progress report","items":[{"text":"Migrations applied","done":true},{"text":"Changelog written","done":true},{"text":"Load test","done":false,"note":"Waiting on staging"}]},"quote":{"quote":"Meals under $75 need no receipt. Anything above needs one, and anything above $500 needs your manager before you spend it.","attribution":"The expense policy","context":"Last changed in March."}}',
		);
	});
});

import type { JsonObject, JsonValue } from "./types";

function normalize(value: JsonValue): JsonValue {
	if (Array.isArray(value)) {
		return value.map((entry) => normalize(entry));
	}

	if (value !== null && typeof value === "object") {
		const sortedEntries = Object.entries(value).sort(([left], [right]) => {
			if (left === right) return 0;
			return left < right ? -1 : 1;
		});
		const normalized: Record<string, JsonValue> = {};
		for (const [key, entry] of sortedEntries) {
			normalized[key] = normalize(entry);
		}
		return normalized satisfies JsonObject;
	}

	return value;
}

export function stableJson(value: JsonValue): string {
	return `${JSON.stringify(normalize(value), null, 2)}\n`;
}

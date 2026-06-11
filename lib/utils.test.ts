import { describe, expect, it } from "vitest";
import { formatTime, getTypeLabel } from "./utils";

describe("formatTime", () => {
	it("renders sub-hour as minutes", () => {
		expect(formatTime(0)).toBe("0m ago");
		expect(formatTime(0.5)).toBe("30m ago");
	});

	it("renders under a day as hours", () => {
		expect(formatTime(1)).toBe("1h ago");
		expect(formatTime(5.4)).toBe("5h ago");
		expect(formatTime(23)).toBe("23h ago");
	});

	it("renders a day or more as days", () => {
		expect(formatTime(24)).toBe("1d ago");
		expect(formatTime(50)).toBe("2d ago");
	});
});

describe("getTypeLabel", () => {
	it("detects Ask/Show from title prefix", () => {
		expect(getTypeLabel({ title: "Ask HN: x", type: "story" })).toBe("Ask");
		expect(getTypeLabel({ title: "Show HN: y", type: "story" })).toBe("Show");
	});

	it("labels jobs by type", () => {
		expect(getTypeLabel({ title: "We are hiring", type: "job" })).toBe("Job");
	});

	it("returns null for plain stories", () => {
		expect(getTypeLabel({ title: "A regular post", type: "story" })).toBeNull();
	});
});

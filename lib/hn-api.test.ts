import { describe, expect, it } from "vitest";
import {
	computeScore,
	extractDomain,
	type HNStory,
	scoreStories,
} from "./hn-api";

const baseStory = (over: Partial<HNStory> = {}): HNStory => ({
	id: 1,
	type: "story",
	by: "alice",
	time: 0,
	title: "t",
	score: 100,
	descendants: 50,
	...over,
});

describe("extractDomain", () => {
	it("strips www and returns hostname", () => {
		expect(extractDomain("https://www.example.com/a/b")).toBe("example.com");
		expect(extractDomain("https://sub.example.com")).toBe("sub.example.com");
	});

	it("returns undefined for missing or invalid urls", () => {
		expect(extractDomain(undefined)).toBeUndefined();
		expect(extractDomain("not a url")).toBeUndefined();
	});
});

describe("computeScore", () => {
	const NOW_MS = 7200 * 1000; // story.time 0 => 2h old

	it("combines points and comments over time decay", () => {
		const s = baseStory({ score: 100, descendants: 50, time: 0 });
		// (100 + 50) / (2 + 2)^1 = 37.5
		expect(computeScore(s, 1, NOW_MS)).toBeCloseTo(37.5);
	});

	it("higher alpha decays older stories harder", () => {
		const s = baseStory({ time: 0 });
		expect(computeScore(s, 1.5, NOW_MS)).toBeLessThan(
			computeScore(s, 0.5, NOW_MS),
		);
	});

	it("treats missing score/descendants as zero", () => {
		const s = baseStory({ score: undefined as never, descendants: undefined });
		expect(computeScore(s, 1, NOW_MS)).toBe(0);
	});
});

describe("scoreStories", () => {
	it("annotates each story with computedScore, hoursAgo and domain", () => {
		const out = scoreStories([baseStory({ url: "https://www.a.com/x" })], 1);
		expect(out).toHaveLength(1);
		expect(out[0].domain).toBe("a.com");
		expect(out[0].computedScore).toBeGreaterThan(0);
		expect(out[0].hoursAgo).toBeGreaterThan(0);
	});
});

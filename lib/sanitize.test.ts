import { describe, expect, it } from "vitest";
import { sanitize } from "./sanitize";

describe("sanitize", () => {
	it("strips disallowed tags and event handlers", () => {
		expect(sanitize("<script>alert(1)</script><p>hi</p>")).toBe("<p>hi</p>");
		expect(sanitize('<img src=x onerror="alert(1)">')).toBe("");
	});

	it("keeps allowed formatting tags", () => {
		const html = "<p><b>bold</b> <i>italic</i> <code>x</code></p>";
		expect(sanitize(html)).toBe(html);
	});

	it("hardens anchors with rel and target", () => {
		const out = sanitize('<a href="https://x.com">x</a>');
		expect(out).toContain('rel="noopener noreferrer"');
		expect(out).toContain('target="_blank"');
		expect(out).toContain('href="https://x.com"');
	});
});

import { describe, expect, it } from "vitest";
import { detectLang } from "./highlight";

describe("detectLang", () => {
	it("detects python", () => {
		expect(detectLang("def foo():\n    return 1")).toBe("python");
		expect(detectLang("from os import path")).toBe("python");
	});

	it("detects rust", () => {
		expect(detectLang("pub fn main() {}")).toBe("rust");
	});

	it("detects go", () => {
		expect(detectLang("func main() {}")).toBe("go");
		expect(detectLang("x := 5")).toBe("go");
	});

	it("detects typescript", () => {
		expect(detectLang("interface Foo { a: number }")).toBe("typescript");
	});

	it("detects javascript", () => {
		expect(detectLang("const x = () => 1")).toBe("javascript");
	});

	it("detects sql", () => {
		expect(detectLang("SELECT * FROM users")).toBe("sql");
	});

	it("falls back to text for prose", () => {
		expect(detectLang("hello world this is plain prose")).toBe("text");
	});
});

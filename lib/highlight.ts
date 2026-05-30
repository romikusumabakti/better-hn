import { createHighlighter, type Highlighter } from "shiki";
import type { HNComment } from "./hn-api";
import { sanitize } from "./sanitize";

let _hl: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	if (!_hl) {
		_hl = createHighlighter({
			themes: ["github-light", "github-dark"],
			langs: [
				"javascript",
				"typescript",
				"python",
				"bash",
				"rust",
				"go",
				"c",
				"cpp",
				"java",
				"json",
				"html",
				"css",
				"sql",
				"text",
			],
		}).catch((err) => {
			_hl = null;
			throw err;
		});
	}
	return _hl;
}

function detectLang(code: string): string {
	const t = code.trim();
	if (
		/^\s*(from \S+ import |import \w|def |class \w+:|if __name__)/.test(t) ||
		/:\n\s{4}\S/.test(t)
	)
		return "python";
	if (
		/^\s*(use |pub fn |fn \w+[\s<(]|impl |struct \w|enum \w|let mut )/.test(t)
	)
		return "rust";
	if (/^\s*(func |package \w|import \()/.test(t) || /[a-z] := /.test(t))
		return "go";
	if (
		/(:\s*\w[\w<|[]+[;,]|interface \w|type \w+ =|Promise<|: \w+\[])/.test(t)
	)
		return "typescript";
	if (
		/(^\s*(const |let |var |function |async function|class )|\.(then|catch)\(| => |\$\{)/.test(
			t,
		)
	)
		return "javascript";
	if (
		/^\s*(#include|int main\b|void \w+\s*\(|class \w[\w\s]*\{)/.test(t)
	)
		return "cpp";
	if (
		/^(\$\s|#!\/|% )/.test(t) ||
		/\|\s*(grep|awk|sed|xargs|sort|head|tail)\b/.test(t)
	)
		return "bash";
	if (/^\s*<(!DOCTYPE|html|head|body|div|span|p)[^w]/.test(t)) return "html";
	if (/^\s*[\{\[]/.test(t) && /"[\w-]+":\s/.test(t)) return "json";
	if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER TABLE)\b/i.test(t))
		return "sql";
	return "text";
}

function decode(html: string): string {
	return html
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

export async function highlightHtml(html: string): Promise<string> {
	if (!html || !html.includes("<pre>")) return html;
	const hl = await getHighlighter();
	return html.replace(
		/<pre><code>([\s\S]*?)<\/code><\/pre>/gi,
		(match, raw) => {
			const code = decode(raw);
			const lang = detectLang(code);
			try {
				return hl.codeToHtml(code, {
					lang,
					themes: { light: "github-light", dark: "github-dark" },
					defaultColor: false,
				});
			} catch {
				return match;
			}
		},
	);
}

export async function processComment(comment: HNComment): Promise<HNComment> {
	const [_html, children] = await Promise.all([
		comment.text
			? highlightHtml(sanitize(comment.text))
			: Promise.resolve(undefined),
		Promise.all(comment.children.map(processComment)),
	]);
	return { ...comment, _html, children };
}

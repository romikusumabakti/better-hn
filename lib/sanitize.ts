import sanitizeHtml from "sanitize-html";

const ALLOWED: sanitizeHtml.IOptions = {
	allowedTags: ["a", "b", "i", "p", "pre", "code", "br"],
	allowedAttributes: { a: ["href", "rel", "target"] },
	transformTags: {
		a: sanitizeHtml.simpleTransform("a", {
			rel: "noopener noreferrer",
			target: "_blank",
		}),
	},
};

export function sanitize(html: string): string {
	return sanitizeHtml(html, ALLOWED);
}

import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "span",
      "div",
      "table",
      "tr",
      "td",
      "th",
      "thead",
      "tbody",
      "blockquote",
      "code",
      "pre",
      "hr",
      "b",
      "i",
      "u",
      "small",
      "sub",
      "sup",
      "del",
      "ins",
      "mark",
      "details",
      "summary",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "style", "target", "rel"],
  });
}

export function sanitizeCss(css: string): string {
  if (!css) return "";
  return css
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/url\s*\(\s*javascript:/gi, "url(\"#")
    .replace(/-moz-binding\s*:/gi, "")
    .replace(/behavior\s*:/gi, "");
}

export function sanitizeJsonForScriptTag(jsonString: string): string {
  return jsonString
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E");
}

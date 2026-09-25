import { sanitizeCss, sanitizeHtml } from "@/utils/sanitize";

interface StaticContentProps {
    options: {
        html: string;
        css: string;
    };
}

export default function StaticContent({ options }: StaticContentProps) {
    if (!options?.html) return null;

    return (
        <div className="static-content-wrapper">
            {options.css && (
                <style dangerouslySetInnerHTML={{ __html: sanitizeCss(options.css) }} />
            )}
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(options.html) }} />
        </div>
    );
}

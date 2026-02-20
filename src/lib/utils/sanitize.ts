/**
 * Sanitizes user input to prevent XSS attacks
 * Escapes HTML special characters and removes potentially dangerous tags
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    return (
        input
            // Escape HTML special characters
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            // Remove potentially dangerous javascript: and data: URLs
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            // Remove potentially dangerous event handlers
            .replace(/on\w+\s*=/gi, '')
            // Remove script tags
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Remove iframe tags
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            // Remove object tags
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            // Remove embed tags
            .replace(/<embed\b[^<]*[^>]*>/gi, '')
            // Remove style tags to prevent CSS injection
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            // Remove potentially dangerous attributes
            .replace(/style\s*=\s*["'][^"']*["']/gi, '')
            .replace(/expression\s*\(/gi, '')
    );
}

/**
 * Validates and sanitizes URL input
 * Only allows http:// and https:// protocols
 */
export function sanitizeUrl(url: string): string | null {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return null;
        }
        return url.trim();
    } catch {
        // If URL is invalid, try prepending https://
        try {
            const withProtocol = `https://${url}`;
            new URL(withProtocol);
            return withProtocol;
        } catch {
            return null;
        }
    }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates username format (alphanumeric, underscores, hyphens, 3-30 chars)
 */
export function isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
}

/**
 * Truncates text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

export function decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

export function decodeHtmlServer(html: string): string {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, num) => String.fromCharCode(parseInt(num, 16)));
}

export function escapeHTML(html: string): string {
    const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };

    return html.replace(/[&<>"']/g, char => escapeMap[char] ?? '');
}

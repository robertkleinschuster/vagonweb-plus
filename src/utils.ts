export function directTextContent(node?: Node)
{
    if (!node) {
        return '';
    }
    return Array.prototype.filter
        .call(node.childNodes ?? [], (child) => child.nodeType === Node.TEXT_NODE)
        .map((child) => child.textContent)
        .join('') as string
}
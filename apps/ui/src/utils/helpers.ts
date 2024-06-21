export function urlToId(id: string) {
    return id.replace(/-/g, '+').replace(/_/g, '/');
}

export function idToUrl(id: string) {
    return id.replace(/\+/g, '-').replace(/\//g, '_');
}

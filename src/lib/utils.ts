export const getBasePath = () => {
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
};

export const getAssetPath = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${getBasePath()}${cleanPath}`;
};

/**
 * Fetch an SVG asset and return its markup — or "" for anything that is not
 * actually an SVG.
 *
 * Every icon on the board is injected with dangerouslySetInnerHTML. The fetch
 * used to hand the response over unchecked, so while GitHub Pages was mid-
 * redeploy its HTML error page (the angry unicorn) came back instead of the
 * icons and got painted straight into the tiles, error page mascot and all.
 * Nothing that fails to parse as a lone <svg> document ever gets through now:
 * a failed or foreign response just means the icon is skipped for that render.
 */
export async function fetchSvgAsset(path: string): Promise<string> {
    try {
        const res = await fetch(getAssetPath(path));
        if (!res.ok) return "";
        const text = (await res.text()).trim();
        if (!/^<svg[\s>]/i.test(text)) return "";
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        if (doc.documentElement.nodeName.toLowerCase() !== "svg") return "";
        if (doc.getElementsByTagName("parsererror").length > 0) return "";
        return text;
    } catch {
        return "";
    }
}


export const getSearchDomains = async () => {

    return (await get('searchDomains')) ?? [];

}

export const searchPlaceholder = '<|search|>';
export function getSearchUrl({ searchDomain, searchText }) {
    let url;
    if (searchText.length > 0) {
        url = encodeURI(searchDomain.template.replace(searchPlaceholder, searchText));
    } else {
        url = searchDomain.url;
    }

    return url;
}

export const getFavIconUrl = async (u) => {
    const url = new URL(await chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "32");
    return url.toString();
};

export async function get(key) {
    const data = (await chrome.storage.local.get([key])) ?? {};
    return data[key];
}

export async function set(record) {
    await chrome.storage.local.set(record);
}


export const getSearchDomains = async () => {

    return (await get('searchDomains')) ?? [];

}

const searchPlaceholder = '<|search|>';
export async function openVerticalSearch({ searchDomain, searchText, newTab = true }) {
    let url;
    if (searchText.length > 0) {
        url = encodeURI(searchDomain.template.replace(searchPlaceholder, searchText));
    } else {
        url = searchDomain.url;
    }

    const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]

    if (newTab) chrome.tabs.create({ url, index: activeTab.index + 1, })
    else chrome.tabs.update(tab.id, { url });
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

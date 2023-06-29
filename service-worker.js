chrome.runtime.onMessage.addListener(onMessageFromContent);

function onMessageFromContent(msg, sender, response) {


    if (msg.command == 'searchEntered') onSearchEntered(sender.tab, msg.searchString);
    else if (msg.command == 'resourceOpened') onResourceOpened(sender.tab, response);
    return true;
}


async function onResourceOpened(tab) {

    checkTabForSearch(tab);
}


async function onSearchEntered(tab, searchString, response) {

    const url = new URL(tab.url);
    const lastSearch = {
        searchString,
        tab: getTabInfo(tab),
        hostname: url.hostname,
        time: Date.now(),

    }
    set({ lastSearch });


}

const searchPlaceholder = '<|search|>'
async function checkTabForSearch(context, tab) {

    let url = new URL(getTabInfo(tab).url);
    let searchEngines = (await get('searchEngines')) ?? [];


    let searchEngineIndex = searchEngines.findIndex((s) => s.hostname == url.hostname);
    let searchEngine;
    if (searchEngineIndex > -1) {

        searchEngine = searchEngines[searchEngineIndex];

        const searchPrefix = searchEngine.template.split(searchPlaceholder)[0];

        const matchesSearchTemplate = url.toString().startsWith(searchPrefix);

        if (matchesSearchTemplate) {
            if (!searchEngine.searchCount) searchEngine.searchCount = 0;
            searchEngine.searchCount += 1;
            searchEngine.lastUsed = Date.now();
            searchEngine.isIncognito = tab.incognito;
            if (!searchEngine.contexts) searchEngine.contexts = [];
            if (context && !searchEngine.contexts.includes(context.id)) searchEngine.contexts.push(context.id);
            searchEngines[searchEngineIndex] = searchEngine;
        }

    } else {
        const lastSearch = (await get('lastSearch')) ?? {};

        const template = decodeURI(url.toString())
            .replaceAll('%3A', ':').replaceAll('+', ' ')
            .replace(lastSearch.searchString ?? '', searchPlaceholder);

        const foundSearch = (
            lastSearch.tab?.id == tab.id
            && Date.now() - lastSearch.time < 5000
            && lastSearch.hostname == url.hostname
            && template.includes(searchPlaceholder)
        );



        if (foundSearch) {

            searchEngine = {
                searchCount: 1,
                created: lastSearch.time,
                hostname: lastSearch.hostname,
                isIncognito: tab.incognito,
                template,
                ...lastSearch.tab,
                contexts: context ? [context.id] : [],
            }

            delete searchEngine.id;

            searchEngines.push(searchEngine);
        }
    }

    if (searchEngine) {
        if (context) {
            if (!context.searchCount) context.searchCount = 0;
            context.searchCount += 1;
            saveContext(context);
        }

        set({ searchEngines });
    }

}

async function onOpenVerticalSearch(tab, { searchEngine, searchText, newTab = true }) {
    let url;
    if (searchText.length > 0) {
        url = encodeURI(searchEngine.template.replace(searchPlaceholder, searchText));
    } else {
        url = searchEngine.url;
    }

    if (newTab) createAdjacentTab(tab, { url });
    else chrome.tabs.update(tab.id, { url });
}

async function getSearchEnginesFromApp(response) {
    response({ searchEngines: await get('searchEngines') });
}

async function getDomainsFromApp(response) {

    const bookmarks = await chrome.bookmarks.search({ query: null });
    const now = Date.now();
    const aMonthAgo = now - (30 * 24 * 60 * 60 * 1000);


    let domains = {}

    for (const bookmark of bookmarks) {
        if (!bookmark.url) continue;
        const url = new URL(bookmark.url);
        var domain = domains[url.hostname];
        if (url.hostname in domains) {
            domain.count += 1;
            if ((domain.lastSaved ?? 0) < bookmark.dateAdded) {
                domain.lastSaved = bookmark.dateAdded;
            }
            if (!domain.folders.includes(bookmark.parentId)) {
                domain.folders.push(bookmark.parentId)
            }
        } else {
            domain = { count: 1, folders: [] };
        }
        domains[url.hostname] = domain;
    }

    domains = Object.entries(domains).map(([k, v]) => {
        return {
            host: k,
            ...v,
        };
    }).filter((d) => d.count > 2);;

    response({ domains });
}

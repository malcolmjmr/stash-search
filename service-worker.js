chrome.runtime.onMessage.addListener(onMessageFromContent);

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));


function onMessageFromContent(msg, sender, response) {
    console.log('message from content');
    if (msg.command == 'searchEntered') onSearchEntered(sender.tab, msg.searchString);
    else if (msg.command == 'resourceOpened') onResourceOpened(sender.tab, response);
    return true;
}


async function onResourceOpened(tab) {
    checkTabForSearch(tab);
}


async function onSearchEntered(tab, searchString, response) {

    console.log('search entered');
    console.log(searchString);
    const url = new URL(tab.url);
    const lastSearch = {
        searchString,
        tab: getTabInfo(tab),
        hostname: url.hostname,
        time: Date.now(),

    }
    set({ lastSearch });


}

const searchPlaceholder = '<|search|>';
async function checkTabForSearch(tab) {

    let url = new URL(getTabInfo(tab).url);
    let searchDomains = (await get('searchDomains')) ?? [];

    let searchDomainIndex = searchDomains.findIndex((s) => s.hostname == url.hostname);
    let searchDomain;
    if (searchDomainIndex > -1) {

        searchDomain = searchDomains[searchDomainIndex];

        const searchPrefix = searchDomain.template.split(searchPlaceholder)[0];

        const matchesSearchTemplate = url.toString().startsWith(searchPrefix);

        if (matchesSearchTemplate) {
            if (!searchDomain.searchCount) searchDomain.searchCount = 0;
            searchDomain.searchCount += 1;
            searchDomain.lastUsed = Date.now();
            searchDomain.isIncognito = tab.incognito;
            searchDomains[searchDomainIndex] = searchDomain;
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

            console.log('adding search domain:');

            searchDomain = {
                searchCount: 1,
                created: lastSearch.time,
                hostname: lastSearch.hostname,
                isIncognito: tab.incognito,
                template,
                ...lastSearch.tab,
            }

            console.log(searchDomain);

            delete searchDomain.id;

            searchDomains.push(searchDomain);
            chrome.runtime.sendMessage({ command: 'searchDomainAdded' });
        }


    }

    if (searchDomain) {
        set({ searchDomains });
    }

}



async function getSearchDomainsFromApp(response) {
    response({ searchDomains: await get('searchDomains') });
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

async function get(key) {
    const data = (await chrome.storage.local.get([key])) ?? {};
    return data[key];
}

async function set(record) {
    await chrome.storage.local.set(record);
}

function getTabInfo(tab) {

    let tabInfo = {
        id: tab.id,
        title: tab.title,
        url: tab.url && tab.url != '' ? tab.url : tab.pendingUrl,
        favIconUrl: tab.favIconUrl,

    };

    return tabInfo;
}

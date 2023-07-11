<script>
    import { onMount } from "svelte";
    import { getFavIconUrl, getSearchUrl } from "../utilities/chrome";

    export let searchDomain;
    export let searchText;

    let iconUrl;

    onMount(() => {
        load();
    });

    let loaded;
    const load = async () => {
        iconUrl =
            searchDomain.favIconUrl ?? (await getFavIconUrl(searchDomain.url));
        loaded = true;
    };

    const onMouseDown = async () => {
        // set interval
    };

    const onMouseUp = async () => {
        // check that user has not performed a long press
        const activeTab = (
            await chrome.tabs.query({ active: true, currentWindow: true })
        )[0];
        if ((searchText?.length ?? 0) > 0) {
            const newTab = await chrome.tabs.create({
                url: getSearchUrl({ searchDomain, searchText }),
                index: activeTab.index + 1,
            });
            let groupId =
                activeTab.groupId > -1
                    ? activeTab.groupId
                    : (await chrome.tabGroups.create({ title: searchText })).id;
            await chrome.tabs.group({ tabId: newTab.id, groupId });
        } else {
            const newTab = await chrome.tabs.create({
                url: new URL(searchDomain).hostname,
                index: activeTab.index + 1,
            });
        }
    };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if loaded}
    <div
        class="search-domain"
        on:mousedown={onMouseDown}
        on:mouseup={onMouseUp}
    >
        <img src={iconUrl} alt="" />
    </div>
{/if}

<style>
</style>

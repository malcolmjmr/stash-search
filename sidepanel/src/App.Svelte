<script>
    import { onMount } from "svelte";
    import { getSearchDomains } from "./utilities/chrome.js";
    import Header from "./header/Header.svelte";
    import SearchDomain from "./search/SearchDomain.svelte";

    let searchText = "";
    let searchDomains = [];

    let loaded;
    onMount(() => {
        init();
    });

    const init = async () => {
        searchDomains = await getSearchDomains();
        addEventListeners();
        loaded = true;
    };

    const addEventListeners = () => {
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if (msg.command == "searchDomainAdded") onSearchDomainAdded(msg);
        });
    };

    const onSearchDomainAdded = async ({ searchDomain }) => {
        searchDomains = await getSearchDomains();
    };
</script>

{#if loaded}
    <main>
        <Header bind:searchText />
        <div class="search-domains">
            {#each searchDomains as searchDomain}
                <SearchDomain {searchDomain} />
            {/each}
        </div>
    </main>
{/if}

<style>
    :global(html, body, #app) {
        margin: 0px;
        background-color: #28282b;
        width: 100%;
        height: 100%;
        position: relative;
        font-family: system-ui, sans-serif;
        font-weight: 300;
        overflow: hidden;
        letter-spacing: 0.8px;
    }

    main {
        height: 100%;
        width: 100%;
    }
</style>

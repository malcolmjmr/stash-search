<script>
    import { onMount } from "svelte";
    import { getFavIconUrl } from "../utilities/chrome";

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

    const onMouseDown = () => {
        if (searchText.length > 0) {
        }
    };

    const onMouseUp = () => {};
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if loaded}
    <div
        class="search-domain"
        on:mousedown={onMouseDown}
        on:mouseup={onMouseUp}
    >
        <img src={searchDomain.iconUrl} alt="" />
    </div>
{/if}

<style>
</style>

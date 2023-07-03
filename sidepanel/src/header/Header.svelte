<script>
    import MoreMenu from "./MoreMenu.svelte";
    import SearchBox from "./SearchBox.svelte";
    import moreIcon from "../icons/more-vert.png";

    export let searchText;
    let showMore;
</script>

<div class="header">
    <div class="main">
        <SearchBox bind:searchText />
        <img class="more icon" src={moreIcon} alt="More" />
    </div>
    {#if showMore}
        <MoreMenu />
    {/if}
</div>

<style>
    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 50px;
        width: 100%;
    }

    .header .main {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
    }
    .more.icon {
        filter: invert(1);
        height: 20px;
        width: 20px;
    }

    .icon:hover {
        cursor: pointer;
    }
</style>

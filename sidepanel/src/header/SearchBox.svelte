<script>
    import searchIcon from "../icons/search.png";
    import clearIcon from "../icons/close.png";

    export let searchText;
    export let backgroundColor = null;

    const onClearTextClicked = () => {
        searchText = "";
    };
</script>

<div
    class="search-box"
    style={backgroundColor ? "background-color: " + backgroundColor : ""}
>
    <img src={searchIcon} alt="Search" />
    <input type="text" bind:value={searchText} placeholder="Search" />
    {#if searchText.length > 0}
        <img
            class="clear button"
            alt="Clear"
            src={clearIcon}
            on:mousedown={onClearTextClicked}
        />
    {/if}
</div>

<style>
    .search-box {
        padding: 2px;
        margin: 5px;
        background-color: #444444;
        border-radius: 5px;
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    img {
        height: 22px;
        width: 22px;
        margin-right: 5px;
        filter: invert(1);
    }

    input {
        text-decoration: none;
        box-shadow: none;
        border: none;
        outline: none;
        background-color: transparent;
        width: 100%;
        height: 100%;
        font-size: 16px;
        color: white;
    }

    .button:hover {
        cursor: pointer;
    }

    .clear.button {
        height: 16px;
        width: 16px;
    }

    .clear.button:hover {
        cursor: pointer;
    }
</style>

var lastWindowLocation = window.location.href;


let context;
let resource;

let altPressed;
let metaKeyPressed;

window.onload = (e) => {

    const url = new URL(window.location.href);
    const isApp = (url.hostname.includes('localhost') || url.hostname.includes('stash.technology')) && url.pathname != '/user-guide';
    if (isApp) return;

    chrome.runtime.sendMessage({
        command: 'resourceOpened',
    }, onResourceOpened);

    document.addEventListener('keydown', onKeyDown);
}



window.onpopstate = history.onpushstate = (event) => {

    updateLastLocation();
};

async function onResourceOpened(response) {

}

async function onKeyDown(e) {
    const key = e.code?.replace('Key', '');
    if (key.includes('Alt')) {
        altPressed = true;
    } else if (key.includes('Meta')) {
        metaKeyPressed = true;
        const text = window.getSelection().toString();
        if (text.length > 0) {
            saveScrap({
                text,
            });
        }
    } else if (key.includes('Enter')) {
        const searchString = e.target.value;
        if (searchString.length > 100) return;
        chrome.runtime.sendMessage({
            command: 'searchEntered',
            searchString,
        });

        setTimeout(() => {
            if (window.location.href != lastWindowLocation) updateLastLocation();
        }, 1000);
    }
}

function updateLastLocation() {
    lastWindowLocation = window.location.href;
    window.setTimeout(() => {
        try {
            chrome.runtime.sendMessage({
                command: 'resourceOpened',
                resource: {
                    title: document.title,
                    url: lastWindowLocation,
                },
            }, onResourceOpened);
        } catch (e) {

        }

    }, 1000);
}

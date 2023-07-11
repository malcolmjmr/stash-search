var lastWindowLocation = window.location.href;


let context;
let resource;

let altPressed;
let metaKeyPressed;

window.onload = (e) => {
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
    if (key.includes('Enter')) {
        const searchString = e.target.value;
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

let ruleList = false;

// set signIn if cookie found
function cookieStatus(cookie) {
    if (cookie) {
        console.log("found");
        if (cookie.domain === ".amazon.com") {
            if (ruleList === false) {
                chrome.declarativeNetRequest.updateSessionRules({
                    addRules: [
                        {
                            "id": 1,
                            "priority": 1,
                            "action": {
                                "type": "redirect",
                                "redirect": {
                                    "transform": { "scheme": "https", "host": "smile.amazon.com" }
                                }
                            },
                            "condition": { "urlFilter": "*www.amazon.com*", "resourceTypes": ["main_frame"] }
                        }
                    ]
                })
                for (x = 2; x > 0; x--) {
                    chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => chrome.tabs.reload(tab[0].id));
                    console.log("reloading");
                }

            }
        }
    }

    else {
        if (ruleList === true) {
            chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [1] });
            for (x = 2; x > 0; x--) {
                chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => chrome.tabs.reload(tab[0].id));
                console.log("reloading");
            }
        }
        else {
            console.log("not found");
            chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [1] });
        }

    }
}

// check for cookie based on window type then send promise getting to cookieStatus
function getCookie(window) {
    if (window.incognito === true) {
        getting = chrome.cookies.get({ name: "sess-at-main", url: "https://www.amazon.com", storeId: "1" });
    }
    else {
        getting = chrome.cookies.get({ name: "sess-at-main", url: "https://www.amazon.com" });
    }
    getting.then(cookieStatus);
}

function ruleCheck(Rule) {
    if (Rule.length !== 0) {
        if (Rule[0].id === 1) {
            ruleList = true;
        }
    }
    else {
        ruleList = false
    }
}

// get current window to determine if private browsing
function getActiveWindow() {
    ruleList = false;
    chrome.declarativeNetRequest.getSessionRules().then(ruleCheck);
    gettingWindow = chrome.windows.getCurrent();
    gettingWindow.then(getCookie);
}

chrome.webNavigation.onBeforeNavigate.addListener(
    getActiveWindow,
    { url: [{ hostEquals: "www.amazon.com" }] }
)

chrome.webNavigation.onCommitted.addListener(
    getActiveWindow,
    { url: [{ hostEquals: "www.amazon.com" }] }
)
console.log("Bismillah")
// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    // Save all currently opened tabs
    saveOpenTabs();
});

// Function to save all currently opened tabs
function saveOpenTabs() {
    chrome.tabs.query({}, (tabs) => {
        const tabData = tabs.map((tab) => {
            return {
                title: tab.title,
                url: tab.url,
                tabId: tab.id,
            };
        });
        saveTabsToStorage(tabData);
    });
}
// Listener for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSavedTabs') {
        getSavedTabsFromStorage(sendResponse);
    } else if (request.action === 'saveTabs') {
        saveTabsToStorage(request.tabData, sendResponse);
    }
    return true; // Required for sendResponse to work asynchronously
});

// Function to retrieve saved tab data from storage
function getSavedTabsFromStorage(sendResponse) {
    chrome.storage.local.get('savedTabs', (result) => {
        const savedTabs = result.savedTabs || [];
        console.log("saved tabs", savedTabs)
        sendResponse({ tabData: savedTabs });
    });
}

// Listener for when a tab is closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // Update saved tab data after a tab is closed
    updateSavedTabsAfterClosure(tabId);
});

// Function to update saved tab data after a tab is closed
function updateSavedTabsAfterClosure(closedTabId) {
    chrome.storage.local.get('savedTabs', (result) => {
        const savedTabs = result.savedTabs || [];
        const updatedTabs = savedTabs.filter(tab => tab.tabId !== closedTabId);
        chrome.storage.local.set({ 'savedTabs': updatedTabs });
    });
}

// Function to save tab data to storage
function saveTabsToStorage(tabData, sendResponse) {
    chrome.storage.local.set({ 'savedTabs': tabData }, () => {
        sendResponse({ success: true });
    });
}

// Create a map to track whether a tab's URL has loaded
const tabsLoadingMap = {};

// Listener for when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
    // Mark the tab as loading
    tabsLoadingMap[tab.id] = true;
});

// Listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabsLoadingMap[tabId] && changeInfo.status === 'complete') {
        // Update saved tab data after a new tab is created and the URL is loaded
        updateSavedTabsOnNewTabCreation(tabId);

        // Remove the tab from the loading map
        delete tabsLoadingMap[tabId];
    }
});



// Function to update saved tab data after a new tab is created
function updateSavedTabsOnNewTabCreation(newTabId) {
    chrome.tabs.get(newTabId, (tab) => {
        if (tab) {
            const newTab = {
                tabId: tab.id,
                title: tab.title,
                url: tab.url,
            };
            chrome.storage.local.get('savedTabs', (result) => {
                const savedTabs = result.savedTabs || [];
                const updatedTabs = [...savedTabs, newTab];
                chrome.storage.local.set({ 'savedTabs': updatedTabs });
            });
        }
    });
}


// // Listener for when a tab's history state is updated
// chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
//     console.log(details)
//     // if (tabsLoadingMap[details.tabId]) {
//     // // Update saved tab data after the tab's URL changes
//     // updateSavedTabsOnURLChange(details.tabId, details.url);
//     // console.log(details.tabId, details.url)
//     // // Remove the tab from the loading map
//     // delete tabsLoadingMap[details.tabId];
//     // }
//     console.log(tabsLoadingMap[details.tabId])
//     if (tabsLoadingMap[details.tabId]) {
//         console.log("hello")
//         // Remove the tab from the loading map first
//         delete tabsLoadingMap[details.tabId];

//         // Update saved tab data after the tab's URL changes
//         updateSavedTabsOnURLChange(details.tabId, details.url);
//     }
// });



// // Function to update saved tab data after a tab's URL changes
// function updateSavedTabsOnURLChange(tabId, newUrl) {
//     console.log(tabId, newUrl)
//     chrome.tabs.get(tabId, (tab) => {
//         if (tab) {
//             const updatedTab = {
//                 tabId: tab.id,
//                 title: tab.title,
//                 url: newUrl, // Use the new URL from the event
//             };

//             chrome.storage.local.get('savedTabs', (result) => {
//                 const savedTabs = result.savedTabs || [];
//                 const updatedTabs = savedTabs.map((savedTab) => {
//                     if (savedTab.tabId === tabId) {
//                         return updatedTab;
//                     }
//                     return savedTab;
//                 });
//                 chrome.storage.local.set({ 'savedTabs': updatedTabs });
//             });
//         }
//     });
// }

// Listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // Update saved tab data after the tab's URL changes
        updateSavedTabsOnURLChange(tabId, changeInfo.url);
    }
});

// ... Existing code ...

// Function to update saved tab data after a tab's URL changes
function updateSavedTabsOnURLChange(tabId, newUrl) {
    console.log(tabId, newUrl);
    chrome.tabs.get(tabId, (tab) => {
        if (tab) {
            const updatedTab = {
                tabId: tab.id,
                title: tab.title,
                url: newUrl, // Use the new URL from the event
            };

            chrome.storage.local.get('savedTabs', (result) => {
                const savedTabs = result.savedTabs || [];
                const updatedTabs = savedTabs.map((savedTab) => {
                    if (savedTab.tabId === tabId) {
                        return updatedTab;
                    }
                    return savedTab;
                });
                chrome.storage.local.set({ 'savedTabs': updatedTabs });
            });
        }
    });
}
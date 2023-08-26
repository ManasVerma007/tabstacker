// popup.js
// Create a set to keep track of displayed URLs
const displayedUrls = new Set();
// Fetch saved tab data from storage
chrome.runtime.sendMessage({ action: 'getSavedTabs' }, (response) => {
    console.log("response", response);
    if (response && Array.isArray(response.tabData) && response.tabData.length > 0) {
        displaySavedTabs(response.tabData);
    } else {
        console.error('Error fetching saved tab data or no data available.');
    }
});

// Function to display saved tab data
async function displaySavedTabs(tabData) {
    const tabList = document.getElementById('tabList');
    tabList.innerHTML = '';
    console.log(tabData);
    // Remove URLs from displayedUrls that are not present in tabData
    displayedUrls.forEach(url => {
        if (!tabData.some(tab => tab.url === url)) {
            displayedUrls.delete(url);
        }
    });
    if (tabData.length === 1 && tabData[0].url === 'chrome://newtab/') {
        // Display a message when there are no tabs
        const noTabsMessage = document.createElement('li');
        noTabsMessage.textContent = 'No tabs to show';
        tabList.appendChild(noTabsMessage);
    } else {
        for (const tab of tabData) {
            // Exclude tabs with "chrome://newtab/" URL
            if (tab.url !== 'chrome://newtab/') {
                // Check if the URL has already been displayed
                if (!displayedUrls.has(tab.url)) {
                    const tabItem = document.createElement('li');

                    // Create an image element for the favicon
                    const faviconImg = document.createElement('img');
                    faviconImg.src = await getFaviconUrl(tab.url);
                    faviconImg.classList.add('favicon');
                    tabItem.appendChild(faviconImg);

                    // Create a span element for the tab information
                    const tabInfoSpan = document.createElement('span');
                    // Create an anchor tag within the span
                    const tabLink = document.createElement('a');
                    tabLink.href = tab.url; // Set the URL as the href attribute
                    tabLink.textContent = tab.title;
                    tabInfoSpan.appendChild(tabLink);
                    tabLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        console.log("Hello");
                        activateTabByURL(tab.url); // Activate the tab with the specified URL
                    });
                    // Create a close icon element
                    const closeIcon = document.createElement('img');
                    closeIcon.src = 'close-icon.svg';
                    closeIcon.classList.add('close-icon');
                    closeIcon.addEventListener('click', () => {
                        closeTab(tab.tabId);
                    });

                    // Append the close icon to the tab info span
                    tabInfoSpan.appendChild(closeIcon);
                    tabItem.appendChild(tabInfoSpan);

                    tabList.appendChild(tabItem);

                    // Add the URL to the displayed set
                    displayedUrls.add(tab.url);
                }
            }
        }
    }
}

// Function to close a tab
function closeTab(tabId) {
    chrome.tabs.remove(tabId);
    // Request a reload of the popup to update the list
    chrome.runtime.sendMessage({ action: 'reloadPopup' });
    location.reload();

}
// Function to activate a tab by its URL
function activateTabByURL(url) {
    chrome.tabs.query({}, (tabs) => {
        const matchingTab = tabs.find((tab) => tab.url === url);
        if (matchingTab) {
            chrome.tabs.update(matchingTab.id, { active: true }); // Activate the matching tab
        }
        // else {
        //     console.log("hello")
        //     chrome.tabs.create({ url }); // Open a new tab with the specified URL
        // }
    });
}
// Function to fetch the favicon URL for a given URL
async function getFaviconUrl(url) {
    const response = await fetch(`https://www.google.com/s2/favicons?domain=${url}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
// Listener to update the displayed tab list
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateTabList' && Array.isArray(message.tabData)) {
        // location.reload();
        displaySavedTabs(message.tabData);
        console.log("hello")
    }
});


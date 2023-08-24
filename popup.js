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
    console.log(tabData);

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
                    event.preventDefault(); // Prevent the default link behavior
                    activateTabByURL(tab.url); // Activate the tab with the specified URL
                });
                tabItem.appendChild(tabInfoSpan);

                tabList.appendChild(tabItem);

                // Add the URL to the displayed set
                displayedUrls.add(tab.url);
            }
        }
    }
}
// Function to activate a tab by its URL
function activateTabByURL(url) {
    chrome.tabs.query({}, (tabs) => {
        const matchingTab = tabs.find((tab) => tab.url === url);
        if (matchingTab) {
            chrome.tabs.update(matchingTab.id, { active: true }); // Activate the matching tab
        }
    });
}
// Function to fetch the favicon URL for a given URL
async function getFaviconUrl(url) {
    const response = await fetch(`https://www.google.com/s2/favicons?domain=${url}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
// popup.js
console.log("object")


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
function displaySavedTabs(tabData) {
    const tabList = document.getElementById('tabList');
    console.log(tabData);
    tabData.forEach((tab) => {
        const tabItem = document.createElement('li');
        tabItem.textContent = `${tab.title} - ${tab.url}`;
        tabList.appendChild(tabItem);
    });
}
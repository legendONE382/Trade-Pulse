// TradePulse Chrome Extension Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('TradePulse extension installed');
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    chrome.storage.local.get(['tradepulse_sales', 'tradepulse_expenses'], (result) => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === 'syncData') {
    // Sync data between extension and web app
    chrome.storage.local.set(request.data, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Open the app when clicking the extension icon
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

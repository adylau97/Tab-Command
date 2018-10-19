function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({})
  .then((tabs) => {
    let length = tabs.length;
    
    if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
      length--;
    }

    browser.browserAction.setBadgeText({text: length.toString()});
    if (length > 10) {
      browser.browserAction.setBadgeBackgroundColor({'color': 'red'});
    } else if(length > 4) {
      browser.browserAction.setBadgeBackgroundColor({'color': 'orange'});
    }else{
      browser.browserAction.setBadgeBackgroundColor({'color': 'green'});
    }
  });
}


browser.tabs.onRemoved.addListener(
  (tabId) => { updateCount(tabId, true);
});
browser.tabs.onCreated.addListener(
  (tabId) => { updateCount(tabId, false);
});
updateCount();

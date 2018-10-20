//Update the count of tabs being opened
function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({})
  .then((tabs) => {
    //Length of the tabs
    let length = tabs.length;
    
    //If tabs is removed then remove length counter by 1
    if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
      length--;
    }

    //Set the number of the tabs being opened
    browser.browserAction.setBadgeText({text: length.toString()});
    //If more than 10 tabs is opened 
    if (length > 10) {
      browser.browserAction.setBadgeBackgroundColor({'color': 'red'});
      //If more than 4 tabs is opened 
    } else if(length > 4) {
      browser.browserAction.setBadgeBackgroundColor({'color': 'orange'});
    }else{
      browser.browserAction.setBadgeBackgroundColor({'color': 'green'});
    }
  });
}

//Listener for tabs being removed
browser.tabs.onRemoved.addListener(
  (tabId) => { updateCount(tabId, true);
});
//Listener for tabs being created
browser.tabs.onCreated.addListener(
  (tabId) => { updateCount(tabId, false);
});

//Initialize count of the tabs from the background
updateCount();

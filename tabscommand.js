// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;

function firstUnpinnedTab(tabs) {
  for (var tab of tabs) {
    if (!tab.pinned) {
      return tab.index;
    }
  }
}

//List all the tabs to switch to
function listTabs() {
  getCurrentWindowTabs().then((tabs) => {
    let tabsList = document.getElementById('tabs-list');
    let currentTabs = document.createDocumentFragment();

    tabsList.textContent = '';

    for (let tab of tabs) {
      if (!tab.active) {
        let tabLink = document.createElement('a');

        tabLink.textContent = tab.title || tab.id;
        tabLink.setAttribute('href', tab.id);
        tabLink.classList.add('switch-tabs');
        currentTabs.appendChild(tabLink);
      }
    }

    tabsList.appendChild(currentTabs);
  });
}

document.addEventListener("DOMContentLoaded", listTabs);

//Gey currect active tab that is being opened
function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}

//Add listener of which operation is being clicked
document.addEventListener("click", (e) => {
  function callOnActiveTab(callback) {
    getCurrentWindowTabs().then((tabs) => {
      for (var tab of tabs) {
        if (tab.active) {
          callback(tab, tabs);
        }
      }
    });
}
  //If operation is move tab to the front
  if (e.target.id === "tabs-move-beginning") {
    callOnActiveTab((tab, tabs) => {
      var index = 0;
      if (!tab.pinned) {
        index = firstUnpinnedTab(tabs);
      }
      console.log(`moving ${tab.id} to ${index}`)
      browser.tabs.move([tab.id], {index});
    });
  }
 //If operation is move tab to the end
  else if (e.target.id === "tabs-move-end") {
    callOnActiveTab((tab, tabs) => {
      var index = -1;
      if (tab.pinned) {
        var lastPinnedTab = Math.max(0, firstUnpinnedTab(tabs) - 1);
        index = lastPinnedTab;
      }
      browser.tabs.move([tab.id], {index});
    });
  }
 //If operation is duplicate tab
  else if (e.target.id === "tabs-duplicate") {
    callOnActiveTab((tab) => {
      browser.tabs.duplicate(tab.id);
      listTabs();
    });
  }
 //If operation is refresh tab
  else if (e.target.id === "tabs-reload") {
    callOnActiveTab((tab) => {
      browser.tabs.reload(tab.id);
    });
  }
  //If operation is remove tab
  else if (e.target.id === "tabs-remove") {
    callOnActiveTab((tab) => {
      browser.tabs.remove(tab.id);
    });
  }
  //If operation is create tab 
  else if (e.target.id === "tabs-create") {
    browser.tabs.create({url:"https://google.com"});
  }
//If operation is convert tab to reader mode
  else if (e.target.id === "tabs-convert-reader") {
    callOnActiveTab((tab)=>{
      if(tab.isArticle){
        browser.tabs.toggleReaderMode();

        //If the tab is reader mode
      }else if(tab.isInReaderMode){
        alert("This tab is in reader mode!");

        //If the tab is not an article
      }else{
        alert("This tab is not an article!");
      }
    });
  }

  //If operation is show tab info
  else if (e.target.id === "tabs-alertinfo") {
    callOnActiveTab((tab) => {
      let props = "";
      for (let item in tab) {
        props += `${ item } = ${ tab[item] } \n`;
      }
      alert(props);
    });
  }

  //If operation is zoom in tab
  else if (e.target.id === "tabs-add-zoom") {
    callOnActiveTab((tab) => {
      var gettingZoom = browser.tabs.getZoom(tab.id);
      gettingZoom.then((zoomFactor) => {
        //the maximum zoomFactor is 3, it can't go higher
        if (zoomFactor >= MAX_ZOOM) {
          alert("The page can't be maximized any further!");
        } else {
          var newZoomFactor = zoomFactor + ZOOM_INCREMENT;
          //if the newZoomFactor is set to higher than the max accepted
          //it won't change, and will never alert that it's at maximum
          newZoomFactor = newZoomFactor > MAX_ZOOM ? MAX_ZOOM : newZoomFactor;
          browser.tabs.setZoom(tab.id, newZoomFactor);
        }
      });
    });
  }
//If operation is zoom out tab
  else if (e.target.id === "tabs-decrease-zoom") {
    callOnActiveTab((tab) => {
      var gettingZoom = browser.tabs.getZoom(tab.id);
      gettingZoom.then((zoomFactor) => {
        //the minimum zoomFactor is 0.3, it can't go lower
        if (zoomFactor <= MIN_ZOOM) {
          alert("The page can't be minimize any further!");
        } else {
          var newZoomFactor = zoomFactor - ZOOM_INCREMENT;
          //if the newZoomFactor is set to lower than the min accepted
          //it won't change, and will never alert that it's at minimum
          newZoomFactor = newZoomFactor < MIN_ZOOM ? MIN_ZOOM : newZoomFactor;
          browser.tabs.setZoom(tab.id, newZoomFactor);
        }
      });
    });
  }
//If operation is reset zoom of the tab
  else if (e.target.id === "tabs-default-zoom") {
    callOnActiveTab((tab) => {
      var gettingZoom = browser.tabs.getZoom(tab.id);
      gettingZoom.then((zoomFactor) => {
        if (zoomFactor == DEFAULT_ZOOM) {
          alert("The page is already at default zoom level!");
        } else {
          browser.tabs.setZoom(tab.id, DEFAULT_ZOOM);
        }
      });
    });
  }

  //Show list of the tab being opened and ability to switch between tabs
  else if (e.target.classList.contains('switch-tabs')) {
    var tabId = +e.target.getAttribute('href');
    browser.tabs.query({
      currentWindow: true
    }).then((tabs) => {
      for (var tab of tabs) {
        if (tab.id === tabId) {
          browser.tabs.update(tabId, {
              active: true
          });
          listTabs();
        }
      }
    });
  }

  listTabs();
  e.preventDefault();
 
});

//onRemoved listener. fired when tab is removed
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log(`The tab with id: ${tabId}, is closing`);

  if(removeInfo.isWindowClosing) {
    console.log(`Its window is also closing.`);
  } else {
    console.log(`Its window is not closing`);
  }
  listTabs();
});

//onMoved listener. fired when tab is moved into the same window
browser.tabs.onMoved.addListener((tabId, moveInfo) => {
  var startIndex = moveInfo.fromIndex;
  var endIndex = moveInfo.toIndex;
  console.log(`Tab with id: ${tabId} moved from index: ${startIndex} to index: ${endIndex}`);
  listTabs();
});

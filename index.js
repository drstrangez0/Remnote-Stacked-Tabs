let tabs = []; // Store open tabs as an array of { id, title }
let currentTabIndex = 0; // Track the active tab index

remnote.on("activate", async () => {
  console.log("Stacked Tabs Plugin Activated");

  // Attach event listener for Shift + Mouse Wheel
  window.addEventListener("wheel", handleMouseWheel, { passive: false });

  // Automatically add a tab when opening a document
  remnote.on("document-open", async (remId) => {
    if (!tabs.some((tab) => tab.id === remId)) {
      const rem = await remnote.getRemById(remId);
      if (rem) {
        tabs.push({ id: remId, title: rem.name || "Untitled" });
        currentTabIndex = tabs.length - 1; // Activate the newly opened tab
        renderTabs();
      }
    }
  });

  renderTabs();
});

// Handle Shift + Mouse Wheel for tab navigation
async function handleMouseWheel(event) {
  if (event.shiftKey) {
    event.preventDefault(); // Prevent default scroll behavior

    // Determine the scroll direction
    if (event.deltaY > 0) {
      // Scroll down (next tab)
      currentTabIndex = (currentTabIndex + 1) % tabs.length;
    } else {
      // Scroll up (previous tab)
      currentTabIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
    }

    // Activate the selected tab
    const nextTabId = tabs[currentTabIndex].id;
    if (nextTabId) {
      await remnote.openRem(nextTabId);
      highlightActiveTab();
    }
  }
}

// Render the tabs UI
async function renderTabs() {
  const containerId = "stacked-tabs-container";

  // Remove existing container
  const existingContainer = document.getElementById(containerId);
  if (existingContainer) {
    existingContainer.remove();
  }

  // Create a new container
  const container = document.createElement("div");
  container.id = containerId;
  container.className = "stacked-tabs";

  // Add tabs to the container
  tabs.forEach((tab, index) => {
    const tabElement = document.createElement("div");
    tabElement.className = "tab";
    tabElement.innerText = tab.title;

    // Highlight the active tab
    if (index === currentTabIndex) {
      tabElement.classList.add("active-tab");
    }

    // Tab click handler
    tabElement.onclick = async () => {
      currentTabIndex = index;
      await remnote.openRem(tab.id);
      highlightActiveTab();
    };

    // Add a close button to each tab
    const closeButton = document.createElement("span");
    closeButton.className = "close-button";
    closeButton.innerText = "×";
    closeButton.onclick = (e) => {
      e.stopPropagation(); // Prevent triggering tab click
      closeTab(index);
    };

    tabElement.appendChild(closeButton);
    container.appendChild(tabElement);
  });

  // Add the container to the RemNote UI
  document.body.appendChild(container);
}

// Close a tab by index
function closeTab(index) {
  tabs.splice(index, 1);
  if (currentTabIndex >= tabs.length) {
    currentTabIndex = tabs.length - 1; // Adjust the active tab index
  }
  renderTabs();
}

// Highlight the active tab in the UI
function highlightActiveTab() {
  const tabElements = document.querySelectorAll(".stacked-tabs .tab");
  tabElements.forEach((tab, index) => {
    if (index === currentTabIndex) {
      tab.classList.add("active-tab");
    } else {
      tab.classList.remove("active-tab");
    }
  });
}

remnote.on("deactivate", async () => {
  console.log("Stacked Tabs Plugin Deactivated");
  window.removeEventListener("wheel", handleMouseWheel); // Clean up event listener
  document.getElementById("stacked-tabs-container")?.remove();
});

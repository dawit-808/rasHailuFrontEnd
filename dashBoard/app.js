// src/app.js
import { elements } from "./modules/dom.js";
import { initializeFilters, applyFilters } from "./modules/filters.js";
import { setupFormEventListeners, membersCollector } from "./modules/form.js";
import {
  watchMembers,
  togglePaymentStatus,
  deleteMember,
} from "./modules/firebase.js";
import { toggleFormDisplay, highlightAndScrollToMember } from "./modules/ui.js";
import { initializeAuth, setupLogout } from "./modules/auth.js";

// Initialize application
function initApp() {
  initializeAuth();
  setupLogout();
  initializeFilters();
  setupEventListeners();
  applyFilters();
  watchMembers(applyFilters);
}

// Setup all event listeners
function setupEventListeners() {
  setupFormEventListeners();

  if (elements.search) {
    elements.search.addEventListener("keyup", (e) => {
      if (e.key === "Enter") searchMembers();
    });
  }

  // Statistics collapsible sections
  document.querySelectorAll(".collapse").forEach((collapse) => {
    collapse.addEventListener("shown.bs.collapse", function () {
      const arrowIcon =
        this.previousElementSibling.querySelector(".arrow-icon");
      arrowIcon?.classList.add("rotate-arrow");
    });

    collapse.addEventListener("hidden.bs.collapse", function () {
      const arrowIcon =
        this.previousElementSibling.querySelector(".arrow-icon");
      arrowIcon?.classList.remove("rotate-arrow");
    });
  });
}

async function searchMembers() {
  const searchQuery = elements.search.value.trim();
  if (!searchQuery) {
    alert("Please enter a member ID to search.");
    return;
  }

  try {
    highlightAndScrollToMember(searchQuery);
  } catch (error) {
    console.error("Search error:", error);
    alert("No member found with that ID.");
  }
}

// Initialize when window loads
window.onload = initApp;

// Expose functions to global scope
window.membersCollector = membersCollector;
window.togglePaymentStatus = togglePaymentStatus;
window.deleteMember = deleteMember;
window.toggleFormDisplay = toggleFormDisplay;
window.searchMembers = searchMembers;

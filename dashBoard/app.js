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
import { setupCameraControls } from "./modules/camera.js";

// Function to download Excel file
function downloadExcel() {
  const table = document.getElementById("member-list");
  if (!table) {
    alert("Member list table not found!");
    return;
  }

  // Prepare array of objects for Excel
  const rows = [];
  // Iterate over table rows (skip the header row)
  const trs = table.querySelectorAll("tr");

  // Header columns for Excel
  rows.push([
    "Member ID",
    "Name",
    "Father Name",
    "Training Type",
    "Training Schedule",
  ]);

  trs.forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    if (tds.length === 9) {
      // row with member data
      const memberId = tds[1].innerText.trim();
      const name = tds[2].innerText.trim();
      const fatherName = tds[3].innerText.trim();
      const trainingType = tds[4].innerText.trim();
      const trainingSchedule = tds[5].innerText.trim();

      rows.push([memberId, name, fatherName, trainingType, trainingSchedule]);
    }
  });

  // Create worksheet and workbook
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");

  // Export to Excel file
  XLSX.writeFile(wb, "RasHailuGym_Members.xlsx");
}
// Initialize application
function initApp() {
  initializeAuth();
  setupLogout();
  initializeFilters();
  setupEventListeners();
  applyFilters();
  watchMembers(applyFilters);

  // Setup camera capture UI and logic
  setupCameraControls({
    startCameraBtnId: "startCameraBtn",
    captureBtnId: "captureBtn",
    cancelCameraBtnId: "cancelCameraBtn",
    videoPreviewId: "videoPreview",
    imageUploadInputId: "imageUploadInput",
    imageUrlInputId: "imageUrlInput",
  });
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
window.downloadExcel = downloadExcel;

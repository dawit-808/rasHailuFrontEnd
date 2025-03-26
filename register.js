import {
  db,
  ref,
  set,
  get,
  onValue,
  update,
  remove,
  onAuthStateChanged,
  auth,
  signOut,
} from "./firebase.js";

// DOM Elements
const elements = {
  filters: {
    payment: document.getElementById("paymentFilter"),
    trainingType: document.getElementById("trainingTypeFilter"),
    timeOfDay: document.getElementById("timeOfDayFilter"), // NEW
    days: document.getElementById("daysFilter"), // NEW
    clear: document.getElementById("clearFilters"),
    loader: document.getElementById("filterLoader"),
  },
  form: {
    name: document.getElementById("name"),
    fname: document.getElementById("fname"),
    memberId: document.getElementById("memberIdInput"),
    imageUpload: document.getElementById("imageUploadInput"),
    imageUrl: document.getElementById("imageUrlInput"),
    form: document.getElementById("registration-form"),
    trainingType: document.querySelectorAll("input[name='trainingType']"),
    trainingTime: document.querySelectorAll("input[name='trainingTime']"),
  },
  list: document.getElementById("member-list"),
  search: document.getElementById("search-input"),
  stats: {
    total: document.querySelector(".js-total-members"),
    paid: document.querySelector(".js-paid-members"),
    warning: document.querySelector(".js-warning-members"),
    unpaid: document.querySelector(".js-unpaid-members"),
    aerobics: document.querySelector(".js-aerobics-members"),
    machine: document.querySelector(".js-machine-members"),
    both: document.querySelector(".js-both-members"),
    morningMWF: document.querySelector(".js-morning-mwf-members"),
    nightMWF: document.querySelector(".js-night-mwf-members"),
    morningTTS: document.querySelector(".js-morning-tts-members"),
    nightTTS: document.querySelector(".js-night-tts-members"),
  },
};

// Initialize application
function initApp() {
  initializeFilters();
  setupEventListeners();
  applyFilters();
  watchMembers();
}

// Set up event listeners
function setupEventListeners() {
  // Image upload handling
  if (elements.form.imageUpload) {
    elements.form.imageUpload.addEventListener("change", handleImageUpload);
  }

  // Search functionality
  if (elements.search) {
    elements.search.addEventListener("keyup", (e) => {
      if (e.key === "Enter") searchMembers();
    });
  }
}

// Initialize filters
function initializeFilters() {
  if (elements.filters.payment) {
    elements.filters.payment.addEventListener("change", applyFilters);
  }
  if (elements.filters.trainingType) {
    elements.filters.trainingType.addEventListener("change", applyFilters);
  }
  if (elements.filters.timeOfDay) {
    // NEW
    elements.filters.timeOfDay.addEventListener("change", applyFilters);
  }
  if (elements.filters.days) {
    // NEW
    elements.filters.days.addEventListener("change", applyFilters);
  }
  if (elements.filters.clear) {
    elements.filters.clear.addEventListener("click", clearAllFilters);
  }
}

// Clear all filters
function clearAllFilters() {
  elements.filters.payment.value = "all";
  elements.filters.trainingType.value = "all";
  elements.filters.timeOfDay.value = "all"; // NEW
  elements.filters.days.value = "all"; // NEW
  applyFilters();
}

// Apply filters to member list
async function applyFilters() {
  toggleLoader(true);

  try {
    const snapshot = await get(ref(db, "members"));
    if (!snapshot.exists()) {
      displayList([]);
      return;
    }

    const members = Object.values(snapshot.val());
    const filteredMembers = filterMembers(members);
    displayList(filteredMembers);
  } catch (error) {
    console.error("Filter error:", error);
    alert("Error applying filters. Please try again.");
  } finally {
    toggleLoader(false);
  }
}

// Filter members based on current filter values
function filterMembers(members) {
  const paymentStatus = elements.filters.payment.value;
  const trainingType = elements.filters.trainingType.value;
  const timeOfDay = elements.filters.timeOfDay.value; // NEW
  const days = elements.filters.days.value; // NEW

  return members.filter((member) => {
    if (!member) return false;

    // Payment status filter
    const paymentMatch =
      paymentStatus === "all" || member.paymentStatus === paymentStatus;

    // Training type filter
    const typeMatch =
      trainingType === "all" ||
      (member.trainingType &&
        (Array.isArray(member.trainingType)
          ? member.trainingType.includes(trainingType)
          : member.trainingType === trainingType));

    // Training time filter (Splitting into two)
    const timeMatch =
      timeOfDay === "all" ||
      (member.trainingTime &&
        (Array.isArray(member.trainingTime)
          ? member.trainingTime.some((time) => time.includes(timeOfDay))
          : member.trainingTime.includes(timeOfDay)));

    const daysMatch =
      days === "all" ||
      (member.trainingTime &&
        (Array.isArray(member.trainingTime)
          ? member.trainingTime.some((time) => time.includes(days))
          : member.trainingTime.includes(days)));

    return paymentMatch && typeMatch && timeMatch && daysMatch;
  });
}

// Toggle loader visibility
function toggleLoader(show) {
  if (elements.filters.loader) {
    elements.filters.loader.style.display = show ? "block" : "none";
  }
}

// Search members by ID
async function searchMembers() {
  const searchQuery = elements.search.value.trim();
  if (!searchQuery) {
    alert("Please enter a member ID to search.");
    return;
  }

  try {
    const snapshot = await get(ref(db, `members/${searchQuery}`));
    if (snapshot.exists()) {
      highlightAndScrollToMember(searchQuery);
    } else {
      alert("No member found with that ID.");
    }
  } catch (error) {
    console.error("Search error:", error);
  }
}

// Highlight and scroll to member in list
function highlightAndScrollToMember(memberId) {
  const rows = document.querySelectorAll(".js-list tr");
  let found = false;

  rows.forEach((row) => {
    row.classList.remove("highlighted-row");
    const rowMemberId = row.querySelector("td:nth-child(2)").textContent;
    if (rowMemberId === memberId) {
      row.classList.add("highlighted-row");
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      found = true;
    }
  });

  if (!found) {
    console.error("Member not found in current list");
  }
}

// Handle image upload
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const imageUrl = await uploadImageToCloudinary(file);
    if (imageUrl) {
      elements.form.imageUrl.value = imageUrl;
    } else {
      alert("Failed to upload image. Please try again.");
    }
  } catch (error) {
    console.error("Upload error:", error);
  }
}

// Upload image to Cloudinary
async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ras-hailu");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dg5utf0tj/image/upload",
    { method: "POST", body: formData }
  );

  const data = await response.json();
  return data.secure_url || null;
}

// Register new member
async function membersCollector() {
  const memberData = getFormData();
  if (!validateMemberData(memberData)) return;

  try {
    await registerMember(memberData);
    resetForm();
    alert("Member registered successfully!");
  } catch (error) {
    console.error("Registration error:", error);
    alert("Failed to register member. Please try again.");
  }
}

// Get form data
function getFormData() {
  return {
    name: elements.form.name?.value.trim(),
    fname: elements.form.fname?.value.trim(),
    id: elements.form.memberId?.value.trim(),
    imageUrl: elements.form.imageUrl.value.trim(),
    trainingType: Array.from(elements.form.trainingType)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value),
    trainingTime: Array.from(elements.form.trainingTime)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value),
  };
}

// Validate member data
function validateMemberData(data) {
  if (!data.name) return alert("Please enter a name.");
  if (!data.fname) return alert("Please enter a father's name.");
  if (!data.id) return alert("Please enter a member ID.");
  if (!data.imageUrl) return alert("Please upload an image.");
  if (data.trainingType.length === 0)
    return alert("Please select at least one training type.");
  if (data.trainingTime.length === 0)
    return alert("Please select at least one training time.");
  return true;
}

// Register member in Firebase
async function registerMember(member) {
  const memberRef = ref(db, `members/${member.id.replace(/\//g, "-")}`);
  await set(memberRef, {
    ...member,
    paymentStatus: "Unpaid",
    paymentTimestamp: null,
    paymentHistory: {},
  });
}

// Reset registration form
function resetForm() {
  elements.form.name.value = "";
  elements.form.fname.value = "";
  elements.form.memberId.value = "";
  elements.form.imageUpload.value = "";
  elements.form.imageUrl.value = "";
  elements.form.trainingType.forEach((checkbox) => (checkbox.checked = false));
  elements.form.trainingTime.forEach((checkbox) => (checkbox.checked = false));
}

// Display members list
function displayList(members = null) {
  if (!elements.list) return;

  if (members === null) {
    fetchAndDisplayMembers();
  } else {
    renderMembersList(members);
  }
}

// Fetch and display members from Firebase
async function fetchAndDisplayMembers() {
  try {
    const snapshot = await get(ref(db, "members"));
    if (snapshot.exists()) {
      renderMembersList(Object.values(snapshot.val()));
    } else {
      renderMembersList([]);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// Render members list
function renderMembersList(members) {
  const validMembers = members
    .filter((member) => member && typeof member === "object")
    .sort((a, b) => a.name?.localeCompare(b.name));

  const html =
    validMembers.length > 0
      ? validMembers
          .map((member, index) => createMemberRow(member, index))
          .join("")
      : "<tr><td colspan='9'>No members found</td></tr>";

  elements.list.innerHTML = html;
  updateStatistics();
}

// Create HTML row for a member
function createMemberRow(member, index) {
  const lastPayment = member.paymentTimestamp
    ? new Date(member.paymentTimestamp).toLocaleDateString()
    : "No Payment";

  const paymentStatusClass =
    member.paymentStatus === "Paid"
      ? "paid"
      : member.paymentStatus === "Warning"
      ? "warning"
      : "not-paid";

  // Handle trainingType (could be array or string)
  const trainingTypeDisplay = member.trainingType
    ? Array.isArray(member.trainingType)
      ? member.trainingType.join(", ")
      : member.trainingType
    : "N/A";

  // Handle trainingTime (could be array or string)
  const trainingTimeDisplay = member.trainingTime
    ? Array.isArray(member.trainingTime)
      ? member.trainingTime.join("<br>")
      : member.trainingTime
    : "N/A";

  return `
    <tr>
      <td>${index + 1}</td>
      <td>${member.id}</td>
      <td><a target="_blank" href="member-details.html?id=${member.id.replace(
        /\//g,
        "-"
      )}">${member.name}</a></td>
      <td>${member.fname}</td>
      <td>${trainingTypeDisplay}</td>
      <td>${trainingTimeDisplay}</td>
      <td>
        <button onclick="togglePaymentStatus('${member.id.replace(
          /\//g,
          "-"
        )}', '${member.paymentStatus}')"
          class="js-payment payment-status ${paymentStatusClass}">
          ${member.paymentStatus}
        </button>
      </td>
      <td>
        <a href="payment-history.html?id=${member.id.replace(
          /\//g,
          "-"
        )}" class="payment-history-link">
          ${lastPayment}
        </a>
      </td>
      <td>
        <button class="delete-btn" onclick="deleteItem('${member.id.replace(
          /\//g,
          "-"
        )}')">Delete</button>
      </td>
    </tr>`;
}

// Update statistics
async function updateStatistics() {
  try {
    const snapshot = await get(ref(db, "members"));
    if (!snapshot.exists()) return;

    const members = Object.values(snapshot.val());
    const validMembers = members.filter(
      (member) => member && typeof member === "object"
    );

    updatePaymentStatistics(validMembers);
    updateTrainingStatistics(validMembers);
  } catch (error) {
    console.error("Stats error:", error);
  }
}

// Update payment statistics
function updatePaymentStatistics(members) {
  const total = members.length;
  const paid = members.filter((m) => m.paymentStatus === "Paid").length;
  const warning = members.filter((m) => m.paymentStatus === "Warning").length;
  const unpaid = total - paid - warning;

  if (elements.stats.total) elements.stats.total.textContent = total;
  if (elements.stats.paid) elements.stats.paid.textContent = paid;
  if (elements.stats.warning) elements.stats.warning.textContent = warning;
  if (elements.stats.unpaid) elements.stats.unpaid.textContent = unpaid;
}

// Update training statistics
function updateTrainingStatistics(members) {
  // Training types
  if (elements.stats.aerobics)
    elements.stats.aerobics.textContent = members.filter(
      (m) =>
        m.trainingType &&
        (Array.isArray(m.trainingType)
          ? m.trainingType.includes("Aerobics")
          : m.trainingType === "Aerobics")
    ).length;

  if (elements.stats.machine)
    elements.stats.machine.textContent = members.filter(
      (m) =>
        m.trainingType &&
        (Array.isArray(m.trainingType)
          ? m.trainingType.includes("Machine")
          : m.trainingType === "Machine")
    ).length;

  if (elements.stats.both)
    elements.stats.both.textContent = members.filter(
      (m) =>
        m.trainingType &&
        (Array.isArray(m.trainingType)
          ? m.trainingType.includes("Both")
          : m.trainingType === "Both")
    ).length;

  // Training times
  if (elements.stats.morningMWF)
    elements.stats.morningMWF.textContent = members.filter(
      (m) =>
        m.trainingTime &&
        (Array.isArray(m.trainingTime)
          ? m.trainingTime.some((t) => t.includes("MWF: Morning"))
          : m.trainingTime.includes("MWF: Morning"))
    ).length;
  if (elements.stats.nightMWF)
    elements.stats.nightMWF.textContent = members.filter(
      (m) =>
        m.trainingTime &&
        (Array.isArray(m.trainingTime)
          ? m.trainingTime.some((t) => t.includes("MWF: Night"))
          : m.trainingTime.includes("MWF: Night"))
    ).length;
  if (elements.stats.morningTTS)
    elements.stats.morningTTS.textContent = members.filter(
      (m) =>
        m.trainingTime &&
        (Array.isArray(m.trainingTime)
          ? m.trainingTime.some((t) => t.includes("TTS: Morning"))
          : m.trainingTime.includes("TTS: Morning"))
    ).length;
  if (elements.stats.nightTTS)
    elements.stats.nightTTS.textContent = members.filter(
      (m) =>
        m.trainingTime &&
        (Array.isArray(m.trainingTime)
          ? m.trainingTime.some((t) => t.includes("TTS: Night"))
          : m.trainingTime.includes("TTS: Night"))
    ).length;

  // ... (similar updates for other time statistics)
}

// Toggle payment status
async function togglePaymentStatus(id, currentStatus) {
  if (
    !confirm(currentStatus === "Unpaid" ? "Mark as Paid?" : "Mark as Unpaid?")
  )
    return;

  try {
    const newStatus =
      currentStatus === "Unpaid" || currentStatus === "Warning"
        ? "Paid"
        : "Unpaid";
    const paymentTimestamp = Date.now();

    await update(ref(db, `members/${id}`), {
      paymentStatus: newStatus,
      paymentTimestamp,
    });

    await set(ref(db, `members/${id}/paymentHistory/${paymentTimestamp}`), {
      timestamp: paymentTimestamp,
    });
  } catch (error) {
    console.error("Payment error:", error);
  }
}

// Delete member
async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this member?")) return;

  try {
    await set(ref(db, `members/${id}`), null);
  } catch (error) {
    console.error("Delete error:", error);
  }
}

// Watch for real-time updates
function watchMembers() {
  onValue(ref(db, "members"), (snapshot) => {
    if (snapshot.exists()) {
      applyFilters();
    }
  });
}

// Toggle form display
function toggleFormDisplay() {
  const form = document.querySelector(".js-form-display");
  if (form) form.classList.toggle("form-display-none");
}

// security
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.body.style.display = "block";
  } else {
    window.location.href = "index.html";
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.clear(); // Clear any stored user info
    sessionStorage.clear(); // Clear session data
    window.location.href = "index.html"; // Redirect to login page
  } catch (error) {
    console.error("Logout failed:", error);
  }
});

// statistics toggler
document.addEventListener("DOMContentLoaded", function () {
  // Select all collapsible elements
  document.querySelectorAll(".collapse").forEach((collapse) => {
    collapse.addEventListener("shown.bs.collapse", function () {
      let arrowIcon = this.previousElementSibling.querySelector(".arrow-icon");
      arrowIcon.classList.add("rotate-arrow"); // Rotate arrow down when expanded
    });

    collapse.addEventListener("hidden.bs.collapse", function () {
      let arrowIcon = this.previousElementSibling.querySelector(".arrow-icon");
      arrowIcon.classList.remove("rotate-arrow"); // Reset rotation when collapsed
    });
  });
});

// Initialize when window loads
window.onload = initApp;

// Expose functions to global scope
window.membersCollector = membersCollector;
window.togglePaymentStatus = togglePaymentStatus;
window.deleteItem = deleteItem;
window.toggleFormDisplay = toggleFormDisplay;
window.searchMembers = searchMembers;

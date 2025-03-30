// src/modules/filters.js
import { elements } from "./dom.js";
import { getMembers } from "./firebase.js";
import { renderMembersList } from "./ui.js";

export function initializeFilters() {
  if (elements.filters.payment) {
    elements.filters.payment.addEventListener("change", applyFilters);
  }
  if (elements.filters.trainingType) {
    elements.filters.trainingType.addEventListener("change", applyFilters);
  }
  if (elements.filters.timeOfDay) {
    elements.filters.timeOfDay.addEventListener("change", applyFilters);
  }
  if (elements.filters.days) {
    elements.filters.days.addEventListener("change", applyFilters);
  }
  if (elements.filters.clear) {
    elements.filters.clear.addEventListener("click", clearAllFilters);
  }
}

export function clearAllFilters() {
  elements.filters.payment.value = "all";
  elements.filters.trainingType.value = "all";
  elements.filters.timeOfDay.value = "all";
  elements.filters.days.value = "all";
  applyFilters();
}

export async function applyFilters() {
  toggleLoader(true);

  try {
    const members = await getMembers();
    const filteredMembers = filterMembers(members);
    renderMembersList(filteredMembers);
  } catch (error) {
    console.error("Filter error:", error);
    alert("Error applying filters. Please try again.");
  } finally {
    toggleLoader(false);
  }
}

function filterMembers(members) {
  const paymentStatus = elements.filters.payment.value;
  const trainingType = elements.filters.trainingType.value;
  const timeOfDay = elements.filters.timeOfDay.value;
  const days = elements.filters.days.value;

  return members.filter((member) => {
    if (!member) return false;

    const paymentMatch =
      paymentStatus === "all" || member.paymentStatus === paymentStatus;

    const typeMatch =
      trainingType === "all" ||
      (member.trainingType &&
        (Array.isArray(member.trainingType)
          ? member.trainingType.includes(trainingType)
          : member.trainingType === trainingType));

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

function toggleLoader(show) {
  if (elements.filters.loader) {
    elements.filters.loader.style.display = show ? "block" : "none";
  }
}

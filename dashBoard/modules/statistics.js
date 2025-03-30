// src/modules/statistics.js
import { elements } from "./dom.js";
import { getMembers } from "./firebase.js";

export async function updateStatistics() {
  try {
    const members = await getMembers();
    const validMembers = members.filter(
      (member) => member && typeof member === "object"
    );

    updatePaymentStatistics(validMembers);
    updateTrainingStatistics(validMembers);
  } catch (error) {
    console.error("Stats error:", error);
  }
}

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

function updateTrainingStatistics(members) {
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
}

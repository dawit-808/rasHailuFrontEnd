// src/modules/firebase.js
import { db, ref, set, get, onValue, update, remove } from "../../firebase.js";
import { elements } from "./dom.js";
import { renderMembersList } from "./ui.js";
import { updateStatistics } from "./statistics.js";

export async function getMembers() {
  const snapshot = await get(ref(db, "members"));
  return snapshot.exists() ? Object.values(snapshot.val()) : [];
}

export async function registerMember(member) {
  const memberRef = ref(db, `members/${member.id.replace(/\//g, "-")}`);
  await set(memberRef, {
    ...member,
    paymentStatus: "Unpaid",
    paymentTimestamp: null,
    paymentHistory: {},
  });
}

export async function togglePaymentStatus(id, currentStatus) {
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

export async function deleteMember(id) {
  if (!confirm("Are you sure you want to delete this member?")) return;

  try {
    await remove(ref(db, `members/${id}`));
  } catch (error) {
    console.error("Delete error:", error);
  }
}

export function watchMembers(callback) {
  onValue(ref(db, "members"), (snapshot) => {
    if (snapshot.exists()) {
      callback();
    }
  });
}

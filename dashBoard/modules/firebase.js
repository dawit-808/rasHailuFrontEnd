import { db, ref, set, get, onValue, update, remove } from "../../firebase.js";

// Get members and include Firebase key
export async function getMembers() {
  const snapshot = await get(ref(db, "members"));
  if (!snapshot.exists()) return [];

  const data = snapshot.val();

  // Add firebaseKey to each member
  return Object.entries(data).map(([firebaseKey, memberData]) => ({
    firebaseKey,
    ...memberData,
  }));
}

// Register new member using the ID as Firebase key (unchangeable path)
export async function registerMember(member) {
  const safeId = member.id.replace(/\//g, "-");
  const memberRef = ref(db, `members/${safeId}`);

  await set(memberRef, {
    ...member,
    paymentStatus: "Unpaid",
    paymentTimestamp: null,
    paymentHistory: {},
  });
}

// Toggle payment status using firebaseKey (not id!)
export async function togglePaymentStatus(firebaseKey, currentStatus) {
  if (
    !confirm(
      currentStatus === "Unpaid" || currentStatus === "Warning"
        ? "Mark as Paid?"
        : "Mark as Unpaid?"
    )
  )
    return;

  try {
    const newStatus =
      currentStatus === "Unpaid" || currentStatus === "Warning"
        ? "Paid"
        : "Unpaid";
    const paymentTimestamp = Date.now();

    await update(ref(db, `members/${firebaseKey}`), {
      paymentStatus: newStatus,
      paymentTimestamp,
    });

    if (currentStatus === "Unpaid" || currentStatus === "Warning") {
      await set(
        ref(db, `members/${firebaseKey}/paymentHistory/${paymentTimestamp}`),
        {
          timestamp: paymentTimestamp,
        }
      );
    }
  } catch (error) {
    console.error("Payment error:", error);
  }
}

// Delete member using firebaseKey
export async function deleteMember(firebaseKey) {
  if (!confirm("Are you sure you want to delete this member?")) return;

  try {
    await remove(ref(db, `members/${firebaseKey}`));
  } catch (error) {
    console.error("Delete error:", error);
  }
}

// Real-time updates on members
export function watchMembers(callback) {
  onValue(ref(db, "members"), (snapshot) => {
    if (snapshot.exists()) {
      callback();
    }
  });
}

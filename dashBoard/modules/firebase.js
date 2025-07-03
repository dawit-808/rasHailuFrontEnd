import { db } from "../../firebase.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Collection reference
const membersCollection = collection(db, "members");

// Get all members (with Firestore doc ID as firebaseKey)
export async function getMembers() {
  const snapshot = await getDocs(membersCollection);
  return snapshot.docs.map((doc) => ({
    firebaseKey: doc.id,
    ...doc.data(),
  }));
}

// Register new member
export async function registerMember(member) {
  const safeId = member.id.replace(/\//g, "-");
  const memberRef = doc(membersCollection, safeId);

  await setDoc(memberRef, {
    ...member,
    paymentStatus: "Unpaid",
    paymentTimestamp: null,
    paymentHistory: {},
  });
}

// Toggle payment status
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

    const memberRef = doc(membersCollection, firebaseKey);

    await updateDoc(memberRef, {
      paymentStatus: newStatus,
      paymentTimestamp,
    });

    // Add to paymentHistory subfield (as a map)
    if (currentStatus === "Unpaid" || currentStatus === "Warning") {
      await updateDoc(memberRef, {
        [`paymentHistory.${paymentTimestamp}`]: {
          timestamp: paymentTimestamp,
        },
      });
    }
  } catch (error) {
    console.error("Payment error:", error);
  }
}

// Delete member
export async function deleteMember(firebaseKey) {
  if (!confirm("Are you sure you want to delete this member?")) return;

  try {
    await deleteDoc(doc(membersCollection, firebaseKey));
  } catch (error) {
    console.error("Delete error:", error);
  }
}

// Real-time member updates
export function watchMembers(callback) {
  return onSnapshot(membersCollection, () => {
    callback();
  });
}

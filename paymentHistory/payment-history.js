import { db, ref, get, remove } from "../firebase.js";

const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");

const paymentHistoryList = document.getElementById("payment-history-list");
const removeHistoryBtn = document.getElementById("remove-history-btn");

function displayPaymentHistory() {
  if (!memberId) {
    paymentHistoryList.innerHTML =
      "<tr><td colspan='3'>No member ID provided.</td></tr>";
    return;
  }

  const paymentHistoryRef = ref(db, `members/${memberId}/paymentHistory`);
  get(paymentHistoryRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const history = snapshot.val();
        paymentHistoryList.innerHTML = "";

        const sortedHistory = Object.keys(history)
          .map((key) => ({
            timestamp: parseInt(key),
            ...history[key],
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        sortedHistory.forEach((payment) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${new Date(payment.timestamp).toLocaleDateString()}</td>
            <td>${new Date(payment.timestamp).toLocaleString("default", { month: "long" })}</td>
            <td>${new Date(payment.timestamp).getFullYear()}</td>
          `;
          paymentHistoryList.appendChild(row);
        });
      } else {
        paymentHistoryList.innerHTML =
          "<tr><td colspan='3'>No payment history found.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching payment history:", error);
      paymentHistoryList.innerHTML =
        "<tr><td colspan='3'>Error loading payment history.</td></tr>";
    });
}

// Function to remove payment history
function removePaymentHistory() {
  if (!memberId) return;

  const paymentHistoryRef = ref(db, `members/${memberId}/paymentHistory`);
  remove(paymentHistoryRef)
    .then(() => {
      paymentHistoryList.innerHTML =
        "<tr><td colspan='3'>Payment history removed.</td></tr>";
      alert("Payment history has been removed.");
    })
    .catch((error) => {
      console.error("Error removing payment history:", error);
      alert("Failed to remove payment history.");
    });
}

// Attach event listener
removeHistoryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to remove all payment history?")) {
    removePaymentHistory();
  }
});

// Load payment history on page load
window.onload = () => {
  displayPaymentHistory();
};

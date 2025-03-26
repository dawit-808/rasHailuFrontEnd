import { db, ref, get } from "./firebase.js";

// Get the member ID from the URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");

// DOM Elements
const paymentHistoryList = document.getElementById("payment-history-list");

// Function to display payment history
function displayPaymentHistory() {
  if (!memberId) {
    paymentHistoryList.innerHTML = "<tr><td colspan='3'>No member ID provided.</td></tr>";
    return;
  }

  const paymentHistoryRef = ref(db, `members/${memberId}/paymentHistory`);
  get(paymentHistoryRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const history = snapshot.val();
        paymentHistoryList.innerHTML = ""; // Clear existing history

        // Convert history object to an array and sort by timestamp
        const sortedHistory = Object.keys(history)
          .map((key) => ({
            timestamp: parseInt(key),
            ...history[key],
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent

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
        paymentHistoryList.innerHTML = "<tr><td colspan='3'>No payment history found.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching payment history:", error);
      paymentHistoryList.innerHTML = "<tr><td colspan='3'>Error loading payment history.</td></tr>";
    });
}

// Load payment history on page load
window.onload = () => {
  displayPaymentHistory();
};
// src/modules/ui.js
import { elements } from "./dom.js";
import { updateStatistics } from "./statistics.js";

export function renderMembersList(members) {
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

  const trainingTypeDisplay = member.trainingType
    ? Array.isArray(member.trainingType)
      ? member.trainingType.join(", ")
      : member.trainingType
    : "N/A";

  const trainingTimeDisplay = member.trainingTime
    ? Array.isArray(member.trainingTime)
      ? member.trainingTime.join("<br>")
      : member.trainingTime
    : "N/A";

  return `
    <tr>
      <td>${index + 1}</td>
      <td>${member.id}</td>
      <td><a target="_blank" href="../memberDetail/member-details.html?id=${member.id.replace(
        /\//g,
        "-"
      )}">${member.name}</a></td>
      <td>${member.fname}</td>
      <td>${trainingTypeDisplay}</td>
      <td>${trainingTimeDisplay}</td>
      <td>
        <button onclick="window.togglePaymentStatus('${member.id.replace(
          /\//g,
          "-"
        )}', '${member.paymentStatus}')"
          class="js-payment payment-status ${paymentStatusClass}">
          ${member.paymentStatus}
        </button>
      </td>
      <td>
        <a target="_blank" href="../paymentHistory/payment-history.html?id=${member.id.replace(
          /\//g,
          "-"
        )}" class="payment-history-link">
          ${lastPayment}
        </a>
      </td>
      <td>
        <button class="delete-btn" onclick="window.deleteMember('${member.id.replace(
          /\//g,
          "-"
        )}')">Delete</button>
      </td>
    </tr>`;
}

export function toggleFormDisplay() {
  const form = document.querySelector(".js-form-display");
  if (form) form.classList.toggle("form-display-none");
}

export function highlightAndScrollToMember(memberId) {
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

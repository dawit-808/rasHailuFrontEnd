import {
  db,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  collection,
  getDocs,
} from "../firebase.js";

// Extract member ID from URL
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");

console.log("Member ID:", memberId);

if (memberId) {
  // Update Navbar Links
  document.getElementById(
    "homeLink"
  ).href = `../memberDetail/member-details.html?id=${memberId}`;
  document.getElementById(
    "coachesLink"
  ).href = `../coaches/coaches.html?id=${memberId}`;

  const memberRef = doc(db, "members", memberId);
  const gymForm = document.getElementById("gymForm");
  let tableContainer = document.getElementById("healthDataTable");
  let healthData = {};

  // Fetch member data
  getDoc(memberRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const member = docSnap.data();
        healthData = member.healthData || {};

        document.querySelector(
          ".member-name"
        ).textContent = `${member.name} ${member.fname}`;
      } else {
        console.error("Member not found.");
        alert("Member not found.");
      }
    })
    .catch((error) => console.error("Error fetching member data:", error));

  // Fetch coaches from Firestore
  getDocs(collection(db, "coaches"))
    .then((snapshot) => {
      const coachContainer = document.querySelector(".checkbox-group");
      coachContainer.innerHTML = "";

      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const coach = doc.data();
          const isChecked =
            healthData.coach && healthData.coach.includes(coach.fullName);

          const coachDiv = document.createElement("div");
          coachDiv.innerHTML = `
            <label>
              <input type="checkbox" name="coach" value="${coach.fullName}" ${
            isChecked ? "checked" : ""
          }> ${coach.fullName}
            </label>
          `;
          coachContainer.appendChild(coachDiv);
        });

        populateForm(healthData);
        displayTable(healthData);
        gymForm.style.display =
          healthData && Object.keys(healthData).length > 0 ? "none" : "block";
      } else {
        coachContainer.innerHTML = "<p>No coaches available.</p>";
      }
    })
    .catch((error) => console.error("Error fetching coaches:", error));

  // Handle form submission
  gymForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(gymForm);
    const healthData = Object.fromEntries(formData.entries());

    // Collect selected coaches
    healthData.coach = Array.from(
      document.querySelectorAll('[name="coach"]:checked')
    ).map((checkbox) => checkbox.value);

    try {
      await updateDoc(memberRef, { healthData });
      alert("Health data saved/updated successfully!");

      // Hide form and display table
      gymForm.style.display = "none";
      displayTable(healthData);
    } catch (error) {
      console.error("Error saving health data:", error);
      alert("Failed to save health data. Please try again.");
    }
  });

  // Populate form with saved data
  function populateForm(data) {
    for (const key in data) {
      const inputElements = document.querySelectorAll(`[name="${key}"]`);

      if (inputElements.length > 0) {
        inputElements.forEach((input) => {
          if (input.type === "radio" || input.type === "checkbox") {
            if (key === "coach" && Array.isArray(data[key])) {
              input.checked = data[key].includes(input.value);
            } else {
              input.checked = data[key] === input.value;
            }
          } else if (input.tagName === "SELECT") {
            Array.from(input.options).forEach((option) => {
              if (option.value === data[key]) option.selected = true;
            });
          } else {
            input.value = data[key];
          }
        });
      }
    }
  }

  // Display table with submitted data
  function displayTable(data) {
    if (!tableContainer) {
      tableContainer = document.createElement("div");
      tableContainer.id = "healthDataTable";
      document.querySelector(".container").appendChild(tableContainer);
    }

    let tableHTML = `
      <h2 class="text-center mt-4">Submitted Health Data</h2>
      <table class="table table-bordered">
        <tbody>
    `;

    for (const key in data) {
      if (key !== "coach") {
        tableHTML += `<tr><th>${key.replace(/_/g, " ")}</th><td>${
          data[key]
        }</td></tr>`;
      }
    }

    tableHTML += `
        <tr><th>Selected Coaches</th><td>${
          data.coach ? data.coach.join(", ") : "None"
        }</td></tr>
        </tbody>
      </table>
      <button id="editDataBtn" class="btn btn-warning w-100 mt-3">Edit</button>
    `;

    tableContainer.innerHTML = tableHTML;
    tableContainer.style.display = "block";

    document.getElementById("editDataBtn").addEventListener("click", () => {
      tableContainer.style.display = "none";
      gymForm.style.display = "block";
    });
  }
} else {
  alert("Invalid Member ID");
}

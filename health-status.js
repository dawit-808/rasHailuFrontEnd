import { db, ref, get, update } from "./firebase.js";

// Extract member ID from URL
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");

console.log("Member ID:", memberId);

if (memberId) {
  // Update Navbar Links
  document.getElementById("homeLink").href = `member-details.html?id=${memberId}`;
  document.getElementById("coachesLink").href = `coaches.html?id=${memberId}`;

  const memberRef = ref(db, `members/${memberId}`);
  const healthRef = ref(db, `members/${memberId}/healthData`);
  const gymForm = document.getElementById("gymForm");
  let tableContainer = document.getElementById("healthDataTable");

  let healthData = {}; // Store health data globally

  // Fetch member data
  get(memberRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const member = snapshot.val();
        document.querySelector(".member-name").textContent = `${member.name} ${member.fname}`;
      } else {
        console.error("Member not found.");
        alert("Member not found.");
      }
    })
    .catch((error) => console.error("Error fetching member data:", error));

  // Fetch health data
  get(healthRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        healthData = snapshot.val();
        console.log("Fetched health data:", healthData);
      } else {
        console.warn("Health data not found.");
      }
    })
    .catch((error) => console.error("Error fetching health data:", error));

  // Fetch coaches from Firebase
  const coachesRef = ref(db, "coaches");
  get(coachesRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const coachesData = snapshot.val();
        const coachContainer = document.querySelector(".checkbox-group");
        coachContainer.innerHTML = ""; // Clear previous coaches

        Object.keys(coachesData).forEach((coachId) => {
          const coach = coachesData[coachId];
          const isChecked = healthData.coach && healthData.coach.includes(coach.fullName);

          const coachDiv = document.createElement("div");
          coachDiv.innerHTML = `
            <label>
              <input type="checkbox" name="coach" value="${coach.fullName}" ${isChecked ? "checked" : ""}> ${coach.fullName}
            </label>
          `;
          coachContainer.appendChild(coachDiv);
        });

        // Now populate the form (ensuring checkboxes exist first)
        populateForm(healthData);
        displayTable(healthData);
        gymForm.style.display = healthData && Object.keys(healthData).length > 0 ? "none" : "block";
      } else {
        console.warn("No coaches found.");
        document.querySelector(".checkbox-group").innerHTML = "<p>No coaches available.</p>";
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

    console.log("Health Data to Save: ", healthData);

    try {
      await update(healthRef, healthData); // Use update to preserve existing data
      alert("Health data saved/updated successfully!");

      // Hide form and display table
      gymForm.style.display = "none";
      displayTable(healthData);
    } catch (error) {
      console.error("Error saving health data:", error);
      alert("Failed to save health data. Please try again.");
    }
  });

  // Function to populate form with saved data
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

  // Function to display table with submitted data
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
        tableHTML += `<tr><th>${key.replace(/_/g, " ")}</th><td>${data[key]}</td></tr>`;
      }
    }

    tableHTML += `
        <tr><th>Selected Coaches</th><td>${data.coach ? data.coach.join(", ") : "None"}</td></tr>
        </tbody>
      </table>
      <button id="editDataBtn" class="btn btn-warning w-100 mt-3">Edit</button>
    `;

    tableContainer.innerHTML = tableHTML;
    tableContainer.style.display = "block"; // Show table after form submission

    // Add event listener to "Edit" button
    document.getElementById("editDataBtn").addEventListener("click", () => {
      tableContainer.style.display = "none";
      gymForm.style.display = "block";
    });
  }
} else { 
  alert("Invalid Member ID");
}

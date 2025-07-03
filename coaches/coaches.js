import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "../firebase.js"; // your Firestore db export

// Extract member ID from URL
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");

console.log("Member ID:", memberId);

if (memberId) {
  // Update the Home link in the navbar
  const homeLink = document.getElementById("homeLink");
  homeLink.href = `../memberDetail/member-details.html?id=${memberId}`;

  // Update the Health Status link in the navbar
  const healthStatusLink = document.getElementById("healthStatusLink");
  healthStatusLink.href = `../healthStatus/health-status.html?id=${memberId}`;

  async function loadCoaches() {
    try {
      // Get member document
      const memberDocRef = doc(db, "members", memberId);
      const memberDocSnap = await getDoc(memberDocRef);

      if (!memberDocSnap.exists()) {
        console.warn("Member not found.");
        document.getElementById("coaches-container").innerHTML =
          "<p>Member not found.</p>";
        return;
      }

      const memberData = memberDocSnap.data();
      let selectedCoaches = memberData.healthData?.coach || [];

      // Ensure selectedCoaches is an array
      if (!Array.isArray(selectedCoaches)) {
        selectedCoaches = [selectedCoaches];
      }

      if (selectedCoaches.length === 0) {
        console.warn("No selected coaches found.");
        document.getElementById("coaches-container").innerHTML =
          "<p>No coach selected.</p>";
        return;
      }

      // Get all coaches from Firestore collection "coaches"
      const coachesColRef = collection(db, "coaches");
      const coachesSnapshot = await getDocs(coachesColRef);

      if (coachesSnapshot.empty) {
        console.error("No coaches found in Firestore.");
        document.getElementById("coaches-container").innerHTML =
          "<p>No coaches available.</p>";
        return;
      }

      const coachesContainer = document.getElementById("coaches-container");
      coachesContainer.innerHTML = ""; // Clear previous data

      let foundCoaches = 0;
      const coachesData = [];
      coachesSnapshot.forEach((doc) => {
        coachesData.push(doc.data());
      });

      selectedCoaches.forEach((coachName) => {
        const matchingCoach = coachesData.find(
          (coach) =>
            coach.fullName.trim().toLowerCase() ===
            coachName.trim().toLowerCase()
        );

        if (matchingCoach) {
          foundCoaches++;

          // Make sure trainingTime is an array
          let trainingTime =
            Array.isArray(matchingCoach.trainingTime) &&
            matchingCoach.trainingTime.length > 0
              ? matchingCoach.trainingTime
              : ["Not available"];

          // Convert training times to HTML list
          let trainingTimesHTML = trainingTime
            .map((time) => `<li>${time}</li>`)
            .join("");

          const coachCard = document.createElement("div");
          coachCard.classList.add("coach-card");
          coachCard.innerHTML = `
            <img src="${matchingCoach.imageUrl || "default-image.jpg"}" 
                 alt="${matchingCoach.fullName}" class="coach-img">
            <h2 class="coach-name">${matchingCoach.fullName}</h2>
            <p class="coach-phone">📞 ${matchingCoach.phoneNumber}</p>
            <p class="coach-type">${matchingCoach.trainingType} Trainer</p>
            <ul class="training-times">${trainingTimesHTML}</ul>
          `;
          coachesContainer.appendChild(coachCard);
        } else {
          console.warn(`Coach "${coachName}" not found in Firestore.`);
        }
      });

      if (foundCoaches === 0) {
        coachesContainer.innerHTML =
          "<p>No matching coaches found in database.</p>";
      }
    } catch (error) {
      console.error("Error loading coaches:", error);
      document.getElementById("coaches-container").innerHTML =
        "<p>Error loading coaches. Please try again later.</p>";
    }
  }

  loadCoaches();
} else {
  alert("Invalid Member ID");
}

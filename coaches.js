import { db, ref, get } from "./firebase.js";

// Extract member ID from URL
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");

console.log("Member ID:", memberId);

if (memberId) {
  // Update the Home link in the navbar
  const homeLink = document.getElementById("homeLink");
  homeLink.href = `member-details.html?id=${memberId}`;

  // Update the Health Status link in the navbar
  const healthStatusLink = document.getElementById("healthStatusLink");
  healthStatusLink.href = `health-status.html?id=${memberId}`;

  const healthRef = ref(db, `members/${memberId}/healthData`);
  get(healthRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const healthData = snapshot.val();
        console.log("Fetched health data:", healthData);

        let selectedCoaches = healthData.coach || [];

        // Ensure selectedCoaches is always an array
        if (!Array.isArray(selectedCoaches)) {
          selectedCoaches = [selectedCoaches];
        }

        if (selectedCoaches.length === 0) {
          console.warn("No selected coaches found.");
          document.getElementById("coaches-container").innerHTML =
            "<p>No coach selected.</p>";
          return;
        }

        // Fetch all coaches' data from Firebase
        const coachesRef = ref(db, "coaches");
        return get(coachesRef).then((snapshot) => {
          if (snapshot.exists()) {
            const coachesData = snapshot.val();
            const coachesContainer =
              document.getElementById("coaches-container");
            coachesContainer.innerHTML = ""; // Clear previous data

            let foundCoaches = 0;
            selectedCoaches.forEach((coachName) => {
              const matchingCoach = Object.values(coachesData).find(
                (coach) =>
                  coach.fullName.trim().toLowerCase() ===
                  coachName.trim().toLowerCase()
              );

              if (matchingCoach) {
                foundCoaches++;

                // Ensure trainingTime is an array
                let trainingTime =
                  Array.isArray(matchingCoach.trainingTime) &&
                  matchingCoach.trainingTime.length > 0
                    ? matchingCoach.trainingTime
                    : ["Not available"];

                // Convert training times array to HTML list
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
                  <p class="coach-type">${
                    matchingCoach.trainingType
                  } Trainer</p>
                  <ul class="training-times">${trainingTimesHTML}</ul>
                `;
                coachesContainer.appendChild(coachCard);
              } else {
                console.warn(`Coach "${coachName}" not found in Firebase.`);
              }
            });

            if (foundCoaches === 0) {
              coachesContainer.innerHTML =
                "<p>No matching coaches found in database.</p>";
            }
          } else {
            console.error("No coaches found in Firebase.");
            document.getElementById("coaches-container").innerHTML =
              "<p>No coaches available.</p>";
          }
        });
      } else {
        console.warn("Health data not found.");
        document.getElementById("coaches-container").innerHTML =
          "<p>No health data available.</p>";
      }
    })
    .catch((error) => console.error("Error fetching health data:", error));
} else {
  alert("Invalid Member ID");
}

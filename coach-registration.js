import { db, ref, set, remove, onValue, get } from "./firebase.js";

// Toggle form visibility
const toggleBtn = document.getElementById("toggleFormBtn");
const coachForm = document.getElementById("coachForm");

toggleBtn.addEventListener("click", () => {
  if (coachForm.style.display === "none" || coachForm.style.display === "") {
    coachForm.style.display = "block";
  } else {
    coachForm.style.display = "none";
  }
});

// Function to upload image to Cloudinary
async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ras-hailu"); // Replace with your Cloudinary preset

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dg5utf0tj/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url; // Return the uploaded image URL
    } else {
      throw new Error("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

// Handle image upload
const imageUploadInput = document.getElementById("imageUpload");
const imageUrlInput = document.getElementById("imageUrl");

imageUploadInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    const imageUrl = await uploadImageToCloudinary(file);
    if (imageUrl) {
      imageUrlInput.value = imageUrl; // Set the hidden input value
      console.log("Image uploaded successfully. URL:", imageUrl);
    } else {
      alert("Failed to upload image. Please try again.");
    }
  }
});

// Handle form submission
document
  .getElementById("coachForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const coachData = Object.fromEntries(formData.entries());

    // Get selected checkboxes (trainingTime)
    const selectedTimes = [];
    document
      .querySelectorAll('[name="trainingTime"]:checked')
      .forEach((checkbox) => {
        selectedTimes.push(checkbox.value);
      });

    // Store training time as an array
    coachData.trainingTime =
      selectedTimes.length > 0 ? selectedTimes : ["Not Specified"];

    // Format coach name as the Firebase key (remove spaces & special characters)
    const coachKey = coachData.fullName.replace(/\s+/g, "_").toLowerCase();

    // Check if the coach already exists in Firebase
    const coachRef = ref(db, `coaches/${coachKey}`);
    const snapshot = await get(coachRef);

    if (snapshot.exists()) {
      alert(
        "⚠️ A coach with this name already exists. Choose a different name."
      );
      return;
    }

    // Save data to Firebase using the formatted name as the key
    set(coachRef, coachData)
      .then(() => {
        alert("✅ Coach registered successfully!");
        document.getElementById("coachForm").reset();
      })
      .catch((error) => {
        console.error("❌ Error registering coach:", error);
        alert("⚠️ Error registering coach. Try again.");
      });
  });

// Function to load and display coaches
function loadCoaches() {
  const coachList = document.getElementById("coach-list");
  const coachesRef = ref(db, "coaches");

  onValue(coachesRef, (snapshot) => {
    coachList.innerHTML = ""; // Clear existing list
    const coaches = snapshot.val();

    if (coaches) {
      let index = 1;
      Object.keys(coaches).forEach((coachKey) => {
        const coach = coaches[coachKey];

        // Create a row for each coach
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${index++}</td>
                    <td><img src="${
                      coach.imageUrl
                    }" alt="Coach Image" style="width: 50px; height: 50px; border-radius: 50%;"></td>
                    <td>${coach.fullName}</td>
                    <td>${coach.phoneNumber}</td>
                    <td>${coach.trainingType}</td>
                    <td>${
                      coach.trainingTime
                        ? coach.trainingTime.join(", ")
                        : "Not Specified"
                    }</td>
                    <td><button class="delete-btn" onclick="deleteCoach('${coachKey}')">Delete</button></td>
                `;

        coachList.appendChild(row);
      });
    }
  });
}

// Delete function must be global to work with `onclick`
window.deleteCoach = function (coachKey) {
  if (confirm("⚠️ Are you sure you want to delete this coach?")) {
    remove(ref(db, `coaches/${coachKey}`))
      .then(() => {
        alert("✅ Coach deleted successfully.");
      })
      .catch((error) => {
        console.error("❌ Error deleting coach:", error);
        alert("⚠️ Error deleting coach. Try again.");
      });
  }
};

// Load coaches on page load
loadCoaches();

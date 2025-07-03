import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
} from "../firebase.js";

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

// Upload image function stays the same
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
      return data.secure_url;
    } else {
      throw new Error("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

// Handle image upload input
const imageUploadInput = document.getElementById("imageUpload");
const imageUrlInput = document.getElementById("imageUrl");

imageUploadInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    const imageUrl = await uploadImageToCloudinary(file);
    if (imageUrl) {
      imageUrlInput.value = imageUrl;
      console.log("Image uploaded successfully. URL:", imageUrl);
    } else {
      alert("Failed to upload image. Please try again.");
    }
  }
});

// Handle form submission
document.getElementById("coachForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Gather form data
  const formData = new FormData(e.target);
  const coachData = Object.fromEntries(formData.entries());

  // Get selected training times as array
  const selectedTimes = [];
  document.querySelectorAll('[name="trainingTime"]:checked').forEach((cb) => {
    selectedTimes.push(cb.value);
  });
  coachData.trainingTime =
    selectedTimes.length > 0 ? selectedTimes : ["Not Specified"];

  // Create a sanitized coach ID (doc ID)
  const coachId = coachData.fullName.replace(/\s+/g, "_").toLowerCase();

  // Reference to Firestore document for this coach
  const coachDocRef = doc(db, "coaches", coachId);

  try {
    // Check if coach already exists
    const docSnap = await getDoc(coachDocRef);
    if (docSnap.exists()) {
      alert(
        "⚠️ A coach with this name already exists. Choose a different name."
      );
      return;
    }

    // Save coach data
    await setDoc(coachDocRef, coachData);
    alert("✅ Coach registered successfully!");
    e.target.reset();
  } catch (error) {
    console.error("❌ Error registering coach:", error);
    alert("⚠️ Error registering coach. Try again.");
  }
});

// Load and display coaches with realtime updates
function loadCoaches() {
  const coachList = document.getElementById("coach-list");
  const coachesCollection = collection(db, "coaches");

  onSnapshot(coachesCollection, (snapshot) => {
    coachList.innerHTML = "";
    let index = 1;

    snapshot.forEach((doc) => {
      const coach = doc.data();
      const coachKey = doc.id;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index++}</td>
        <td><img src="${
          coach.imageUrl || ""
        }" alt="Coach Image" style="width: 50px; height: 50px; border-radius: 50%;"></td>
        <td>${coach.fullName || ""}</td>
        <td>${coach.phoneNumber || ""}</td>
        <td>${coach.trainingType || ""}</td>
        <td>${
          coach.trainingTime ? coach.trainingTime.join(", ") : "Not Specified"
        }</td>
        <td><button class="delete-btn" data-coach-id="${coachKey}">Delete</button></td>
      `;

      coachList.appendChild(row);
    });

    // Add delete handlers after rendering
    coachList.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const coachId = btn.getAttribute("data-coach-id");
        if (confirm("⚠️ Are you sure you want to delete this coach?")) {
          try {
            await deleteDoc(doc(db, "coaches", coachId));
            alert("✅ Coach deleted successfully.");
          } catch (error) {
            console.error("❌ Error deleting coach:", error);
            alert("⚠️ Error deleting coach. Try again.");
          }
        }
      });
    });
  });
}

// Load coaches on page load
loadCoaches();

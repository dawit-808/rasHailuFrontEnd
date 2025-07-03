// src/modules/form.js
import { elements } from "./dom.js";
import { registerMember } from "./firebase.js";

export function setupFormEventListeners() {
  if (elements.form.imageUpload) {
    elements.form.imageUpload.addEventListener("change", handleImageUpload);
  }
}

export async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const imageUrl = await uploadImageToCloudinary(file);
    if (imageUrl) {
      elements.form.imageUrl.value = imageUrl;
    } else {
      alert("Failed to upload image. Please try again.");
    }
  } catch (error) {
    console.error("Upload error:", error);
  }
}

async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ras-hailu");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dg5utf0tj/image/upload",
    { method: "POST", body: formData }
  );

  const data = await response.json();
  return data.secure_url || null;
}

export function getFormData() {
  return {
    name: elements.form.name?.value.trim(),
    fname: elements.form.fname?.value.trim(),
    id: elements.form.memberId?.value.trim(),
    imageUrl: elements.form.imageUrl.value.trim(),
    trainingType: Array.from(elements.form.trainingType)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value),
    trainingTime: Array.from(elements.form.trainingTime)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value),
  };
}

export function validateMemberData(data) {
  if (!data.name) return alert("Please enter a name.");
  if (!data.fname) return alert("Please enter a father's name.");
  if (!data.id) return alert("Please enter a member ID.");
  if (!data.imageUrl) return alert("Please upload an image.");
  if (data.trainingType.length === 0)
    return alert("Please select at least one training type.");
  if (data.trainingTime.length === 0)
    return alert("Please select at least one training time.");
  return true;
}

export async function membersCollector() {
  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block"; // Show loader

  const memberData = getFormData();
  if (!validateMemberData(memberData)) {
    loadingIndicator.style.display = "none"; // Hide if validation fails
    return;
  }

  try {
    await registerMember(memberData);
    resetForm();
    alert("Member registered successfully!");
  } catch (error) {
    console.error("Registration error:", error);
    alert("Failed to register member. Please try again.");
  } finally {
    loadingIndicator.style.display = "none"; // Always hide loader
  }
}

function resetForm() {
  elements.form.name.value = "";
  elements.form.fname.value = "";
  elements.form.memberId.value = "";
  elements.form.imageUpload.value = "";
  elements.form.imageUrl.value = "";
  elements.form.trainingType.forEach((checkbox) => (checkbox.checked = false));
  elements.form.trainingTime.forEach((checkbox) => (checkbox.checked = false));
}

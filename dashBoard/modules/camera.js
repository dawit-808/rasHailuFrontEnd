let videoStream = null;
let isPhotoCaptured = false;

// === SETUP CAMERA CONTROLS ===
export function setupCameraControls() {
  const startCameraBtn = document.getElementById("startCameraBtn");
  const captureBtn = document.getElementById("captureBtn");
  const cancelCameraBtn = document.getElementById("cancelCameraBtn");
  const videoPreview = document.getElementById("videoPreview");
  const imageUploadInput = document.getElementById("imageUploadInput");
  const imageUrlInput = document.getElementById("imageUrlInput");
  const form = document.getElementById("registration-form");

  if (
    !startCameraBtn ||
    !captureBtn ||
    !cancelCameraBtn ||
    !videoPreview ||
    !imageUploadInput ||
    !imageUrlInput ||
    !form
  ) {
    console.warn("Some camera-related elements not found.");
    return;
  }

  // Button handlers
  startCameraBtn.addEventListener("click", startCamera);
  captureBtn.addEventListener("click", capturePhoto);
  cancelCameraBtn.addEventListener("click", handleCancelOrRetry);

  // File input preview
  imageUploadInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById("imagePreview");
        preview.src = e.target.result;
        preview.style.display = "block";
        imageUrlInput.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

// === Upload base64 image to Cloudinary ===
async function uploadBase64ToCloudinary(base64) {
  try {
    const blob = await (await fetch(base64)).blob();
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", "ras-hailu");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dg5utf0tj/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (data.secure_url) return data.secure_url;
    throw new Error("Upload failed");
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return "";
  }
}

// === Camera functionality ===
async function startCamera() {
  try {
    if (videoStream) stopCamera();

    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
        audio: false,
      });
    } catch {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
    }

    const videoPreview = document.getElementById("videoPreview");
    videoPreview.srcObject = videoStream;
    videoPreview.play();

    videoPreview.style.display = "block";
    document.getElementById("captureBtn").style.display = "inline-block";
    document.getElementById("imageUploadInput").style.display = "none";
    isPhotoCaptured = false;
    document.getElementById("cancelCameraBtn").textContent = "Cancel";
  } catch (err) {
    alert("Camera access denied or not available.");
    console.error(err);
  }
}

function capturePhoto() {
  const videoPreview = document.getElementById("videoPreview");
  const canvas = document.createElement("canvas");
  canvas.width = videoPreview.videoWidth;
  canvas.height = videoPreview.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

  const imageDataUrl = canvas.toDataURL("image/png");
  document.getElementById("imageUrlInput").value = imageDataUrl;

  const preview = document.getElementById("imagePreview");
  preview.src = imageDataUrl;
  preview.style.display = "block";

  stopCamera();
  videoPreview.style.display = "none";
  document.getElementById("captureBtn").style.display = "none";
  document.getElementById("imageUploadInput").style.display = "block";
  document.getElementById("cancelCameraBtn").textContent = "Try Again";
  isPhotoCaptured = true;

  alert("Photo captured. It will be uploaded after submission.");
}

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
  }
}

function handleCancelOrRetry() {
  if (isPhotoCaptured) {
    document.getElementById("imageUrlInput").value = "";
    const preview = document.getElementById("imagePreview");
    preview.src = "";
    preview.style.display = "none";
    startCamera();
  } else {
    cancelCamera();
  }
}

function cancelCamera() {
  stopCamera();
  document.getElementById("videoPreview").style.display = "none";
  document.getElementById("captureBtn").style.display = "none";
  document.getElementById("imageUploadInput").style.display = "block";
  document.getElementById("cancelCameraBtn").textContent = "Cancel";
  isPhotoCaptured = false;
}

// === MEMBERS COLLECTOR (Main submit handler) ===
async function membersCollector() {
  const imageUrlInput = document.getElementById("imageUrlInput");
  let imageUrl = imageUrlInput.value;

  if (imageUrl.startsWith("data:image/")) {
    const uploadedUrl = await uploadBase64ToCloudinary(imageUrl);
    if (!uploadedUrl) {
      alert("Image upload failed.");
      return;
    }
    imageUrl = uploadedUrl;
    imageUrlInput.value = uploadedUrl;
  }

  const memberData = {
    memberId: document.getElementById("memberIdInput").value,
    name: document.getElementById("name").value,
    fname: document.getElementById("fname").value,
    trainingType:
      document.querySelector('input[name="trainingType"]:checked')?.value || "",
    trainingTime: Array.from(
      document.querySelectorAll('input[name="trainingTime"]:checked')
    ).map((el) => el.value),
    photo: imageUrl,
  };

  console.log("🔥 Member data to save:", memberData);
  // await saveMemberToFirebase(memberData);

  alert("✅ Member registered successfully!");

  const form = document.getElementById("registration-form");
  form.reset();

  // ✅ Fully clear image preview and inputs
  const imagePreview = document.getElementById("imagePreview");
  imagePreview.src = "";
  imagePreview.style.display = "none";

  document.getElementById("imageUploadInput").value = "";
  document.getElementById("imageUrlInput").value = "";
}

// ✅ Call this once when the page loads
setupCameraControls();
window.membersCollector = membersCollector;

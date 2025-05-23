let videoStream = null;
let isPhotoCaptured = false;

export function setupCameraControls({
  startCameraBtnId,
  captureBtnId,
  cancelCameraBtnId,
  videoPreviewId,
  imageUploadInputId,
  imageUrlInputId,
}) {
  const startCameraBtn = document.getElementById(startCameraBtnId);
  const captureBtn = document.getElementById(captureBtnId);
  const cancelCameraBtn = document.getElementById(cancelCameraBtnId);
  const videoPreview = document.getElementById(videoPreviewId);
  const imageUploadInput = document.getElementById(imageUploadInputId);
  const imageUrlInput = document.getElementById(imageUrlInputId);

  if (
    !startCameraBtn ||
    !captureBtn ||
    !cancelCameraBtn ||
    !videoPreview ||
    !imageUploadInput ||
    !imageUrlInput
  ) {
    console.warn("Camera controls elements not found.");
    return;
  }

  startCameraBtn.addEventListener("click", startCamera);
  captureBtn.addEventListener("click", capturePhoto);
  cancelCameraBtn.addEventListener("click", handleCancelOrRetry);

  imageUploadInput.addEventListener("change", () => {
    stopCamera();
    imageUrlInput.value = ""; // Clear base64 image when user uploads a file
    resetTryAgainButton(); // Reset button if coming from upload
  });

  async function startCamera() {
    try {
      if (videoStream) stopCamera();

      try {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } },
          audio: false,
        });
      } catch (exactErr) {
        console.warn(
          "Exact back camera not available, using ideal fallback.",
          exactErr
        );
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      }

      videoPreview.srcObject = videoStream;
      videoPreview.play();

      videoPreview.style.display = "block";
      captureBtn.style.display = "inline-block";
      imageUploadInput.style.display = "none";
      isPhotoCaptured = false;
      cancelCameraBtn.textContent = "Cancel";
    } catch (err) {
      alert("Camera access denied or not available.");
      console.error(err);
    }
  }

  function capturePhoto() {
    const canvas = document.createElement("canvas");
    canvas.width = videoPreview.videoWidth;
    canvas.height = videoPreview.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/png");
    imageUrlInput.value = imageDataUrl;

    const preview = document.getElementById("imagePreview");
    preview.src = imageDataUrl;
    preview.style.display = "block";

    stopCamera();

    videoPreview.style.display = "none";
    captureBtn.style.display = "none";
    imageUploadInput.style.display = "block";

    // Change cancel button to "Try Again"
    cancelCameraBtn.textContent = "Try Again";
    isPhotoCaptured = true;

    alert("Photo captured. It will be saved with the member data.");
  }

  function stopCamera() {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      videoStream = null;
    }
  }

  function handleCancelOrRetry() {
    if (isPhotoCaptured) {
      // Reset for new capture
      imageUrlInput.value = "";
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
    videoPreview.style.display = "none";
    captureBtn.style.display = "none";
    imageUploadInput.style.display = "block";
    resetTryAgainButton();
  }

  function resetTryAgainButton() {
    cancelCameraBtn.textContent = "Cancel";
    isPhotoCaptured = false;
  }
}

// Image preview from file
document
  .getElementById("imageUploadInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById("imagePreview");
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

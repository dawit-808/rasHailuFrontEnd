import { db, doc, getDoc, onSnapshot, updateDoc } from "../firebase.js";

// Extract member ID from URL
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");

if (memberId) {
  // Update the Health Status link in the navbar
  const healthStatusLink = document.getElementById("healthStatusLink");
  if (healthStatusLink) {
    healthStatusLink.href = `../healthStatus/health-status.html?id=${memberId}`;
  }

  const memberRef = doc(db, "members", memberId);

  // Listen for real-time updates
  onSnapshot(memberRef, (snapshot) => {
    if (snapshot.exists()) {
      const member = snapshot.data();

      updateElement(".profile-img", (el) => {
        el.src = member.imageUrl || "default-image.jpg";
      });

      updateElement(".member-name", (el) => {
        el.textContent = `${member.name} ${member.fname}`;
      });

      updateElement(".member-id", (el) => {
        el.textContent = member.id || "N/A";
      });

      updateElement(".payment-status", (el) => {
        el.textContent = member.paymentStatus?.trim() || "Unpaid";
        updatePaymentStatusClass(el);
      });

      const paymentDate = member.paymentTimestamp
        ? new Date(member.paymentTimestamp).toLocaleDateString()
        : "Not Paid";
      updateElement(".payment-date", (el) => {
        el.textContent = paymentDate;
      });

      updateElement(".training-type", (el) => {
        el.textContent = member.trainingType || "Not Assigned";
      });

      updateElement(".training-time", (el) => {
        el.textContent = member.trainingTime || "Not Scheduled";
      });

      updateElement(".phone-number", (el) => {
        el.textContent = member.healthData?.phone || "N/A";
      });

      updateElement(".emergency-contact", (el) => {
        el.textContent = member.healthData?.emergencyContact || "N/A";
      });

      updateElement(".emergency-phone", (el) => {
        el.textContent = member.healthData?.emergencyPhone || "N/A";
      });

      const coachesLink = document.getElementById("coachesLink");
      if (coachesLink) {
        coachesLink.href = `../coaches/coaches.html?id=${memberId}`;
      }

      generateQRCode(
        window.location.origin +
          `/memberDetail/member-details.html?id=${memberId}`
      );

      setupDownloadButton();
      setupEditButton(member);
    } else {
      alert("Member not found.");
    }
  });
} else {
  alert("Invalid Member ID");
}

function updateElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) callback(element);
}

function updatePaymentStatusClass(el) {
  if (!el) return;
  const status = el.textContent.trim();
  el.classList.remove("paid", "warning", "unpaid");
  el.classList.add(
    status === "Paid" ? "paid" : status === "Warning" ? "warning" : "unpaid"
  );
}

function generateQRCode(url) {
  const qrCodeContainer = document.getElementById("qrcode");
  if (!qrCodeContainer) return;
  qrCodeContainer.innerHTML = "";
  new QRCode(qrCodeContainer, { text: url, width: 500, height: 500 });
}

function setupDownloadButton() {
  const downloadBtn = document.getElementById("downloadBtn");
  if (!downloadBtn) return;

  downloadBtn.addEventListener("click", async () => {
    const elementsToHide = [
      document.querySelector(".pay"),
      document.querySelector(".pay-date"),
      downloadBtn,
      document.getElementById("editMemberBtn"),
      document.querySelector(".training-date"),
    ].filter(Boolean);

    const profileCard = document.querySelector(".profile-card");

    const originalStyles = elementsToHide.map((el) => ({
      element: el,
      visibility: el.style.visibility,
    }));

    elementsToHide.forEach((el) => (el.style.visibility = "hidden"));
    profileCard.classList.add("download-mode");

    const trainingTypeEl = document.querySelector(".training-type");
    let bgColor = "#ffffff";
    let type = trainingTypeEl?.textContent.toLowerCase() || "";

    if (type.includes("aerobics") && type.includes("machine")) {
      bgColor = "#ffffff";
    } else if (type.includes("aerobics")) {
      bgColor = "#0000FF";
    } else if (type.includes("machine")) {
      bgColor = "#008000";
    }

    if (type.includes("aerobics") || type.includes("machine")) {
      profileCard.classList.add("text-white");
    }

    try {
      const canvas = await html2canvas(profileCard, {
        scale: 8,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        letterRendering: true,
        ignoreElements: (el) =>
          window.getComputedStyle(el).position === "absolute" &&
          el !== profileCard,
      });

      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = 1012;
      outputCanvas.height = 638;
      const ctx = outputCanvas.getContext("2d");

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

      const scale = Math.min(
        outputCanvas.width / canvas.width,
        outputCanvas.height / canvas.height
      );
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;
      const xOffset = (outputCanvas.width - scaledWidth) / 2;
      const yOffset = (outputCanvas.height - scaledHeight) / 2;

      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(canvas, xOffset, yOffset, scaledWidth, scaledHeight);

      const imgData = outputCanvas.toDataURL("image/jpeg", 1.0);
      const link = document.createElement("a");
      link.href = imgData;

      const memberIdEl = document.querySelector(".member-id");
      const memberId = memberIdEl?.textContent.trim() || "member";

      link.download = `id-card-${memberId}-${new Date()
        .toISOString()
        .slice(0, 10)}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      originalStyles.forEach(({ element, visibility }) => {
        element.style.visibility = visibility;
      });
      profileCard.classList.remove("download-mode", "text-white");
    }
  });
}

// Function to show the edit form
function showEditForm(memberData) {
  const formContainer = document.getElementById("editFormContainer");

  // Create a clone of the registration form
  formContainer.innerHTML = `
    <form id="edit-member-form" class="js-form-display bg-white p-4 rounded shadow mb-4">
      <h3 class="mb-4 text-primary">Edit Member</h3>
      <div class="mb-3">
        <input id="editImageUploadInput" type="file" class="form-control" accept="image/*">
        <input type="hidden" id="editImageUrlInput" class="js-image-url" value="${
          memberData.imageUrl || ""
        }">
      </div>
      <div class="mb-3">
        <input id="editMemberIdInput" class="form-control" type="text" 
               placeholder="Enter Member ID" value="${
                 memberData.id || ""
               }" required>
      </div>
      <div class="mb-3">
        <input id="editName" class="form-control" type="text" 
               placeholder="Enter Name" value="${
                 memberData.name || ""
               }" required>
      </div>
      <div class="mb-3">
        <input id="editFname" class="form-control" type="text" 
               placeholder="Enter Father Name" value="${
                 memberData.fname || ""
               }" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Training Type*</label>
        <div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="trainingType" 
                   value="Aerobics" id="edit-aerobics" ${
                     memberData.trainingType === "Aerobics" ? "checked" : ""
                   }>
            <label class="form-check-label" for="edit-aerobics">Aerobics</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="trainingType" 
                   value="Machine" id="edit-machine" ${
                     memberData.trainingType === "Machine" ? "checked" : ""
                   }>
            <label class="form-check-label" for="edit-machine">Machine</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="trainingType" 
                   value="Both" id="edit-both" ${
                     memberData.trainingType === "Both" ? "checked" : ""
                   }>
            <label class="form-check-label" for="edit-both">Both</label>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Training Date and Time Per Week*</label>
        <div class="training-time-options">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="trainingTime" 
                   value="MWF: Morning" id="edit-monday-morning" 
                   ${
                     memberData.trainingTime &&
                     memberData.trainingTime.includes("MWF: Morning")
                       ? "checked"
                       : ""
                   }>
            <label class="form-check-label" for="edit-monday-morning">MWF:Morning</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="trainingTime" 
                   value="MWF: Night" id="edit-monday-night" 
                   ${
                     memberData.trainingTime &&
                     memberData.trainingTime.includes("MWF: Night")
                       ? "checked"
                       : ""
                   }>
            <label class="form-check-label" for="edit-monday-night">MWF:Night</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="trainingTime" 
                   value="TTS: Morning" id="edit-tuesday-morning" 
                   ${
                     memberData.trainingTime &&
                     memberData.trainingTime.includes("TTS: Morning")
                       ? "checked"
                       : ""
                   }>
            <label class="form-check-label" for="edit-tuesday-morning">TTS: Morning</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="trainingTime" 
                   value="TTS: Night" id="edit-tuesday-night" 
                   ${
                     memberData.trainingTime &&
                     memberData.trainingTime.includes("TTS: Night")
                       ? "checked"
                       : ""
                   }>
            <label class="form-check-label" for="edit-tuesday-night">TTS: Night</label>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <input id="editPhone" class="form-control" type="text" 
               placeholder="Phone Number" value="${
                 memberData.healthData?.phone || ""
               }">
      </div>
      <div class="mb-3">
        <input id="editEmergencyContact" class="form-control" type="text" 
               placeholder="Emergency Contact" value="${
                 memberData.healthData?.emergencyContact || ""
               }">
      </div>
      <div class="mb-3">
        <input id="editEmergencyPhone" class="form-control" type="text" 
               placeholder="Emergency Contact Phone" value="${
                 memberData.healthData?.emergencyPhone || ""
               }">
      </div>
      <div class="d-flex gap-2">
        <button type="button" id="saveChangesBtn" class="btn btn-success flex-grow-1">Save Changes</button>
        <button type="button" id="cancelEditBtn" class="btn btn-danger">Cancel</button>
      </div>
    </form>
  `;

  formContainer.classList.remove("d-none");
}

// Function to save edited member data
async function saveEditedMember(memberId, formData) {
  try {
    const memberRef = doc(db, "members", memberId);
    const snapshot = await getDoc(memberRef);

    if (!snapshot.exists()) throw new Error("Member not found");

    const existingData = snapshot.data();

    const updatedData = {
      ...existingData,
      id: formData.id,
      name: formData.name,
      fname: formData.fname,
      trainingType: formData.trainingType,
      trainingTime: formData.trainingTime,
      healthData: {
        ...(existingData.healthData || {}),
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
      },
    };

    if (formData.imageUrl) updatedData.imageUrl = formData.imageUrl;

    await updateDoc(memberRef, updatedData);
    return true;
  } catch (error) {
    console.error("Error updating member:", error);
    return false;
  }
}

// Function to setup edit button
function setupEditButton(memberData) {
  const editBtn = document.getElementById("editMemberBtn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      showEditForm(memberData);
    });
  }

  // Add event delegation for the dynamically created form
  document.addEventListener("click", async (e) => {
    if (e.target.id === "saveChangesBtn") {
      e.preventDefault();

      // Collect form data
      const formData = {
        id: document.getElementById("editMemberIdInput").value,
        name: document.getElementById("editName").value,
        fname: document.getElementById("editFname").value,
        trainingType:
          document.querySelector('input[name="trainingType"]:checked')?.value ||
          "",
        trainingTime: Array.from(
          document.querySelectorAll('input[name="trainingTime"]:checked')
        ).map((el) => el.value),
        phone: document.getElementById("editPhone").value,
        emergencyContact: document.getElementById("editEmergencyContact").value,
        emergencyPhone: document.getElementById("editEmergencyPhone").value,
        imageUrl: document.getElementById("editImageUrlInput").value,
      };

      // Handle image upload if a new file was selected
      const imageFile = document.getElementById("editImageUploadInput")
        .files[0];
      if (imageFile) {
        // You'll need to implement your image upload logic here
        // formData.imageUrl = await uploadImage(imageFile);
      }

      // Save changes
      const success = await saveEditedMember(memberId, formData);
      if (success) {
        alert("Member updated successfully!");
        document.getElementById("editFormContainer").classList.add("d-none");
      } else {
        alert("Failed to update member. Please try again.");
      }
    }

    if (e.target.id === "cancelEditBtn") {
      document.getElementById("editFormContainer").classList.add("d-none");
    }
  });
}

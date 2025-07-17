// Initialize jsPDF
const { jsPDF } = window.jspdf;

// DOM Elements
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const imageContainer = document.getElementById("imageContainer");
const thumbnailList = document.getElementById("thumbnailList");
const clearAllBtn = document.getElementById("clearAllBtn");
const previewContainer = document.getElementById("previewContainer");
const previewPages = document.getElementById("previewPages");
const exportBtn = document.getElementById("exportBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

// State
let images = [];
let darkMode = false;

// Event Listeners
dropzone.addEventListener("click", (e) => {
  // Only trigger file input if not clicking on the label/button
  if (!e.target.closest('label[for="fileInput"]')) {
    fileInput.click();
  }
});
fileInput.addEventListener("change", handleFileSelect);
dropzone.addEventListener("dragover", handleDragOver);
dropzone.addEventListener("dragleave", handleDragLeave);
dropzone.addEventListener("drop", handleDrop);
clearAllBtn.addEventListener("click", clearAllImages);
exportBtn.addEventListener("click", generatePDF);
darkModeToggle.addEventListener("change", toggleDarkMode);

// Add event listeners for settings that affect preview
document.getElementById("pageSize").addEventListener("change", updatePreview);
document.querySelectorAll('input[name="orientation"]').forEach((radio) => {
  radio.addEventListener("change", updatePreview);
});
document.getElementById("margins").addEventListener("change", updatePreview);
document.getElementById("fitMode").addEventListener("change", updatePreview);

// Initialize Sortable for thumbnails
let sortable = new Sortable(thumbnailList, {
  animation: 150,
  onEnd: function () {
    // Update images array to match new order
    const newOrder = Array.from(thumbnailList.children).map(
      (el) => el.dataset.index
    );
    images = newOrder.map((index) => images[index]);
    updatePreview();
  },
});

// Functions
function handleFileSelect(e) {
  const files = e.target.files;
  processFiles(files);
  // Reset the input value to allow selecting the same files again
  e.target.value = "";
}

function handleDragOver(e) {
  e.preventDefault();
  dropzone.classList.add("active");
}

function handleDragLeave() {
  dropzone.classList.remove("active");
}

function handleDrop(e) {
  e.preventDefault();
  dropzone.classList.remove("active");
  const files = e.dataTransfer.files;
  processFiles(files);
}

function processFiles(files) {
  const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const validFiles = Array.from(files).filter((file) =>
    validImageTypes.includes(file.type)
  );
  let processedCount = 0;

  if (validFiles.length === 0) return;

  for (let file of validFiles) {
    const reader = new FileReader();
    reader.onload = function (e) {
      images.push({
        file: file,
        url: e.target.result,
      });

      processedCount++;
      if (processedCount === validFiles.length) {
        displayThumbnails();
        updatePreview();
      }
    };
    reader.readAsDataURL(file);
  }
}

function displayThumbnails() {
  thumbnailList.innerHTML = "";

  images.forEach((image, index) => {
    const thumbnail = document.createElement("div");
    thumbnail.className =
      "thumbnail relative rounded-md overflow-hidden bg-gray-100";
    thumbnail.dataset.index = index;

    thumbnail.innerHTML = `
                    <img src="${image.url}" alt="${image.file.name}" class="w-full h-32 object-cover">
                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 truncate text-xs">
                        ${image.file.name}
                    </div>
                    <button class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold remove-btn">×</button>
                `;

    thumbnail.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removeImage(index);
    });

    thumbnailList.appendChild(thumbnail);
  });

  imageContainer.classList.remove("hidden");
  exportBtn.classList.remove("hidden");
}

function removeImage(index) {
  images.splice(index, 1);
  displayThumbnails();
  updatePreview();

  if (images.length === 0) {
    imageContainer.classList.add("hidden");
    previewContainer.classList.add("hidden");
    exportBtn.classList.add("hidden");
  }
}

function clearAllImages() {
  images = [];
  imageContainer.classList.add("hidden");
  previewContainer.classList.add("hidden");
  exportBtn.classList.add("hidden");
}

function toggleDarkMode() {
  darkMode = darkModeToggle.checked;
  document.body.classList.toggle("dark", darkMode);
  updatePreview();
}

function updatePreview() {
  if (images.length === 0) {
    previewContainer.classList.add("hidden");
    return;
  }

  previewContainer.classList.remove("hidden");
  previewPages.innerHTML = "";

  // Get settings
  const pageSize = document.getElementById("pageSize").value;
  const orientation = document.querySelector(
    'input[name="orientation"]:checked'
  ).value;
  const margins = parseInt(document.getElementById("margins").value);
  const fitMode = document.getElementById("fitMode").value;

  // Create preview for each image
  images.forEach((image, index) => {
    const previewPage = document.createElement("div");
    previewPage.className = "preview-page p-4 rounded-lg";

    // Set dimensions based on page size and orientation
    let width, height;
    if (pageSize === "a4") {
      width = orientation === "portrait" ? 210 : 297;
      height = orientation === "portrait" ? 297 : 210;
    } else if (pageSize === "letter") {
      width = orientation === "portrait" ? 216 : 279;
      height = orientation === "portrait" ? 279 : 216;
    } else {
      // legal
      width = orientation === "portrait" ? 216 : 356;
      height = orientation === "portrait" ? 356 : 216;
    }

    // Adjust for margins
    const contentWidth = width - margins * 2;
    const contentHeight = height - margins * 2;

    previewPage.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold">Page ${index + 1}</span>
                        <span class="text-sm">${width} × ${height} mm</span>
                    </div>
                    <div class="relative mx-auto" style="width: ${contentWidth}px; height: ${contentHeight}px; background-color: ${
      darkMode ? "#444" : "#f5f5f5"
    }">
                        <img src="${
                          image.url
                        }" alt="Preview" class="absolute" style="object-fit: ${
      fitMode === "stretch" ? "fill" : "contain"
    }; 
                            ${
                              fitMode === "center"
                                ? "top: 50%; left: 50%; transform: translate(-50%, -50%);"
                                : ""
                            }
                            ${
                              fitMode === "original"
                                ? "width: auto; height: auto; max-width: 100%; max-height: 100%;"
                                : "width: 100%; height: 100%;"
                            }">
                    </div>
                `;

    previewPages.appendChild(previewPage);
  });
}

function generatePDF() {
  if (images.length === 0) return;

  // Get settings
  const pageSize = document.getElementById("pageSize").value;
  const orientation = document.querySelector(
    'input[name="orientation"]:checked'
  ).value;
  const margins = parseInt(document.getElementById("margins").value);
  const fitMode = document.getElementById("fitMode").value;
  const compress = document.getElementById("compressToggle").checked;

  // Create PDF
  const pdf = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: pageSize,
  });

  // Process each image
  const processImage = (image, index) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        let imgWidth = img.width;
        let imgHeight = img.height;

        // Calculate dimensions based on fit mode
        let width, height;
        const pageWidth = pdf.internal.pageSize.getWidth() - margins * 2;
        const pageHeight = pdf.internal.pageSize.getHeight() - margins * 2;

        if (fitMode === "original") {
          // Convert pixels to mm (assuming 96 DPI)
          width = (imgWidth * 25.4) / 96;
          height = (imgHeight * 25.4) / 96;

          // Scale down if too big for page
          if (width > pageWidth || height > pageHeight) {
            const ratio = Math.min(pageWidth / width, pageHeight / height);
            width *= ratio;
            height *= ratio;
          }
        } else if (fitMode === "stretch") {
          width = pageWidth;
          height = pageHeight;
        } else {
          // fit or center
          const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
          width = (imgWidth * ratio * 25.4) / 96;
          height = (imgHeight * ratio * 25.4) / 96;
        }

        // Calculate position
        let x, y;
        if (fitMode === "center") {
          x = (pdf.internal.pageSize.getWidth() - width) / 2;
          y = (pdf.internal.pageSize.getHeight() - height) / 2;
        } else {
          x = margins;
          y = margins;
        }

        // Add image to PDF
        pdf.addImage(img, "JPEG", x, y, width, height);

        // Add new page if not last image
        if (index < images.length - 1) {
          pdf.addPage(pageSize, orientation);
        }

        resolve();
      };
      img.src = image.url;
    });
  };

  // Process all images sequentially
  let promiseChain = Promise.resolve();
  images.forEach((image, index) => {
    promiseChain = promiseChain.then(() => processImage(image, index));
  });

  promiseChain.then(() => {
    // Save PDF
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    pdf.save(`images-to-pdf-${timestamp}.pdf`);
  });
}

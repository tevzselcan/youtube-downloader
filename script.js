document.getElementById("format").addEventListener("change", function (event) {
  const format = event.target.value;
  const videoQualityLabel = document.getElementById("video-quality-label");
  const videoQualitySelect = document.getElementById("video-quality");

  if (format === "mp3") {
    videoQualityLabel.style.display = "none";
    videoQualitySelect.style.display = "none";
  } else {
    videoQualityLabel.style.display = "block";
    videoQualitySelect.style.display = "block";
  }
});

document
  .getElementById("download-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const links = document
      .getElementById("video-links")
      .value.trim()
      .split("\n");
    const format = document.getElementById("format").value;
    const videoQuality = document.getElementById("video-quality").value;
    const messagesDiv = document.getElementById("messages");

    messagesDiv.innerHTML = "";

    const preparationMessage = document.createElement("div");
    preparationMessage.className = "message";
    preparationMessage.innerHTML = "🔄 Priprava video povezav...";
    messagesDiv.appendChild(preparationMessage);

    if (links.length > 10) {
      const errorMessage = document.createElement("div");
      errorMessage.className = "message error";
      errorMessage.textContent =
        "❌ Vnesete lahko največ 10 povezav na prenos.";
      messagesDiv.appendChild(errorMessage);
      return;
    }

    let downloadLinks = [];

    for (const link of links) {
      if (link.trim()) {
        const isAudioOnly = format === "mp3";
        const payload = {
          url: link.trim(),
          vCodec: "h264",
          vQuality: isAudioOnly ? null : videoQuality,
          aFormat: format === "mp3" ? "mp3" : "best",
          filenamePattern: "pretty",
          isAudioOnly: isAudioOnly,
        };

        try {
          const response = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (result.status === "success" || result.status === "stream") {
            downloadLinks.push({ url: result.url, link: link.trim() });
          } else {
            const error = document.createElement("div");
            error.className = "message error";
            error.textContent = `❌ Napaka pri obdelavi ${link.trim()}: ${
              result.text
            }`;
            messagesDiv.appendChild(error);
          }
        } catch (error) {
          const errorMessage = document.createElement("div");
          errorMessage.className = "message error";
          errorMessage.textContent = `❌ Napaka pri obdelavi ${link.trim()}: ${
            error.message
          }`;
          messagesDiv.appendChild(errorMessage);
        }
      }
    }

    const container = document.getElementById("download-container");
    downloadLinks.forEach((link, index) => {
      const a = document.createElement("a");
      a.href = link.url;
      a.download = link.url.split("/").pop();
      a.style.display = "none";
      let ime = link.url.split("/").pop();
      container.appendChild(a);

      setTimeout(() => {
        a.click();
        const startedDownload = document.createElement("div");
        startedDownload.className = "message";
        startedDownload.innerHTML = "⬇️ Prenašanje videa št: " + (index + 1);
        messagesDiv.appendChild(startedDownload);
      }, index * 2000);
    });

    removeAllChildNodes(container);

    function removeAllChildNodes(parent) {
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    }
  });

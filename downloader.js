function addDownloadButton() {
    document.querySelectorAll("article").forEach(article => {
        let mode = localStorage.getItem('igt');
        let imgSrc = mode === 'light' ? 'images/download-dark.png' : 'images/download-light.png';

        if (article.querySelector(".download-btn")) return;

        let btn = document.createElement("button");
        btn.innerHTML = `<img src="${chrome.runtime.getURL(imgSrc)}" style="width: 24px; height: 24px; background-color: transparent; border: none" alt="Download"/>`;
        btn.classList.add("download-btn");
        btn.style.backgroundColor = "transparent";
        btn.style.border = "0px";
        btn.style.cursor = "pointer";
        btn.addEventListener("mouseover", () => {
            btn.style.opacity = "0.8";
        });

        btn.addEventListener("mouseout", () => {
            btn.style.opacity = "1";
        });
        btn.addEventListener("click", async () => {
            let activeImg = null;
            const images = article.querySelectorAll('img');
            let maxVisibleArea = 0;

            images.forEach(img => {
                const rect = img.getBoundingClientRect();
                const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
                const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                const visibleArea = visibleWidth * visibleHeight;

                if (visibleArea > maxVisibleArea && visibleWidth > 50) {
                    maxVisibleArea = visibleArea;
                    activeImg = img;
                }
            });

            if (!activeImg) {
                activeImg = [...images].reduce((largest, current) =>
                        current.naturalWidth > largest.naturalWidth ? current : largest
                    , images[0]);
            }

            if (!activeImg) {
                console.error("Couldn't find image to download");
                return;
            }

            let imgUrl = activeImg.src;
            let filename = imgUrl.split("/").pop().split("?")[0];

            if (!imgUrl.startsWith('http')) {
                console.error("Invalid URL: ", imgUrl);
                return;
            }

            try {
                const response = await fetch(imgUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error("Error while downloading: ", error);
            }
        });

        let buttonContainer = article.querySelector("section")?.firstChild;
        if (buttonContainer) {
            buttonContainer.appendChild(btn);
        }
    });
}

const observer = new MutationObserver(() => addDownloadButton());
observer.observe(document.body, {childList: true, subtree: true});

addDownloadButton();

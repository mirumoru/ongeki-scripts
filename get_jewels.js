(() => {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    const storyBaseURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=";
    const memoryBaseURL = "https://ongeki-net.com/ongeki-mobile/record/memoryChapterDetail/?idx=";
    const shizukuBaseURL = "https://ongeki-net.com/ongeki-mobile/record/";

    const storyIDs = [1, 2, 3, 4, 5];
    const memoryIDs = [
        { id: 70001, name: "Spring Memory" },
        { id: 70002, name: "Summer Memory" },
        { id: 70003, name: "Autumn Memory" },
        { id: 70004, name: "Winter Memory" },
        { id: 70005, name: "O.N.G.E.K.I. Memory" },
        { id: 70099, name: "END CHAPTER" }
    ];

    let results = new Array(storyIDs.length + memoryIDs.length + 1);
    let promises = [];

    const fetchJewelCount = (url, index, label) => {
        let promise = fetch(url, { credentials: 'include' })
            .then(res => res.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const jewelElement = doc.querySelector('.story_jewel_block span, .memory_jewel_block span');

                if (jewelElement) {
                    results[index] = `${label}: ${jewelElement.innerText.trim()} ジュエル`;
                } else {
                    results[index] = `${label}: 解放されていません`;
                }
            })
            .catch(err => {
                console.error(`${label} の取得に失敗:`, err);
                results[index] = `${label}: 取得エラー`;
            });

        promises.push(promise);
    };

    // ストーリー
    storyIDs.forEach((storyID, index) => {
        fetchJewelCount(storyBaseURL + storyID, index, `ストーリー第${storyID}章`);
    });

    // メモリーチャプター
    memoryIDs.forEach((memory, index) => {
        fetchJewelCount(memoryBaseURL + memory.id, storyIDs.length + index, memory.name);
    });

    // しずく数の取得処理
    const fetchShizukuCount = () => {
        let index = storyIDs.length + memoryIDs.length;
        let promise = fetch(shizukuBaseURL, { credentials: 'include' })
            .then(res => res.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const wrapper = doc.querySelector('.wrapper.main_wrapper.t_c');
                if (!wrapper) throw new Error("wrapperが見つかりません");

                const storyTitle = wrapper.querySelector('.story_title_block.f_0.f_r');
                if (!storyTitle) throw new Error("story_title_blockが見つかりません");

                const medalBlock = storyTitle.querySelector('.medal_block.f_l.t_r');
                if (!medalBlock) throw new Error("medal_blockが見つかりません");

                const shizukuElement = medalBlock.querySelector('.v_m.p_3.f_14.gray');
                if (shizukuElement) {
                    results[index] = `しずく: ${shizukuElement.innerText.trim()}`;
                } else {
                    results[index] = "しずく: 情報なし";
                }
            })
            .catch(err => {
                console.error("しずくの取得に失敗:", err);
                results[index] = "しずく: 取得エラー";
            });

        promises.push(promise);
    };

    fetchShizukuCount();

    Promise.all(promises).then(() => {
        showPopup(results.join("<br>"));
    });

    // ポップアップ画面
    function showPopup(content) {
        let existingPopup = document.getElementById("customPopup");
        if (existingPopup) {
            existingPopup.remove();
        }

        let overlay = document.createElement("div");
        overlay.id = "popupOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        overlay.style.zIndex = "9998";
        overlay.addEventListener("click", reloadPage);

        let popup = document.createElement("div");
        popup.id = "customPopup";
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.backgroundColor = "#fff";
        popup.style.padding = "20px";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
        popup.style.zIndex = "9999";
        popup.style.fontFamily = "Arial, sans-serif";
        popup.style.textAlign = "center";
        popup.style.overflowY = "auto";

        if (window.innerWidth <= 480) {
            popup.style.width = "90%";
            popup.style.maxWidth = "400px";
            popup.style.maxHeight = "80vh";
            popup.style.fontSize = "14px";
        } else {
            popup.style.width = "400px";
            popup.style.maxHeight = "70vh";
            popup.style.fontSize = "16px";
        }

        let title = document.createElement("h2");
        title.innerText = "ジュエル数一覧";
        title.style.margin = "0 0 10px 0";
        title.style.fontSize = "18px";
        title.style.color = "#333";

        let message = document.createElement("div");
        message.innerHTML = content;
        message.style.fontSize = "16px";
        message.style.color = "#555";
        message.style.lineHeight = "1.5";

        let closeButton = document.createElement("button");
        closeButton.innerText = "閉じる";
        closeButton.style.marginTop = "15px";
        closeButton.style.padding = "10px 15px";
        closeButton.style.border = "none";
        closeButton.style.borderRadius = "5px";
        closeButton.style.backgroundColor = "#007BFF";
        closeButton.style.color = "#fff";
        closeButton.style.cursor = "pointer";
        closeButton.style.fontSize = "16px";
        closeButton.style.width = "100%";
        closeButton.style.maxWidth = "200px";
        closeButton.addEventListener("click", reloadPage);

        popup.appendChild(title);
        popup.appendChild(message);
        popup.appendChild(closeButton);

        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    function reloadPage() {
        location.reload();
    }
})();

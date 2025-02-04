(() => {
    const storyBaseURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=";
    const memoryBaseURL = "https://ongeki-net.com/ongeki-mobile/record/memoryChapterDetail/?idx=";
    
    const storyIDs = [1, 2, 3, 4, 5]; // ストーリーID一覧
    const memoryIDs = [
        { id: 70001, name: "Spring Memory" },
        { id: 70002, name: "Summer Memory" },
        { id: 70003, name: "Autumn Memory" },
        { id: 70004, name: "Winter Memory" },
        { id: 70005, name: "O.N.G.E.K.I. Memory" },
        { id: 70006, name: "END CHAPTER" }
    ];
    
    let results = new Array(storyIDs.length + memoryIDs.length);
    let promises = [];

    // ジュエル情報を取得する関数
    const fetchJewelCount = (url, index, label) => {
        let promise = fetch(url)
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

    // ストーリー取得
    storyIDs.forEach((storyID, index) => {
        fetchJewelCount(storyBaseURL + storyID, index, `ストーリー第${storyID}章`);
    });

    // Memory シリーズ取得
    memoryIDs.forEach((memory, index) => {
        fetchJewelCount(memoryBaseURL + memory.id, storyIDs.length + index, memory.name);
    });

    Promise.all(promises).then(() => {
        showPopup(results.join("<br>"));
    });

    // ポップアップ表示関数（スマホ対応）
    function showPopup(content) {
        let existingPopup = document.getElementById("customPopup");
        if (existingPopup) {
            existingPopup.remove();
        }

        // オーバーレイ（背景）
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

        // ポップアップ本体
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

        // スマホ用のレイアウト調整
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

        // タイトル
        let title = document.createElement("h2");
        title.innerText = "ジュエル数一覧";
        title.style.margin = "0 0 10px 0";
        title.style.fontSize = "18px";
        title.style.color = "#333";

        // コンテンツ
        let message = document.createElement("div");
        message.innerHTML = content;
        message.style.fontSize = "16px";
        message.style.color = "#555";
        message.style.lineHeight = "1.5";

        // 閉じる（リロード）ボタン
        let closeButton = document.createElement("button");
        closeButton.innerText = "閉じる（リロード）";
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

        // ポップアップに要素を追加
        popup.appendChild(title);
        popup.appendChild(message);
        popup.appendChild(closeButton);

        // ドキュメントに追加
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    // ページをリロードする関数
    function reloadPage() {
        location.reload();
    }
})();

(function() {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    (async () => {
        const baseUrl = "https://ongeki-net.com/ongeki-mobile/ranking/intimate/";
        const characterIds = Array.from({ length: 17 }, (_, i) => 1000 + i); // 1000 から 1016 まで
        const rankingType = 99;
        
        async function fetchCharacterName(idx) {
            const url = `${baseUrl}?idx=${idx}&rankingType=${rankingType}`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch data");
                const html = await response.text();
                
                // DOMParserを使用してHTMLをパース
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const characterElement = doc.querySelector(".m_5.f_15.ranking_kind_name");
                
                return characterElement ? characterElement.innerText.trim() : `キャラ名不明 (idx=${idx})`;
            } catch (error) {
                console.error(`Error fetching data for idx=${idx}:`, error);
                return `取得失敗 (idx=${idx})`;
            }
        }
        
        const characterNames = await Promise.all(characterIds.map(fetchCharacterName));
        
        // showPopup関数が定義されているか確認してから実行
        if (typeof showPopup === "function") {
            showPopup(characterNames.join("<br>"));
        } else {
            console.error("showPopup 関数が見つかりません。スクリプトが正しく読み込まれているか確認してください。");
        }
    })();
})();
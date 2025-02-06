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
        
        // 取得したキャラクター名をポップアップ表示
        showPopup(characterNames.join("<br>"));
    })();
})();

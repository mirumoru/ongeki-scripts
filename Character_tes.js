(function() {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    (async () => {
        const baseUrl = "https://ongeki-net.com/ongeki-mobile/ranking/intimate/";
        const characterIds = Array.from({ length: 17 }, (_, i) => 1000 + i); // 1000 から 1016 まで
        const rankingType = 99;
        
        async function fetchCharacterData(idx) {
            const url = `${baseUrl}?idx=${idx}&rankingType=${rankingType}`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch data");
                const html = await response.text();
                
                // DOMParserを使用してHTMLをパース
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const characterElement = doc.querySelector(".m_5.f_15.ranking_kind_name");
                const characterName = characterElement ? characterElement.innerText.trim() : `キャラ名不明 (idx=${idx})`;
                
                // ranking_block 内の ank_first.png の存在をチェック
                const rankingBlock = doc.querySelector(".ranking_block");
                const firstPlaceIcon = rankingBlock ? rankingBlock.querySelector("img[src*='ank_first.png']") : null;
                let friendlyScore = "スコアなし";
                
                if (firstPlaceIcon) {
                    const deluxeContainer = rankingBlock.querySelector(".character_friendly_deluxe_container");
                    if (deluxeContainer) {
                        const imgElements = deluxeContainer.querySelectorAll("img[src*='num_']");
                        if (imgElements.length > 0) {
                            friendlyScore = imgElements
                                .map(img => img.src.match(/num_(\d+)/))
                                .filter(match => match)
                                .map(match => match[1])
                                .join("");
                        }
                    }
                }
                
                return `${characterName} (${friendlyScore})`;
            } catch (error) {
                console.error(`Error fetching data for idx=${idx}:`, error);
                return `取得失敗 (idx=${idx})`;
            }
        }
        
        const characterData = await Promise.all(characterIds.map(fetchCharacterData));
        
        // 別タブでキャラクター名一覧を表示
        const newTab = window.open("", "_blank");
        if (newTab) {
            newTab.document.write("<html><head><title>キャラクター名一覧</title></head><body>");
            newTab.document.write("<h2>キャラクター名一覧</h2>");
            newTab.document.write("<ul>");
            characterData.forEach(data => {
                newTab.document.write(`<li>${data}</li>`);
            });
            newTab.document.write("</ul>");
            newTab.document.write("</body></html>");
            newTab.document.close();
        } else {
            alert("ポップアップがブロックされている可能性があります。設定を確認してください。");
        }
    })();
})();

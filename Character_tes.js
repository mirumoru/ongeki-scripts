(function() {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    (async () => {
        const baseUrl = "https://ongeki-net.com/ongeki-mobile/ranking/intimate/";
        const characterIds = Array.from({ length: 17 }, (_, i) => 1000 + i); // 1000 から 1016 まで
        const rankingType = 99;

        // 親密度画像解析関数
        function parseFriendlyImages(images) {
            let friendly = 0;

            // 1000の位 (ch[4])
            friendly += images[4] ? (parseInt(images[4].src.split("num_")[1]) * 100) : 0;

            // 100の位 (ch[5])
            friendly += images[5] ? (parseInt(images[5].src.split("num_")[1]) * 100) : 0;

            // 10の位 (ch[1])
            friendly += images[1] ? parseInt(images[1].src.split("num_")[1]) : 0;

            // 1の位 (ch[2])
            friendly += images[2] ? parseInt(images[2].src.split("num_")[1]) : 0;

            return friendly;
        }

        async function fetchCharacterNameAndFriendly(idx) {
            const url = `${baseUrl}?idx=${idx}&rankingType=${rankingType}`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch data");
                const html = await response.text();
                
                // DOMParserを使用してHTMLをパース
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const characterElement = doc.querySelector(".m_5.f_15.ranking_kind_name");
                
                // プレイヤー名を取得 (ranking_inner_table内の一番上の .t_l)
                const playerNameElement = doc.querySelector(".ranking_inner_table.f_14 tbody tr td.t_l");
                const playerName = playerNameElement ? playerNameElement.innerText.trim() : "プレイヤー名不明";

                // 親密度を取得
                const deluxeContainer = doc.querySelector('.character_friendly_deluxe_container');
                let friendlyScore = 0;
                if (deluxeContainer) {
                    const images = Array.from(deluxeContainer.querySelectorAll('img'));
                    friendlyScore = parseFriendlyImages(images);
                }

                const characterName = characterElement ? characterElement.innerText.trim() : `キャラ名不明 (idx=${idx})`;
                return { characterName, playerName, friendlyScore };
            } catch (error) {
                console.error(`Error fetching data for idx=${idx}:`, error);
                return { characterName: `取得失敗 (idx=${idx})`, playerName: "取得失敗", friendlyScore: 0 };
            }
        }
        
        const characterData = await Promise.all(characterIds.map(fetchCharacterNameAndFriendly));
        
        // 別タブでキャラクター名、プレイヤー名、親密度を表示
        const newTab = window.open("", "_blank");
        if (newTab) {
            newTab.document.write("<html><head><title>キャラクター名一覧</title></head><body>");
            newTab.document.write("<h2>キャラクター名一覧</h2>");
            newTab.document.write("<ul>");
            characterData.forEach(({ characterName, playerName, friendlyScore }) => {
                // 表示順を「キャラクター名 - プレイヤー名 - 親密度」に変更
                newTab.document.write(`<li>${characterName} - ${playerName} - 親密度: ${friendlyScore}</li>`);
            });
            newTab.document.write("</ul>");
            newTab.document.write("</body></html>");
            newTab.document.close();
        } else {
            alert("ポップアップがブロックされている可能性があります。設定を確認してください。");
        }
    })();
})();

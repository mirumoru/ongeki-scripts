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
            newTab.document.write("<html><head><title>各キャラクター親密度全国1位一覧表</title></head><body>");
            newTab.document.write("<h2>各キャラクター親密度全国1位一覧表</h2>");
            newTab.document.write("<div><button id='sortDefault'>デフォルト順</button> <button id='sortHigh'>高い順</button> <button id='sortLow'>低い順</button></div>");
            newTab.document.write("<ul id='rankingList'>");

            // デフォルト順でリストを表示
            characterData.forEach(({ characterName, playerName, friendlyScore }) => {
                newTab.document.write(`<li data-score='${friendlyScore}'>${characterName} - ${playerName} - 親密度: ${friendlyScore}</li>`);
            });

            newTab.document.write("</ul>");

            // 並び替えの処理
            newTab.document.getElementById('sortDefault').addEventListener('click', function() {
                sortRanking(newTab, characterData, 'default');
            });
            newTab.document.getElementById('sortHigh').addEventListener('click', function() {
                sortRanking(newTab, characterData, 'high');
            });
            newTab.document.getElementById('sortLow').addEventListener('click', function() {
                sortRanking(newTab, characterData, 'low');
            });

            newTab.document.write("</body></html>");
            newTab.document.close();
        } else {
            alert("ポップアップがブロックされている可能性があります。設定を確認してください。");
        }

        // 並べ替え関数
        function sortRanking(tab, data, order) {
            let sortedData;

            if (order === 'default') {
                sortedData = data; // デフォルト順 (元の順序)
            } else if (order === 'high') {
                sortedData = [...data].sort((a, b) => b.friendlyScore - a.friendlyScore); // 親密度が高い順
            } else if (order === 'low') {
                sortedData = [...data].sort((a, b) => a.friendlyScore - b.friendlyScore); // 親密度が低い順
            }

            // リストをクリア
            const rankingList = tab.document.getElementById('rankingList');
            rankingList.innerHTML = '';

            // ボタン部分を再描画せずに、並び替え後のデータを再表示
            sortedData.forEach(({ characterName, playerName, friendlyScore }) => {
                const listItem = tab.document.createElement('li');
                listItem.setAttribute('data-score', friendlyScore);
                listItem.textContent = `${characterName} - ${playerName} - 親密度: ${friendlyScore}`;
                rankingList.appendChild(listItem);
            });
        }
    })();
})();

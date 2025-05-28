(function() {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    (async () => {
        const fixedUrl = "https://ongeki-net.com/ongeki-mobile/ranking/intimate/?idx=1001&rankingType=99";
        //const characterIds = Array.from({ length: 17 }, (_, i) => 1000 + i); // 1000 から 1016 まで
        //const rankingType = 99;
        

        // 親密度画像解析関数
function parseFriendlyImages(images) {
    let friendly = 0;

    // クラスから高桁を取得
    const img10000 = images.find(img => img.className === "pos3");
    if (img10000) {
        friendly += extractDigit(img10000) * 10000;
    }

    const img1000 = images.find(img => img.className === "pos02");
    if (img1000) {
        friendly += extractDigit(img1000) * 1000;
    }

    const img100 = images.find(img => img.className === "pos1");
    if (img100) {
        friendly += extractDigit(img100) * 100;
    }

    // 10の位と1の位は class によらず、末尾2つの画像から取得
    // 数字画像が高桁のものを含めて並んでいる前提で、末尾2つが10と1の位
    const digitImages = images.filter(img => img.src.includes("num_"));
    const len = digitImages.length;

    if (len >= 2) {
        friendly += extractDigit(digitImages[len - 2]) * 10; // 10の位
        friendly += extractDigit(digitImages[len - 1]);      // 1の位
    }

    return friendly;
}

// 補助関数：画像URLから数値を抽出
function extractDigit(img) {
    const match = img.src.match(/num_(\d)\.png/);
    return match ? parseInt(match[1], 10) : 0;
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
            newTab.document.write("<html><head><title>各キャラクター親密度全国1位一覧表</title>");
            newTab.document.write("<style>");
            newTab.document.write(`
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                h2 { color: #333; }
                table { width: 80%; margin: 20px auto; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
                th { background-color: #f2f2f2; }
                .highlight { font-weight: bold; color: #007BFF; }
                .success { font-weight: bold; color: #28a745; }
                button, input { padding: 10px; font-size: 16px; margin-top: 10px; }
                input { width: 50px; text-align: center; }
                @media (max-width: 768px) {
                    table { width: 100%; }
                    th, td { padding: 8px; }
                    button, input { font-size: 14px; }
                }
            `);
            newTab.document.write("</style>");
            newTab.document.write("</head><body>");
            newTab.document.write("<h2>各キャラクター親密度全国1位一覧表</h2>");
            newTab.document.write("<div><button id='sortDefault'>デフォルト順</button> <button id='sortHigh'>高い順</button> <button id='sortLow'>低い順</button></div>");
            newTab.document.write("<table id='rankingTable'>");
            newTab.document.write("<thead><tr><th>キャラクター名</th><th>プレイヤー名</th><th>親密度</th></tr></thead>");
            newTab.document.write("<tbody>");

            // デフォルト順でテーブルを表示
            characterData.forEach(({ characterName, playerName, friendlyScore }) => {
                newTab.document.write(`<tr data-score='${friendlyScore}'>
                    <td>${characterName}</td>
                    <td>${playerName}</td>
                    <td>${friendlyScore}</td>
                </tr>`);
            });

            newTab.document.write("</tbody>");
            newTab.document.write("</table>");
            newTab.document.write("</body></html>");
            newTab.document.close();

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

            // テーブルをクリア
            const rankingTable = tab.document.getElementById('rankingTable').getElementsByTagName('tbody')[0];
            rankingTable.innerHTML = '';

            // ボタン部分を再描画せずに、並び替え後のデータを再表示
            sortedData.forEach(({ characterName, playerName, friendlyScore }) => {
                const row = tab.document.createElement('tr');
                row.setAttribute('data-score', friendlyScore);
                row.innerHTML = `
                    <td>${characterName}</td>
                    <td>${playerName}</td>
                    <td>${friendlyScore}</td>
                `;
                rankingTable.appendChild(row);
            });
        }
    })();
})();

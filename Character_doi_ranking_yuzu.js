(function() {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    (async () => {
        const baseUrl = "https://ongeki-net.com/ongeki-mobile/ranking/intimate/";
        const characterIds = Array.from({ length: 17 }, (_, i) => 1000 + i); // 1000 から 1016 まで
        const rankingType = 99;

        // 親密度画像URL解析関数
        function parseFriendlyImages(images) {
            let friendly = 0;

            const extractVal = img => {
                const match = img.src.match(/num[_\s]?(\d+)\.png/);
                return match ? parseInt(match[1], 10) : 0;
            };

            const pos3 = images.find(img => img.classList.contains("pos3"));
            const pos02 = images.find(img => img.classList.contains("pos02"));
            const pos1 = images.find(img => img.classList.contains("pos1"));

            if (pos3 || pos02 || pos1) {
                if (pos3) friendly += extractVal(pos3) * 1000;
                if (pos02) friendly += extractVal(pos02) * 1000;
                if (pos1) friendly += extractVal(pos1) * 100;

                const numberImages = images.filter(img => !img.className.includes("pos") && img.src.includes("num_"));
                if (numberImages.length >= 2) {
                    const val10 = extractVal(numberImages[numberImages.length - 2]);
                    const val1 = extractVal(numberImages[numberImages.length - 1]);
                    friendly += val10 + val1;
                }
            } else {
                friendly += images[4] ? extractVal(images[4]) * 100 : 0;
                friendly += images[5] ? extractVal(images[5]) * 100 : 0;
                friendly += images[1] ? extractVal(images[1]) : 0;
                friendly += images[2] ? extractVal(images[2]) : 0;
            }

            return friendly;
        }

        async function fetchCharacterNameAndFriendly(idx) {
            const url = `${baseUrl}?idx=${idx}&rankingType=${rankingType}`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch data");
                const html = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const characterElement = doc.querySelector(".m_5.f_15.ranking_kind_name");
                const playerNameElement = doc.querySelector(".ranking_inner_table.f_14 tbody tr td.t_l");
                const playerName = playerNameElement ? playerNameElement.innerText.trim() : "プレイヤー名不明";

                let friendlyScore = 0;
                const deluxeContainer = doc.querySelector('.character_friendly_deluxe_container');
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

// 高い順でランキングを付けた配列を作成
const rankedData = [...characterData]
    .sort((a, b) => b.friendlyScore - a.friendlyScore)
    .map((item, index) => ({ ...item, rank: index + 1 }));

// 別タブで表示
const newTab = window.open("", "_blank");
if (newTab) {
    newTab.document.write("<html><head><title>各キャラクター親密度全国1位一覧表</title>");
    newTab.document.write("<style> ... </style>"); // 省略可
    newTab.document.write("</head><body>");
    newTab.document.write("<h2>各キャラクター親密度全国1位一覧表</h2>");
    newTab.document.write("<div><button id='sortDefault'>デフォルト順</button> <button id='sortHigh'>高い順</button> <button id='sortLow'>低い順</button></div>");
    newTab.document.write("<table id='rankingTable'>");
    newTab.document.write("<thead><tr><th>順位</th><th>キャラクター名</th><th>プレイヤー名</th><th>親密度</th></tr></thead>");
    newTab.document.write("<tbody>");

    rankedData.forEach(({ rank, characterName, playerName, friendlyScore }) => {
        newTab.document.write(`<tr data-score='${friendlyScore}'>
            <td>${rank}</td>
            <td>${characterName}</td>
            <td>${playerName}</td>
            <td>${friendlyScore}</td>
        </tr>`);
    });

    newTab.document.write("</tbody>");
    newTab.document.write("</table>");
    newTab.document.write("</body></html>");
    newTab.document.close();

    // 並べ替えイベント
    newTab.document.getElementById('sortDefault').addEventListener('click', function () {
        sortRanking(newTab, characterData, 'default');
    });
    newTab.document.getElementById('sortHigh').addEventListener('click', function () {
        sortRanking(newTab, characterData, 'high');
    });
    newTab.document.getElementById('sortLow').addEventListener('click', function () {
        sortRanking(newTab, characterData, 'low');
    });

    function sortRanking(tab, data, order) {
        let sortedData;
        if (order === 'default') {
            sortedData = data.map((d, i) => ({ ...d, rank: i + 1 }));
        } else if (order === 'high') {
            sortedData = [...data].sort((a, b) => b.friendlyScore - a.friendlyScore)
                                .map((d, i) => ({ ...d, rank: i + 1 }));
        } else if (order === 'low') {
            sortedData = [...data].sort((a, b) => a.friendlyScore - b.friendlyScore)
                                .map((d, i) => ({ ...d, rank: i + 1 }));
        }

        const rankingTable = tab.document.getElementById('rankingTable').getElementsByTagName('tbody')[0];
        rankingTable.innerHTML = '';

        sortedData.forEach(({ rank, characterName, playerName, friendlyScore }) => {
            const row = tab.document.createElement('tr');
            row.setAttribute('data-score', friendlyScore);
            row.innerHTML = `
                <td>${rank}</td>
                <td>${characterName}</td>
                <td>${playerName}</td>
                <td>${friendlyScore}</td>
            `;
            rankingTable.appendChild(row);
        });
    }
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
            sortedData.forEach(({ rank, characterName, playerName, friendlyScore }) => {
                const row = tab.document.createElement('tr');
                row.setAttribute('data-score', friendlyScore);
                row.innerHTML = `
                    <td>${rank}</td>
                    <td>${characterName}</td>
                    <td>${playerName}</td>
                    <td>${friendlyScore}</td>
                `;
                rankingTable.appendChild(row);
            });
        }
    })();
})();

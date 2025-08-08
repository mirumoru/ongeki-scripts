(async function () {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    alert("カード情報取得に5秒ほどかかります");

    const start = performance.now(); // 処理開始時間

    const jsonURLs = [
        // TRIEDGE
        { name: "藍原 椿", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1060_tsubaki_aihara.jsonc' },

        // R.B.P.
        { name: "珠洲島 有栖", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1130_arisu_suzushima.jsonc' },

        // マーチングポケッツ
        { name: "日向 千夏", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1140_chinatsu_hinata.jsonc' },
        { name: "柏木 美亜", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1160_mia_kashiwagi.jsonc' },
        { name: "東雲 つむぎ", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1150_tsumugi_shinonome.jsonc' }
    ];

    function removeJSONComments(jsoncText) {
        return jsoncText
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '');
    }

    let characterCardMap = {};
    let cardIdNameMap = {};

    const fetchAllJSON = async () => {
        for (const { name, url } of jsonURLs) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`読み込みに失敗しました ${url}`);
                const text = await response.text();
                const cleaned = removeJSONComments(text);
                const data = JSON.parse(cleaned);

                characterCardMap[name] = [];

                for (const item of data) {
                    cardIdNameMap[item.id] = item.name;
                    characterCardMap[name].push(item.id);
                }
            } catch (err) {
                console.error(`読み込みに失敗しました ${url}:`, err);
            }
        }
    };

    try {
        await fetchAllJSON();
    } catch (err) {
        alert("キャラカードIDとカード名リストの取得に失敗しました。");
        return;
    }

    async function fetchSpecialMenuMap(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`SpecialMenuが読み込みできませんでした。`);
            return await response.json();
        } catch (err) {
            console.error("SpecialMenuの読み込みでエラーが発生しました:", err);
            return {};
        }
    }

    const specialMenuMapURL = 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/special_menu.json';
    let specialMenuImageMap = {};
    try {
        specialMenuImageMap = await fetchSpecialMenuMap(specialMenuMapURL);
    } catch (err) {
        alert("Special Menuのリスト取得に失敗しました。");
        return;
    }

    const BaseURL = "https://ongeki-net.com/ongeki-mobile/card/pages/?idx=";
    const characterIds = Array.from({ length: 20 }, (_, i) => i + 1);

    let specialMenuCards = [];
    let matchedCount = 0;
    let totalCount = 0;
    let lockedCount = 0;
    let htmlContent = `<h2>カード集計結果</h2><pre style="font-size: 14px;">`;

    for (const idx of characterIds) {
        const url = `${BaseURL}${idx}`;
        try {
            const response = await fetch(url, { credentials: "include" });
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const cardBlocks = doc.querySelectorAll('.wrapper.main_wrapper.t_c .f_l.col3');

            htmlContent += `--- idx: ${idx} ---\n`;

            cardBlocks.forEach((block) => {
                const idDiv = block.querySelector('.t_c.break.f_11');
                const isLocked = block.querySelector('.card_lock_img') !== null;

                if (idDiv) {
                    const cardId = idDiv.textContent.trim();
                    const lockText = isLocked ? " (未獲得)" : "";

                    if (cardId === "Special Menu") {
                        const imgElem = block.querySelector('.t_c.border_block.m_5.p_5 img');
                        if (imgElem) {
                            const src = imgElem.getAttribute('src') || '';
                            const filename = src.split('/').pop();
                            const cardName = specialMenuImageMap[filename] || `不明なカード (${filename})`;
                            specialMenuCards.push(`${cardName}${lockText}`);
                        } else {
                            specialMenuCards.push(`画像情報なし${lockText}`);
                        }
                        return;
                    }

                    totalCount++;

                    if (isLocked) lockedCount++;

                    if (cardIdNameMap[cardId]) {
                        htmlContent += `${cardId} → ${cardIdNameMap[cardId]}${lockText}\n`;
                        matchedCount++;
                    } else {
                        htmlContent += `${cardId} → 未登録のカード${lockText}\n`;
                    }
                }
            });
        } catch (error) {
            htmlContent += `エラー: idx=${idx} (${error.message})\n`;
            console.error(`エラー: idx=${idx}`, error);
        }
    }

    const end = performance.now();
    const seconds = ((end - start) / 1000).toFixed(2);

    if (specialMenuCards.length > 0) {
        htmlContent += `\n--- Special Menuカード ---\n`;
        specialMenuCards.forEach((entry) => {
            htmlContent += `${entry}\n`;
        });
    }

    htmlContent += `\n--- キャラごとの所持カード種類数 ---\n`;
    for (const [name, idList] of Object.entries(characterCardMap)) {
        htmlContent += `${name}：${idList.length}枚\n`;
    }

    htmlContent += `\n--- info ---\n`;
    htmlContent += `\n取得したカード数: ${totalCount}枚\n`;
    htmlContent += `登録済カード数: ${matchedCount}枚\n`;
    htmlContent += `未登録カード数: ${totalCount - matchedCount}枚\n`;
    htmlContent += `ロックされているカード数: ${lockedCount}枚\n`;
    htmlContent += `処理時間: ${seconds} 秒\n`;
    htmlContent += `</pre>`;

    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>カード情報集計結果</title>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
        newWindow.document.close();
    } else {
        alert("ポップアップブロックにより新しいタブを開けませんでした。ポップアップを許可してください。");
    }
})();

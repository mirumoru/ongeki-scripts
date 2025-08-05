(async function () {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }
        // 移動用: https://github.com/mirumoru/ongeki-scripts/blob/main/Card_ID_and_name
    const jsonURLs = [
        'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1160_mia_kashiwagi.jsonc',

    ];

// コメントを削除する関数（シンプルなJSONC対応）
function removeJSONComments(jsoncText) {
    return jsoncText
        .replace(/\/\/.*$/gm, '')              // 行末コメント（//）
        .replace(/\/\*[\s\S]*?\*\//g, '');     // ブロックコメント（/* */）
}

// 複数のJSONCをまとめて取得し、1つのマップに変換
const fetchAllJSON = async () => {
    const idNameMap = {};
    for (const url of jsonURLs) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${url}`);
            const text = await response.text();               // コメントありのまま取得
            const cleaned = removeJSONComments(text);         // コメント削除
            const data = JSON.parse(cleaned);                 // JSONとしてパース
            for (const item of data) {
                idNameMap[item.id] = item.name;
            }
        } catch (err) {
            console.error(`Error loading ${url}:`, err);
        }
    }
    return idNameMap;
};

    let cardIdNameMap = {};
    try {
        cardIdNameMap = await fetchAllJSON();
    } catch (err) {
        alert("カード名JSONの取得に失敗しました。コンソールを確認してください。");
        return;
    }

    const BaseURL = "https://ongeki-net.com/ongeki-mobile/card/pages/?idx=";
    const characterIds = Array.from({ length: 20 }, (_, i) => i + 1);

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
                    const lockText = isLocked ? " (lock)" : "";
                    totalCount++;

                    if (isLocked) lockedCount++;

                    if (cardIdNameMap[cardId]) {
                        htmlContent += `${cardId} → ${cardIdNameMap[cardId]}${lockText}\n`;
                        matchedCount++;
                    } else {
                        htmlContent += `${cardId}${lockText} → 未登録のカード\n`;
                    }
                }
            });
        } catch (error) {
            htmlContent += `エラー: idx=${idx} (${error.message})\n`;
            console.error(`エラー: idx=${idx}`, error);
        }
    }

    // 集計結果の追加
    htmlContent += `\n取得したカード数: ${totalCount}枚\n`;
    htmlContent += `登録済カード数: ${matchedCount}枚\n`;
    htmlContent += `未登録カード数: ${totalCount - matchedCount}枚\n`;
    htmlContent += `ロックされているカード数: ${lockedCount}枚\n`;
    htmlContent += `</pre>`;

    // 新しいタブに表示
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
        alert("ポップアップブロックにより新しいタブを開けませんでした。");
    }
})();

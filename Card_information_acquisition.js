(async function () {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    alert("カード情報取得に5秒ほどかかります");

    const start = performance.now(); // 処理開始時間


    // カードIDとカード名表
    // 移動用: https://github.com/mirumoru/ongeki-scripts/blob/main/Card_ID_and_name
    const jsonURLs = [
        // TRIEDGE
        'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1060_tsubaki_aihara.jsonc',// 椿のカード情報

        // R.B.P.
        'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1130_arisu_suzushima.jsonc', // 有栖のカード情報

        // マーチングポケッツ
        'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1140_chinatsu_hinata.jsonc',// 千夏のカード情報
        'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1160_mia_kashiwagi.jsonc', // 美亜のカード情報
        'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1150_tsumugi_shinonome.jsonc', // つむぎのカード情報

    ];

// コメントを削除する関数
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
        alert("キャラカードIDとカード名リストの取得に失敗しました。");
        return;
    }

    // Special Menu取得
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

// ここではJSONを使用しています間違いに注意！
// Special Menu用jsonURL
const specialMenuMapURL = 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/special_menu.json';

// 読み込み
let specialMenuImageMap = {};
try {
    specialMenuImageMap = await fetchSpecialMenuMap(specialMenuMapURL);
} catch (err) {
    alert("Special Menuのリスト取得に失敗しました。");
    return;
}

    const BaseURL = "https://ongeki-net.com/ongeki-mobile/card/pages/?idx=";
    const characterIds = Array.from({ length: 20 }, (_, i) => i + 1);

    let specialMenuCards = [];  // Special Menu一覧を格納

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

                        // block内の指定されたクラスにあるimgを探す
                        const imgElem = block.querySelector('.t_c.border_block.m_5.p_5 img');

                        if (imgElem) {
                            const src = imgElem.getAttribute('src') || '';
                            const filename = src.split('/').pop();
                            const cardName = specialMenuImageMap[filename] || `不明なカード (${filename})`;
                            specialMenuCards.push(`${cardName}${lockText}`);
                        } else{
                            specialMenuCards.push(`画像情報なし${lockText}`);
                        }
                        return; // IDがないので以降の処理はスキップ
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
    const seconds = ((end - start) / 1000).toFixed(2); // 秒に変換して小数第2位まで

    // Special Menu一覧の追加
    if (specialMenuCards.length > 0) {
        htmlContent += `\n--- Special Menuカード ---\n`;
        specialMenuCards.forEach((entry) => {
            htmlContent += `${entry}\n`;
        });
    }


    // 集計結果の追加
    htmlContent += `\n取得したカード数: ${totalCount}枚\n`;
    htmlContent += `登録済カード数: ${matchedCount}枚\n`;
    htmlContent += `未登録カード数: ${totalCount - matchedCount}枚\n`;
    htmlContent += `ロックされているカード数: ${lockedCount}枚\n`;
    htmlContent += `処理時間: ${seconds} 秒\n`;
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

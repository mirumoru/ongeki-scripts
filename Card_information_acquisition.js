(async function () {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    // alert("カード情報取得に30秒ほどかかります。\n連続アクセス防止のため遅延を入れております。");

    // モーダル追加
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = "rgba(0,0,0,0.9)";
    modal.style.color = "#fff";
    modal.style.padding = "20px 40px";
    modal.style.zIndex = "9999";
    modal.style.borderRadius = "10px";
    modal.style.fontSize = "18px";
    modal.style.textAlign = "center";
    modal.id = "progressModal";
    modal.innerText = "開始中...";
    document.body.appendChild(modal);

    const updateProgress = (text) => {
        document.getElementById("progressModal").innerText = text;
    };

    const start = performance.now();

    const jsonURLs = [
        // ASTERISM
        { name: "星咲 あかり", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1010_akari_hoshizaki.jsonc' },
        { name: "藤沢 柚子", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1020_yuzu_fujisawa.jsonc' },
        { name: "三角 葵", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1030_aoi_misumi.jsonc' },

        // ⊿TRiEDGE
        { name: "高瀬 梨緒", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1040_rio_takase.jsonc' },
        { name: "結城 莉玖", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1050_riku_yuuki.jsonc' },
        { name: "藍原 椿", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1060_tsubaki_aihara.jsonc' },

        // bitter flavor
        { name: "早乙女 彩華", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1080_ayaka_saotome.jsonc' },
        { name: "桜井 春菜", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1070_haruna_sakurai.jsonc' },

        // 7EVENDAYS⇔HOLIDAYS
        { name: "柏木 咲姫", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1100_saki_kashiwagi.jsonc' },
        { name: "井之原 小星", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1110_koboshi_inohara.jsonc' },

        // R.B.P.
        { name: "逢坂 茜", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1120_akane_ousaka.jsonc' },
        { name: "九條 楓", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1090_kaede_kujo.jsonc' },
        { name: "珠洲島 有栖", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1130_arisu_suzushima.jsonc' },

        // マーチングポケッツ
        { name: "日向 千夏", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1140_chinatsu_hinata.jsonc' },
        { name: "柏木 美亜", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1160_mia_kashiwagi.jsonc' },
        { name: "東雲 つむぎ", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1150_tsumugi_shinonome.jsonc' },

        // 刹那
        { name: "皇城 セツナ", url: 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/1170_setsuna_sumeragi.jsonc' }
    ];

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // コメント除去関数
    function removeJSONComments(jsoncText) {
        return jsoncText.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    }

    let characterCardMap = {};
    let cardIdNameMap = {};

    // キャラ別集計用
    let characterStats = {};

    // キャラごとのカードIDとカード名を取得・格納する非同期関数

    const fetchAllJSON = async () => {
        for (const { name, url } of jsonURLs) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`読み込みに失敗しました ${url}`);
                const text = await response.text();
                const cleaned = removeJSONComments(text); // JSONC（コメント付きJSON）からコメントを除去
                const data = JSON.parse(cleaned);

                characterCardMap[name] = []; // キャラクターごとのカードID配列を初期化
                characterStats[name] = { total: data.length, obtained: 0, locked: 0 };

                for (const item of data) {
                    cardIdNameMap[item.id] = item.name; // カードIDと名前をマップに登録
                    characterCardMap[name].push(item.id); // 該当キャラのカードIDを格納
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

    // 特定のラベルとURLに対してJSONを取得する非同期関数
    async function fetchSpecialMap(url, label) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${label}が読み込みできませんでした。`);
            return await response.json();
        } catch (err) {
            console.error(`${label}の読み込みでエラーが発生しました:`, err);
            return {};
        }
    }

    const specialMenuMapURL = 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/special_menu.json'; // 食べ物カード
    const specialCardMapURL = 'https://mirumoru.github.io/ongeki-scripts/Card_ID_and_name/special_card.json'; // スペシャルカード

    const specialMenuImageMap = await fetchSpecialMap(specialMenuMapURL, "Special Menu");
    const specialCardImageMap = await fetchSpecialMap(specialCardMapURL, "Special Card");

    const BaseURL = "https://ongeki-net.com/ongeki-mobile/card/pages/?idx="; // カード情報取得先
    const characterIds = Array.from({ length: 20 }, (_, i) => i + 1);

    let specialMenuCards = [];
    let specialCards = [];
    let matchedCount = 0;
    let totalCount = 0;
    let lockedCount = 0;
    let htmlContent = `<h2>カード集計結果</h2><pre style="font-size: 14px;">`;

    for (const idx of characterIds) {
        updateProgress(`カード取得中... (${idx}/20)`);

        const url = `${BaseURL}${idx}`;
        await delay(1000); // 遅延1秒

        try {
            const response = await fetch(url, { credentials: "include" });
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const cardBlocks = doc.querySelectorAll('.wrapper.main_wrapper.t_c .f_l.col3');

            htmlContent += `--- ページ: ${idx} ---\n`;

            cardBlocks.forEach((block) => {
                const idDiv = block.querySelector('.t_c.break.f_11'); //カードID取得先
                const isLocked = block.querySelector('.card_lock_img') !== null; // カードが未獲得をどうかを判断

                if (idDiv) {
                    const cardId = idDiv.textContent.trim();
                    const lockText = isLocked ? " (未獲得)" : "";

                    if (cardId === "Special Menu") {
                        const imgElem = block.querySelector('.t_c.border_block.m_5.p_5 img');
                        const src = imgElem?.getAttribute('src') || '';
                        const filename = src.split('/').pop();
                        const cardName = specialMenuImageMap[filename] || `不明なカード (${filename})`;
                        specialMenuCards.push(`${cardName}${lockText}`);
                        return;
                    }

                    if (cardId === "[O.N.G.E.K.I.]Special Card") {
                        const imgElem = block.querySelector('.t_c.border_block.m_5.p_5 img');
                        const src = imgElem?.getAttribute('src') || '';
                        const filename = src.split('/').pop();
                        const cardName = specialCardImageMap[filename] || `不明なカード (${filename})`;
                        specialCards.push(`${cardName}${lockText}`);
                        return;
                    }

                    totalCount++;

                    if (isLocked) lockedCount++;

                    if (cardIdNameMap[cardId]) {
                        htmlContent += `${cardId} → ${cardIdNameMap[cardId]}${lockText}\n`;
                        matchedCount++;

                        for (const [charName, idList] of Object.entries(characterCardMap)) {
                            if (idList.includes(cardId)) {
                                if (isLocked) {
                                    characterStats[charName].locked++;
                                } else {
                                    characterStats[charName].obtained++;
                                }
                                break;
                            }
                        }
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

    if (specialCards.length > 0) {
        htmlContent += `\n--- Special Cardカード ---\n`;
        specialCards.forEach((entry) => {
            htmlContent += `${entry}\n`;
        });
    }

    // キャラごとの結果出力
    htmlContent += `\n--- キャラごとのカード獲得枚数(Special Cardは計算外) ---\n`;
    for (const [name, stats] of Object.entries(characterStats)) {
        htmlContent += `${name}：総${stats.total}枚 / 獲得${stats.obtained}枚 / 未獲得${stats.locked}枚\n`;
    }

    htmlContent += `\n--- info ---\n`;
    htmlContent += `取得したカード数: ${totalCount}枚\n`;
    htmlContent += `登録済カード数: ${matchedCount}枚\n`;
    htmlContent += `未登録カード数: ${totalCount - matchedCount}枚\n`;
    htmlContent += `未獲得カード数: ${lockedCount}枚\n`;
    htmlContent += `処理時間: ${seconds} 秒\n`;
    htmlContent += `</pre>`;

    // 結果を新しいタブで表示
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

    updateProgress("完了しました！ページを更新します...");
    await delay(3000); // 遅延3秒
    location.reload(); // ページのリロード

})();

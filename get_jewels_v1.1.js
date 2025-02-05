(() => {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    const storyBaseURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=5"; // 第5章のURL
    const purchaseCosts = [5000, 5000, 6000, 7000, 10000]; // フェアリーズ1～5枚目の必要ジュエル
    const requiredFairies = 5; // デイドリーム・エンジェルズを購入するために必要なフェアリーズの枚数
    let currentJewels = 0;

    fetch(storyBaseURL)
        .then(res => res.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const jewelElement = doc.querySelector('.story_jewel_block span'); // 第5章のジュエル取得

            if (jewelElement) {
                currentJewels = parseInt(jewelElement.innerText.replace(/,/g, ''), 10);
            } else {
                alert("ジュエル情報を取得できませんでした。");
                return;
            }

            let fairiesPurchased = 0;
            let remainingJewels = currentJewels;
            let totalJewelsNeeded = 0;

            // デイドリーム・フェアリーズを購入可能なだけ購入
            for (let cost of purchaseCosts) {
                if (remainingJewels >= cost) {
                    remainingJewels -= cost;
                    fairiesPurchased++;
                } else {
                    break;
                }
            }

            // デイドリーム・エンジェルズを購入できるか確認
            let angelsPurchasable = (fairiesPurchased >= requiredFairies);

            // フェアリーズを5枚購入するために必要な合計ジュエル
            for (let cost of purchaseCosts) {
                totalJewelsNeeded += cost;
            }

            let jewelsNeededForFairies = totalJewelsNeeded - currentJewels;
            let resultMessage = `
                <h1>ジュエル計算結果</h1>
                <p>現在の第5章ジュエル: <span class="highlight">${currentJewels}</span> 個</p>
                <p>購入済みのデイドリーム・フェアリーズ: <span class="highlight">${fairiesPurchased}</span> 枚</p>
                ${fairiesPurchased < requiredFairies 
                    ? `<p>デイドリーム・エンジェルズ獲得にはあと <span class="highlight">${jewelsNeededForFairies}</span> ジュエル必要です。</p>`
                    : `<p class="success">デイドリーム・エンジェルズを交換できます！</p>`}
            `;

            // 別タブで結果を表示
            const newTab = window.open("", "_blank");
            newTab.document.write(`
                <html>
                <head>
                    <title>ジュエル計算結果</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                        h1 { color: #333; }
                        p { font-size: 18px; }
                        .highlight { font-size: 24px; font-weight: bold; color: #007BFF; }
                        .success { font-size: 24px; font-weight: bold; color: #28a745; }
                        button { padding: 10px 20px; font-size: 16px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    ${resultMessage}
                    <button onclick="window.close()">閉じる</button>
                </body>
                </html>
            `);
        })
        .catch(err => {
            console.error("ジュエル情報の取得に失敗:", err);
            alert("ジュエル情報の取得に失敗しました。");
        });
})();

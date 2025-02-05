(() => {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    const storyBaseURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=5"; // 第5章のURL
    const targetJewels = 5000; // デイドリーム・フェアリーズ交換に必要なジュエル数
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

            const remainingJewels = targetJewels - currentJewels;
            let resultMessage = `現在の第5章ジュエル: ${currentJewels}個\n`;
            if (remainingJewels > 0) {
                resultMessage += `デイドリーム・フェアリーズ獲得まであと ${remainingJewels} 個必要です。`;
            } else {
                resultMessage += `デイドリーム・フェアリーズを交換できます！`;
            }

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
                    </style>
                </head>
                <body>
                    <h1>ジュエル計算結果</h1>
                    <p>現在の第5章ジュエル: <span class="highlight">${currentJewels}</span> 個</p>
                    <p>${remainingJewels > 0 
                        ? `デイドリーム・フェアリーズ獲得まであと <span class="highlight">${remainingJewels}</span> 個必要です。`
                        : `デイドリーム・フェアリーズを交換できます！`}</p>
                    <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px;">閉じる</button>
                </body>
                </html>
            `);
        })
        .catch(err => {
            console.error("ジュエル情報の取得に失敗:", err);
            alert("ジュエル情報の取得に失敗しました。");
        });
})();

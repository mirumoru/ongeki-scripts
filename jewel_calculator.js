(() => {
    if (!location.href.startsWith("https://ongeki-net.com/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    const storyBaseURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=5";
    const purchaseCosts = [5000, 5000, 6000, 7000, 10000];
    const angelsCost = 10000;
    let currentJewels = 0;

    fetch(storyBaseURL)
        .then(res => res.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const jewelElement = doc.querySelector('.story_jewel_block span');

            if (jewelElement) {
                currentJewels = parseInt(jewelElement.innerText.replace(/,/g, ''), 10);
            } else {
                alert("ジュエル情報を取得できませんでした。");
                return;
            }

            const newTab = window.open("", "_blank");
            newTab.document.write(`
                <html>
                <head>
                    <title>ジュエル計算</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                        h1 { color: #333; }
                        p { font-size: 18px; }
                        .highlight { font-size: 24px; font-weight: bold; color: #007BFF; }
                        .success { font-size: 24px; font-weight: bold; color: #28a745; }
                        button, input { padding: 10px; font-size: 16px; margin-top: 10px; }
                        input { width: 60px; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>ジュエル計算</h1>
                    <p>現在の第5章ジュエル: <span class="highlight">${currentJewels}</span> 個</p>
                    <p>購入済みのデイドリーム・フェアリーズの数: <input type="number" id="fairiesOwned" min="0" max="5" value="0"></p>
                    <p>1プレイあたりの平均ジュエル獲得数: <input type="number" id="jewelPerPlay" min="1" value="100"></p>
                    <button onclick="calculateJewels()">計算する</button>
                    <button onclick="window.close()">タブを閉じる</button>
                    <div id="result"></div>

                    <script>
                        function calculateJewels() {
                            let fairiesOwned = parseInt(document.getElementById("fairiesOwned").value, 10);
                            let jewelPerPlay = parseInt(document.getElementById("jewelPerPlay").value, 10);

                            if (isNaN(fairiesOwned) || fairiesOwned < 0 || fairiesOwned > 5) {
                                alert("0～5の間で入力してください。");
                                return;
                            }
                            if (isNaN(jewelPerPlay) || jewelPerPlay <= 0) {
                                alert("1以上のジュエル数を入力してください。");
                                return;
                            }

                            let totalJewelsNeeded = 0;
                            for (let i = fairiesOwned; i < 5; i++) {
                                totalJewelsNeeded += ${purchaseCosts}[i];
                            }
                            if (fairiesOwned === 5) {
                                totalJewelsNeeded += ${angelsCost};
                            }

                            let jewelsNeeded = totalJewelsNeeded - ${currentJewels};
                            let resultMessage = "";

                            if (jewelsNeeded > 0) {
                                let playsNeeded = Math.ceil(jewelsNeeded / jewelPerPlay);
                                resultMessage += \`
                                    <p>あと <span class="highlight">\${jewelsNeeded}</span> ジュエル必要です。</p>
                                    <p>1プレイあたり <span class="highlight">\${jewelPerPlay}</span> ジュエル獲得するとして、あと <span class="highlight">\${playsNeeded}</span> プレイ必要です。</p>
                                \`;
                            } else {
                                resultMessage += \`<p class="success">デイドリーム・エンジェルズを交換できます！</p>\`;
                            }

                            document.getElementById("result").innerHTML = resultMessage;
                        }
                    </script>
                </body>
                </html>
            `);
            newTab.document.close();
        })
        .catch(err => {
            console.error("ジュエル情報の取得に失敗:", err);
            alert("ジュエル情報の取得に失敗しました。");
        });
})();

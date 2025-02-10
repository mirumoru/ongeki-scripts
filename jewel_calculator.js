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
                    <title>DDF&DDAジュエル計算</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                        h1 { color: #333; }
                        table { width: 100%; margin: 20px auto; border-collapse: collapse; overflow-x: auto; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 14px; }
                        th { background-color: #f2f2f2; }
                        .highlight { font-weight: bold; color: #007BFF; }
                        .success { font-weight: bold; color: #28a745; }
                        button, input { padding: 10px; font-size: 16px; margin-top: 10px; }
                        input { width: 70px; text-align: center; }
                        @media (max-width: 600px) {
                            th, td { font-size: 12px; padding: 8px; }
                            table { font-size: 12px; }
                            button, input { font-size: 14px; padding: 8px; }
                        }
                    </style>
                </head>
                <body>
                    <h1>DDF&DDAジュエル計算</h1>
                    <p>現在の第5章ジュエル: <span class="highlight">${currentJewels}</span> 個</p>
                    <p>1プレイで獲得できるジュエル数: <input type="number" id="jewelsPerPlay" min="1" max="180" value="12"></p>
                    <button onclick="calculateJewels()">計算する</button>
                    <button onclick="window.close()">タブを閉じる</button>
                    <div id="result"></div>

                    <script>
                        const purchaseCosts = [5000, 5000, 6000, 7000, 10000];
                        const angelsCost = 10000;
                        let currentJewels = ${currentJewels};

                        function calculateJewels() {
                            let jewelsPerPlay = parseFloat(document.getElementById("jewelsPerPlay").value);
                            if (isNaN(jewelsPerPlay) || jewelsPerPlay <= 0) {
                                alert("1プレイあたりのジュエル数を正しく入力してください。");
                                return;
                            }

                            let totalJewelsNeeded = 0;
                            let tableRows = "";

                            for (let i = 0; i < 5; i++) {
                                totalJewelsNeeded += purchaseCosts[i];
                                let remainingJewels = Math.max(totalJewelsNeeded - currentJewels, 0);
                                let neededGP = remainingJewels * 3;
                                let neededPlays = Math.ceil(remainingJewels / jewelsPerPlay);
                                let neededMoney = Math.ceil((neededPlays * 40) / 120) * 100;

                                tableRows += \`
                                    <tr>
                                        <td>デイドリーム・フェアリーズ\${i + 1}枚目</td>
                                        <td>\${purchaseCosts[i]}</td>
                                        <td>\${remainingJewels}</td>
                                        <td>\${neededGP}</td>
                                        <td>\${neededPlays}</td>
                                        <td>\${neededMoney}円</td>
                                    </tr>
                                \`;}
                            
                            totalJewelsNeeded += angelsCost;
                            let remainingJewels = Math.max(totalJewelsNeeded - currentJewels, 0);
                            let neededGP = remainingJewels * 3;
                            let neededPlays = Math.ceil(remainingJewels / jewelsPerPlay);
                            let neededMoney = Math.ceil((neededPlays * 40) / 120) * 100;

                            tableRows += \`
                                <tr>
                                    <td>デイドリーム・エンジェルズ購入</td>
                                    <td>\${angelsCost}</td>
                                    <td>\${remainingJewels}</td>
                                    <td>\${neededGP}</td>
                                    <td>\${neededPlays}</td>
                                    <td>\${neededMoney}円</td>
                                </tr>
                            \`;

                            let resultTable = \`
                                <table>
                                    <tr>
                                        <th>項目</th>
                                        <th>必要ジュエル</th>
                                        <th>あと必要なジュエル</th>
                                        <th>必要GP</th>
                                        <th>必要プレイ回数</th>
                                        <th>必要金額</th>
                                    </tr>
                                    \${tableRows}
                                </table>
                            \`;

                            if (totalJewelsNeeded - currentJewels <= 0) {
                                resultTable += \`<p class="success">デイドリーム・エンジェルズを交換できます！</p>\`;
                            }

                            document.getElementById("result").innerHTML = resultTable + \`
                                <p style="margin-top: 10px; font-size: 14px; color: #555;">
                                ※この計算はBタイプ(100円=120GP)で計算しています。<br>
                                また、必ずしもこの計算が正しいとは限りません。あくまで参考までに。
                                </p>
                            \`;
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

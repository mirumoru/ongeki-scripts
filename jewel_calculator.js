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
                        table { width: 60%; margin: 20px auto; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 10px; }
                        th { background-color: #f2f2f2; }
                        .highlight { font-weight: bold; color: #007BFF; }
                        .success { font-weight: bold; color: #28a745; }
                        button { padding: 10px; font-size: 16px; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <h1>ジュエル計算</h1>
                    <p>現在の第5章ジュエル: <span class="highlight">${currentJewels}</span> 個</p>
                    <button onclick="window.close()">タブを閉じる</button>
                    <div id="result"></div>

                    <script>
                        const purchaseCosts = [5000, 5000, 6000, 7000, 10000];
                        const angelsCost = 10000;
                        let currentJewels = ${currentJewels};

                        function calculateJewels() {
                            let totalJewelsNeeded = 0;
                            let tableRows = "";

                            for (let i = 0; i < 5; i++) {
                                totalJewelsNeeded += purchaseCosts[i];
                                let remainingJewels = Math.max(totalJewelsNeeded - currentJewels, 0);
                                tableRows += \`
                                    <tr>
                                        <td>デイドリーム・フェアリーズ\${i + 1}枚目</td>
                                        <td>\${purchaseCosts[i]}</td>
                                        <td>\${remainingJewels}</td>
                                    </tr>
                                \`;
                            }

                            totalJewelsNeeded += angelsCost;
                            let remainingJewels = Math.max(totalJewelsNeeded - currentJewels, 0);
                            tableRows += \`
                                <tr>
                                    <td>デイドリーム・エンジェルズ購入</td>
                                    <td>\${angelsCost}</td>
                                    <td>\${remainingJewels}</td>
                                </tr>
                            \`;

                            let resultTable = \`
                                <table>
                                    <tr>
                                        <th>項目</th>
                                        <th>必要ジュエル</th>
                                        <th>あと必要なジュエル</th>
                                    </tr>
                                    \${tableRows}
                                </table>
                            \`;

                            if (totalJewelsNeeded - currentJewels <= 0) {
                                resultTable += \`<p class="success">デイドリーム・エンジェルズを交換できます！</p>\`;
                            }

                            document.getElementById("result").innerHTML = resultTable;
                        }

                        calculateJewels();
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

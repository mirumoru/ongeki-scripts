(async function () {
    // 現在のURLがオンゲキNETでなければスクリプトを停止
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }


    let R_Type; // ランキングタイプの番号を格納する変数
    const validTypes = ['99', '1', '2', '3'];
    const typeNames = {
        '99': '全国ランキング',
        '1': '県別ランキング',
        '2': '店舗別ランキング',
        '3': 'フレンドランキング'
    };

    // ランキング種別をユーザーに入力させる
    while (true) {
        const input = prompt("ランキングタイプを選んでください:\n99 = 全国ランキング\n1 = 県別ランキング\n2 = 店舗別ランキング\n3 = フレンドランキング");
        if (input === null) {
            alert("キャンセルしました。");
            return;

        }
        if (validTypes.includes(input)) {
            R_Type = parseInt(input);
            break;
        } else {
            alert("無効な入力です。99、1、2、3 のいずれかを入力してください。");
        }
    }

    // ランキングページのベースURLと、選択されたランキング種別でURLを組み立て
    const BaseURL = "https://ongeki-net.com/ongeki-mobile/ranking/rating/?rankingType=";
    const fullURL = `${BaseURL}${R_Type}`;
    console.warn(`ターゲットURL: ${fullURL}`);


    // 指定したURLからHTMLを取得してDOMとして返す非同期関数
    async function fetchRankingDOM(url) {
        const res = await fetch(url, { credentials: 'include' });
        const text = await res.text();
        const parser = new DOMParser();
        return parser.parseFromString(text, 'text/html');
    }

    try {
        const doc = await fetchRankingDOM(fullURL); // 指定URLのランキングページのDOMを取得

        // レーティングの数値を取得
        const ratingSpan = doc.querySelector('.ranking_rating_field span');
        let myRating = '';

        if (ratingSpan) {
            myRating = ratingSpan.textContent.trim();
        } else {
            console.warn('マイレーティングが見つかりません');
        }

        console.log("ランキングのタイトルブロックを取得中...");
        // ランキングのタイトルブロックを取得し、HTMLとして保存
        const titleBlock = doc.querySelector('.ranking_title_block');
        const titleHTML = titleBlock ? titleBlock.innerHTML : '';
        console.log("タイトルブロック取得完了:", titleHTML);

        // ランキング表の行をすべて取得
        const rows = doc.querySelectorAll('.ranking_block tr');

        const rankingData = []; // ランキングデータ格納用配列

        // 各行を処理してランキングデータを抽出
        rows.forEach((row) => {
            if (row.classList.contains("ranking_title_block")) return;

            const cells = row.querySelectorAll('td');
            if (cells.length < 4) return;

            // 順位の画像を複数含む場合があるのですべて取得
            const rankImgs = cells[0].querySelectorAll('img');

            // プレイヤー名を取得
            const name = cells[2]?.textContent.trim();

            // スコアのspanを特定クラスから取得
            const ratingClasses = [
            'rating_kiwami','rating_aura_ura', 'rating_aura','rating_rainbow',
            'rating_platinum', 'rating_gold', 'rating_silver', 'rating_bronze',
            'rating_purple', 'rating_orange', 'rating_red', 'rating_blue', 'rating_green'
            ];
            const scoreSpan = ratingClasses
            .map(cls => cells[3].querySelector(`.${cls}`))
            .find(el => el); // 最初に見つかったもの

            const score = scoreSpan ? scoreSpan.textContent.trim() : '';

            // 順位画像のHTMLを結合
            let rankHtml = '';
            rankImgs.forEach(img => {
                rankHtml += img.outerHTML;
            });

            // データがそろっていれば配列に追加
            if (rankHtml && name && score) {
                rankingData.push({ rankHtml, name, score });
                console.log("データの取得に成功しました");
            }else{
                console.log("データの取得に失敗しました:", rankingData);
            }
        });

            // 調整済みの年月日を取得し、NowDateに代入
            const NowDate = (() => {
                const now = new Date();

            // 現在の時刻が午前4時より前なら1日前にずらす
                if (now.getHours() < 4) {
                    now.setDate(now.getDate() - 1);
            }

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0始まり
            const day = String(now.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;

        })();

        // htmlContent を使ってランキングページを新しいタブに表示
        const htmlContent = `
            <html>
            <head>
                <title>オンゲキ レーティングランキング</title>
                <style>
                    body { font-family: sans-serif; padding: 1em; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #aaa; padding: 8px; text-align: center; }
                    th { background: #f0f0f0; }
                    img.h_35 { height: 35px; }
                    img.h_40 { height: 40px; }
                    .my-info { margin-bottom: 1em; padding: 10px; border: 1px solid #aaa; background: #f9f9f9; }
                    .my-info-title { font-weight: bold; margin-bottom: 5px; }
                    .ranking-title { margin-bottom: 1em; padding: 10px; border: 1px solid #ddd; background: #fffbe6; }
                    .download-btn { margin-top: 2em; display: flex; justify-content: center; }
                    button { font-size: 16px; padding: 10px 20px; cursor: pointer; }
                </style>
            </head>
            <body>
                <h1>オンゲキ レーティングランキング - ${typeNames[R_Type.toString()]}</h1>

                <div class="my-info">
                    <div class="my-info-title">あなたのレーティング</div>
                    <div>${myRating}</div>
                </div>

                ${titleHTML ? `<div class="ranking-title">${titleHTML}</div>` : ''}

                <table>
                    <thead>
                        <tr>
                            <th>順位</th>
                            <th>プレイヤー名</th>
                            <th>レーティング</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rankingData.map(entry => `
                            <tr>
                                <td>${entry.rankHtml}</td>
                                <td>${entry.name}</td>
                                <td>${entry.score}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="download-btn">
                    <button onclick="downloadHTML()">このページをHTMLファイルとして保存</button>
                </div>

                <script>
                    function downloadHTML() {
                        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'ongeki_rating_ranking_${NowDate}_${typeNames[R_Type.toString()]}.html';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                </script>
            </body>
            </html>
        `;

        const newTab = window.open();
        if (newTab) {
            newTab.document.write(htmlContent);
            newTab.document.close();
        } else {
            alert("ポップアップがブロックされています。新しいタブを許可してください。");
        }

    } catch (e) {
        console.error("ランキング情報の取得に失敗しました:", e);
        alert("ランキング情報の取得に失敗しました。ログインしているか、接続が切れていないか確認してください。");
    }
})();

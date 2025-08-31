(function() {
    const url = window.location.href;

    let results = [];

    // ========================
    // オンゲキ: https://ongeki-net.com/ongeki-mobile/record/playlog/
    // ========================
if (url.startsWith("https://ongeki-net.com/ongeki-mobile/record/playlog/")) {
    const dateSpans = document.querySelectorAll('span.f_r.f_12.h_10');
    const playCountByDay = {};

    dateSpans.forEach(span => {
        const date = span.textContent.split(' ')[0];
        if (playCountByDay[date]) {
            playCountByDay[date] += 1;
        } else {
            playCountByDay[date] = 1;
        }
    });

    for (const date in playCountByDay) {
        const count = playCountByDay[date];

        // 1プレイ = 40GP
        const totalGP = count * 40;

        // 使用金額を切り上げで計算（120GP = 100円換算）
        const cost = Math.ceil(totalGP / 120) * 100;

        results.push({ 
            date, 
            count, 
            cost, 
            totalGP 
        });
    }
}


    // ========================
    // マイマイ: https://maimaidx.jp/maimai-mobile/record/
    // ========================
    else if (url.startsWith("https://maimaidx.jp/maimai-mobile/record/")) {
        let playCountPerDay = {};
        let lastDay = null;
        let lastTrack = null;

        document.querySelectorAll(".playlog_top_container").forEach(container => {
            let spans = container.querySelectorAll(".sub_title span");

            if (spans.length >= 2) {
                let track = spans[0].textContent.trim();
                let day   = spans[1].textContent.trim().split(" ")[0];

                if (track === "TRACK 01") {
                    if (!playCountPerDay[day]) playCountPerDay[day] = 0;
                    playCountPerDay[day]++;
                }

                lastDay = day;
                lastTrack = track;
            }
        });

        if (lastDay && lastTrack !== "TRACK 01") {
            if (!playCountPerDay[lastDay]) playCountPerDay[lastDay] = 0;
            playCountPerDay[lastDay]++;
        }

        Object.entries(playCountPerDay).forEach(([day, count]) => {
            let cost = count * 100;
            results.push({ date: day, count, cost });
        });
    }

    else {
        alert("対応していないURLです。");
        return;
    }

    // ========================
    // 新しいタブで表示
    // ========================
    let newTab = window.open();
    let html = `<html><head><title>プレイ集計</title>
        <style>
            table { border-collapse: collapse; width: 300px; margin: 20px auto; }
            th, td { border: 1px solid #666; padding: 8px; text-align: center; }
            th { background-color: #f0f0f0; }
        </style>
        </head><body>
        <h2 style="text-align:center;">日別プレイ集計</h2>
        <table>
            <tr><th>日付</th><th>プレイ回数</th><th>使用金額</th></tr>`;

    results.forEach(r => {
        html += `<tr><td>${r.date}</td><td>${r.count}</td><td>${r.cost} 円</td></tr>`;
    });

    html += `</table></body></html>`;
    newTab.document.write(html);
    newTab.document.close();
})();

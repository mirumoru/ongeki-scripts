(async function() {
    // 現在のURLがオンゲキNETでなければスクリプトを停止
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    // 条件に合うURLを組み立て
    const divs = document.querySelectorAll(".wrapper.main_wrapper.t_c .container3 [class*='basic_btn']");
    const urls = [];

    for (const div of divs) {
        if (div.querySelector("table[class*='score_table']")) {
            const form = div.querySelector("form");
            if (!form) continue;
            const idxInput = form.querySelector("input[name='idx']");
            if (!idxInput) continue;

            const baseUrl = form.action;
            const idxValue = idxInput.value;
            const url = baseUrl + "?idx=" + encodeURIComponent(idxValue);
            urls.push(url);
        }
    }

    // 組み立てたURLをコンソールに表示
    console.log("=== 組み立てたURL一覧 ===");
    urls.forEach(u => console.log(u));

    // 別タブ作成
    const resultWindow = window.open("", "_blank");
    resultWindow.document.title = "最終プレイ日時一覧";

    const container = resultWindow.document.createElement("pre");
    container.id = "result";
    container.style.whiteSpace = "pre-wrap";
    container.style.fontFamily = "monospace";
    resultWindow.document.body.appendChild(container);

    const resultEl = container;

    const difficulties = [
        { id: "basic",    name: "basic" },
        { id: "advanced", name: "advanced" },
        { id: "expert",   name: "expert" },
        { id: "master",   name: "master" }
    ];

    for (const url of urls) {
        try {
            const res = await fetch(url);
            const text = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");

            const songTitleElement = doc.querySelector(
                ".wrapper.main_wrapper.t_c .container3 .m_10.t_l .w_260.f_l.p_5 .m_5.f_14.break"
            );
            const songTitle = songTitleElement ? songTitleElement.textContent.trim() : "曲名不明";

            difficulties.forEach(diff => {
                const block = doc.querySelector(`.wrapper.main_wrapper.t_c #${diff.id}`);
                if (block) {
                    const dateCell = block.querySelector("table td:nth-child(2)");
                    const dateText = dateCell ? dateCell.textContent.trim() : "データなし";
                    resultEl.textContent += `${songTitle} | ${diff.name} の最終プレイ日時: "${dateText}"\n`;
                }
            });

            await new Promise(r => setTimeout(r, 500));
        } catch (err) {
            console.error("取得エラー:", url, err);
            resultEl.textContent += `エラー: ${url}\n`;
        }
    }

})();

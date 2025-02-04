(() => {
    const baseURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=";
    const storyIDs = [1, 2, 3, 4, 5]; // ストーリーID一覧
    let results = new Array(storyIDs.length); // 順番を保持する配列
    let promises = [];

    storyIDs.forEach((storyID, index) => {
        let url = baseURL + storyID;

        let promise = fetch(url)
            .then(res => res.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const jewelElement = doc.querySelector('.story_jewel_block span');

                if (jewelElement) {
                    results[index] = `ストーリー第${storyID}章: ${jewelElement.innerText} ジュエル`;
                } else {
                    results[index] = `ストーリー第${storyID}章: データなし`;
                }
            })
            .catch(err => {
                console.error(`ストーリー第${storyID}章 の取得に失敗:`, err);
                results[index] = `ストーリー第${storyID}章: 取得エラー`;
            });

        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        alert(results.join("\n"));
    });
})();

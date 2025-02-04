(() => {
    const baseURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=";
    const storyIDs = [1, 2, 3, 4, 5]; // ストーリーID一覧
    let results = [];
    let promises = [];

    storyIDs.forEach(storyID => {
        let url = baseURL + storyID;

        let promise = fetch(url)
            .then(res => res.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const jewelElement = doc.querySelector('.story_jewel_block span');

                if (jewelElement) {
                    results.push(`ストーリー ${storyID}: ${jewelElement.innerText} ジュエル`);
                } else {
                    results.push(`ストーリー ${storyID}: データなし`);
                }
            })
            .catch(err => {
                console.error(`ストーリー ${storyID} の取得に失敗:`, err);
                results.push(`ストーリー ${storyID}: 取得エラー`);
            });

        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        alert(results.join("\n"));
    });
})();

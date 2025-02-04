(() => {
    const storyBaseURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=";
    const memoryBaseURL = "https://ongeki-net.com/ongeki-mobile/record/memoryChapterDetail/?idx=";
    
    const storyIDs = [1, 2, 3, 4, 5]; // ストーリーID一覧
    const memoryIDs = [
        { id: 70001, name: "Spring Memory" },
        { id: 70002, name: "Summer Memory" },
        { id: 70003, name: "Autumn Memory" },
        { id: 70004, name: "Winter Memory" },
        { id: 70005, name: "O.N.G.E.K.I. Memory" },
        { id: 70006, name: "END CHAPTER" }
    ];
    
    let results = new Array(storyIDs.length + memoryIDs.length); // 順番を保持する配列
    let promises = [];

    const fetchJewelCount = (url, index, label) => {
        let promise = fetch(url)
            .then(res => res.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const jewelElement = doc.querySelector('.story_jewel_block span');

                if (jewelElement) {
                    results[index] = `${label}: ${jewelElement.innerText} ジュエル`;
                } else {
                    results[index] = `${label}: 解放されていません`;
                }
            })
            .catch(err => {
                console.error(`${label} の取得に失敗:`, err);
                results[index] = `${label}: 取得エラー`;
            });

        promises.push(promise);
    };

    // ストーリー取得
    storyIDs.forEach((storyID, index) => {
        fetchJewelCount(storyBaseURL + storyID, index, `ストーリー第${storyID}章`);
    });

    // Memory シリーズ取得
    memoryIDs.forEach((memory, index) => {
        fetchJewelCount(memoryBaseURL + memory.id, storyIDs.length + index, memory.name);
    });

    Promise.all(promises).then(() => {
        alert(results.join("\n"));
    });
})();

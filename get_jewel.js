(() => {
    const storyURL = "https://ongeki-net.com/ongeki-mobile/record/storyDetail/?story=5";

    fetch(storyURL)
        .then(res => res.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const jewelElement = doc.querySelector('.story_jewel_block span');

            if (jewelElement) {
                alert('ジュエル数: ' + jewelElement.innerText);
            } else {
                alert('ジュエル情報が見つかりません。');
            }
        })
        .catch(err => {
            console.error('エラー:', err);
            alert('ジュエル情報の取得に失敗しました。');
        });
})();

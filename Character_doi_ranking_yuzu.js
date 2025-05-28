(function() {
    if (!location.href.startsWith("https://ongeki-net.com/ongeki-mobile/")) {
        alert("このスクリプトはオンゲキNETのみ使用できます。");
        return;
    }

    (async () => {
        const baseUrl = "https://ongeki-net.com/ongeki-mobile/ranking/intimate/";
        const characterIds = 1001; // 柚子固定
        const rankingType = 99;

        // 親密度画像解析関数
        function parseFriendlyImages(images) {
            let friendly = 0;

            // 10000の位 (img.pos3)
            const pos3 = images.find(img => img.classList.contains("pos3"));
            if (pos3) {
                const match = pos3.src.match(/num_(\d+)\.png/);
                if (match) friendly += parseInt(match[1]) * 10000;
            }

            // 1000の位 (img.pos02)
            const pos02 = images.find(img => img.classList.contains("pos02"));
            if (pos02) {
                const match = pos02.src.match(/num_(\d+)\.png/);
                if (match) friendly += parseInt(match[1]) * 1000;
            }

            // 100の位 (img.pos1)
            const pos1 = images.find(img => img.classList.contains("pos1"));
            if (pos1) {
                const match = pos1.src.match(/num_(\d+)\.png/);
                if (match) friendly += parseInt(match[1]) * 100;
            }

            // 10の位と1の位（classが存在しない、またはpos*が含まれない画像のみ対象）
            const numberImages = images.filter(img =>
                (!img.className || !img.className.match(/^pos/)) && img.src.includes("num_")
            );
            if (numberImages.length >= 2) {
                const match10 = numberImages[numberImages.length - 2].src.match(/num_(\d+)\.png/);
                const match1 = numberImages[numberImages.length - 1].src.match(/num_(\d+)\.png/);
                if (match10) friendly += parseInt(match10[1]) * 10;
                if (match1) friendly += parseInt(match1[1]);
            }


            return friendly;
        }

        async function fetchCharacterNameAndFriendly(idx) {
            const url = `${baseUrl}?idx=${idx}&rankingType=${rankingType}`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch data");
                const html = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");

                const characterElement = doc.querySelector(".m_5.f_15.ranking_kind_name");
                const playerNameElement = doc.querySelector(".ranking_inner_table.f_14 tbody tr td.t_l");
                const playerName = playerNameElement ? playerNameElement.innerText.trim() : "プレイヤー名不明";

                const deluxeContainer = doc.querySelector('.character_friendly_deluxe_container');
                let friendlyScore = 0;
                if (deluxeContainer) {
                    const images = Array.from(deluxeContainer.querySelectorAll('img'));
                    friendlyScore = parseFriendlyImages(images);
                }

                const characterName = characterElement ? characterElement.innerText.trim() : `キャラ名不明 (idx=${idx})`;
                return { characterName, playerName, friendlyScore };
            } catch (error) {
                console.error(`Error fetching data for idx=${idx}:`, error);
                return { characterName: `取得失敗 (idx=${idx})`, playerName: "取得失敗", friendlyScore: 0 };
            }
        }

        const result = await fetchCharacterNameAndFriendly(characterIds);
        alert(`キャラ: ${result.characterName}\nプレイヤー: ${result.playerName}\n親密度: ${result.friendlyScore}`);
    })();
})();

// 難易度ごとのIDと名前を対応づけ
const difficulties = [
    { id: "basic",    name: "basic" },
    { id: "advanced", name: "advanced" },
    { id: "expert",   name: "expert" },
    { id: "master",   name: "master" }
];

// 曲名を取得
const songTitleElement = document.querySelector(
    ".wrapper.main_wrapper.t_c .container3 .m_10.t_l .w_260.f_l.p_5 .m_5.f_14.break"
);
const songTitle = songTitleElement ? songTitleElement.textContent.trim() : "曲名不明";

difficulties.forEach(diff => {
    const block = document.querySelector(`.wrapper.main_wrapper.t_c #${diff.id}`);
    if (block) {
        // 「最終プレイ日時：」の次の <td>
        const dateCell = block.querySelector("table td:nth-child(2)");
        if (dateCell) {
            console.log(`${songTitle} | ${diff.name} の最終プレイ日時: "${dateCell.textContent.trim()}"`);
        } else {
            console.log(`${songTitle} | ${diff.name} の最終プレイ日時: "データなし"`);
        }
    }
});

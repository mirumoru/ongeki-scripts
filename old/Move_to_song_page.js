// wrapper > container3 内の 楽曲ボタンをすべて取得
const divs = document.querySelectorAll(".wrapper.main_wrapper.t_c .container3 [class*='basic_btn']");

for (const div of divs) {
    // 条件: class名に「score_table」を含むtableがあるか？
    if (div.querySelector("table[class*='score_table']")) {
        const form = div.querySelector("form");
        const baseUrl = form.action;
        const idxValue = form.querySelector("input[name='idx']").value;
        const url = baseUrl + "?idx=" + encodeURIComponent(idxValue);

        // ページ遷移して終了
        window.location.href = url;
        break;
    }
}

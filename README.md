# オンゲキNETスクリプト<br>
このスクリプトはオンゲキNET上で使えます。ご自由にお使いください。<br>
以下のJSコードをブックマークのURL部分に貼り付けて、オンゲキNET上でログインした状態でブックマークを呼び出すとスクリプトが実行されます。<br>
このソースコードはChatGPTを使用しています。<br>
重大な不具合修復以外や追加機能は気まぐれの更新です。<br>
このスクリプトは個人的に作った非公式ツールです。SEGA様及び関係者様には一切関係ございません。<br>

## 各章ジュエル表示
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/get_jewels.js";document.body.appendChild(s);})();  
```
## DDF&DDAジュエル計算
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/jewel_calculator.js";document.body.appendChild(s);})();  
```

## 各キャラクター全国1位表  
ゲキチュウマイ-NET スタンダードコースの登録が必要です。  
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/Character_doi_ranking.js";document.body.appendChild(s);})();
```

## ランキング取得  
### バトルポイントランキング  
ゲキチュウマイ-NET スタンダードコースの登録が必要です。  
別タブにて取得したランキングが表示されます。
ページの下部にhtmlとして保存するボタンがあります。  
いろんな県や店舗でバトルランク / ポイントやレーティングのランキングデータを保存したりして旅の記録にしてみてください。
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/Battle_ranking_acquisition_script.js";document.body.appendChild(s);})();
```
### レーティングランキング  
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/Rating_Ranking_acquisition_script.js";document.body.appendChild(s);})();
```

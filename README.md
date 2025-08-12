# オンゲキNETスクリプト<br>
このスクリプトはオンゲキNET上で使えます。ご自由にお使いください。<br>
以下のJSコードをブックマークのURL部分に貼り付けて、オンゲキNET上でログインした状態でブックマークを呼び出すとスクリプトが実行されます。<br>
このソースコードはChatGPTを使用し開発しています。<br>
重大な不具合修復以外や追加機能は気まぐれの更新です。<br>
このスクリプトは個人的に作った非公式ツールです。SEGA様及び関係者様には一切関係ございません。<br>

## 各章ジュエル表示
しずくの数も取得するようにしました。<br>
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/get_jewels.js";document.body.appendChild(s);})();  
```
## DDF&DDAジュエル計算
正確ではない可能性があります。ご注意ください。<br>
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/jewel_calculator.js";document.body.appendChild(s);})();  
```

## 各キャラクター全国1位表  
ゲキチュウマイ-NET スタンダードコースの登録が必要です。  
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/Character_doi_ranking.js";document.body.appendChild(s);})();
```

## ランキング取得  
ゲキチュウマイ-NET スタンダードコースの登録が必要です。  
取得したランキングが別タブで表示されます。
ページの下部にhtmlとして保存するボタンがあります。  
いろんな県や店舗でバトルランク / ポイントやレーティングのランキングデータを保存したりして旅の記録にしてみてください。
### バトルポイントランキング  
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/Battle_ranking_acquisition_script.js";document.body.appendChild(s);})();
```
### レーティングランキング  
```
javascript:(()=>{let s=document.createElement('script');s.src="https://mirumoru.github.io/ongeki-scripts/Rating_Ranking_acquisition_script.js";document.body.appendChild(s);})();
```

## カード情報取得 (準備中)
オンゲキカード図鑑から取得したカード番号を[Card_ID_and_name](Card_ID_and_name)から探しカード名を別タブで表示されます。  
Card_ID_and_nameにあるjsoncファイルはご自由に使っても構いませんが何らかの損害が発生した場合、一切責任を負いません。自己責任でお願いします。  

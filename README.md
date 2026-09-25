# 不存在的壹壹貳陸：網頁版發布

這個資料夾是 Unity WebGL 遊戲成品，可以放上 GitHub Pages，讓玩家直接開連結遊玩。

## 第一次發布

1. 在 GitHub 建立一個公開（Public）儲存庫，例如 `vtuber-birthday`。
2. 解壓縮成品，將裡面的 **index.html、Build 資料夾、.nojekyll、README.md** 一起上傳到儲存庫最外層。不要只上傳 ZIP，也不要把整個 Unity 專案上傳。
3. 在儲存庫進入 **Settings → Pages**。
4. Source 選 **Deploy from a branch**；Branch 選 **main**，資料夾選 **/(root)**，按 **Save**。
5. 等 GitHub 的 Pages 部署完成，在同一頁點選 **Visit site**。把那個網址分享給玩家。

網址通常是 `https://你的帳號.github.io/儲存庫名稱/`。請以 Pages 設定頁顯示的實際網址為準。

最外層應該像這樣：

```text
index.html
.nojekyll
README.md
Build/
    Web.loader.js
    Web.data.unityweb
    Web.framework.js.unityweb
    Web.wasm.unityweb
```

若看不到 `.nojekyll`，可在 GitHub 用 Add file → Create new file 建立同名空白檔案。

## 更新遊戲

把新成品的 `index.html` 與整個 `Build` 資料夾更新到相同儲存庫，保留 `.nojekyll`。提交後，GitHub Pages 會重新部署，遊玩網址不變。若瀏覽器仍顯示舊版，請重新整理或清除該網站快取。

## 本機與遊戲注意事項

- 請透過網站網址開啟；直接雙擊 `index.html` 不適用於 Unity WebGL。
- 本版包含 Gzip 解壓 fallback，可在一般靜態網站載入，不需要另設壓縮回應標頭。
- F1 俄羅斯方塊直接過關僅供 Unity Editor 測試，網頁版不包含此捷徑。
- 「回到最終房間」目前保留在當次遊玩期間；重新載入網頁會重置。
- 網頁版測試環境與結果請看交付時的驗證說明；未驗證的手機與其他瀏覽器仍需實機測試。

GitHub 官方說明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

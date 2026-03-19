# GitHub Actions 学習メモ

このファイルは、このリポジトリで GitHub Actions を練習した流れと、その中で学んだことを後から見返せるようにまとめたメモです。

## この練習でやったこと

最終的に、このリポジトリで次の流れを確認できました。

- `push` と `pull_request` で自動テストが動く
- PR作成時に OpenAI API を使った AIレビューが走る
- `main` へ入ると GitHub Pages へ自動デプロイされる
- AIレビューの指摘を受けて修正し、再pushや再実行でチェックが通る

## 作ったもの

このリポジトリには、練習用として次のものを追加しました。

- 静的サイト
  - `index.html`
  - `styles.css`
  - `script.js`
- Node の最小テスト
  - `package.json`
  - `test/script.test.js`
- GitHub Actions workflow
  - `CI / Test`
  - `PR / AI Review`
  - `Deploy / GitHub Pages`
- AIレビュー用スクリプト
  - `.github/scripts/ai-review.mjs`

## 進めた流れ

### 1. 空ディレクトリから始めた

最初はこのディレクトリが空で、Git管理もされていませんでした。

やったこと:

- 静的サイトの最小構成を作成
- `npm test` で動く単体テストを追加
- GitHub Actions の workflow を追加
- README を追加

### 2. Git を初期化して GitHub に push した

最初にやった Git の流れ:

- `git init -b main`
- `git add .`
- `git commit -m "Initial commit: GitHub Actions practice setup"`
- GitHub リポジトリを作成
- SSH 鍵を作って GitHub に登録
- `git remote add origin ...`
- `git remote set-url origin ...`
- `git push -u origin main`

この流れは別ファイルの [GIT_AND_SSH_SETUP.md](/home/ryu/projects/GithubActions/GIT_AND_SSH_SETUP.md) に1コマンドずつ説明を書いてあります。

### 3. CI と Pages デプロイを確認した

確認したこと:

- `CI / Test` は成功した
- 最初は `Deploy / GitHub Pages` が失敗した
- 原因は GitHub Pages が有効化されていなかったこと
- `Settings > Pages` で Source を `GitHub Actions` にしたら動いた

学習ポイント:

- workflow が正しくても、GitHub 側の設定が足りないと失敗する
- Actions のエラーは、コード側の問題とは限らない

### 4. AIレビュー workflow を動かした

最初に起きた問題:

- PR にコメントを書こうとして `403 Resource not accessible by integration` が出た

原因:

- workflow 権限が足りなかった
- `pull_request_target` は PRブランチではなく、ベースブランチ (`main`) 側の workflow 定義で動く

ここで学んだこと:

- `pull_request` と `pull_request_target` は動き方が違う
- Secrets を使う workflow では `pull_request_target` を使うことがある
- ただしその場合、PRブランチで直した workflow はそのPR自身には効かない

### 5. AIレビューを確認するためのPRを作った

AIレビュー確認のために、小さい変更を含むPRを作りました。

確認できたこと:

- `test` が通る
- `review` が PR にコメントを付ける
- OpenAI API の利用枠不足だと `429 insufficient_quota` になる

学習ポイント:

- AIレビューは GitHub Actions の仕組みだけではなく、OpenAI API の利用状況にも依存する
- APIキーが正しくても、課金や利用枠の問題で失敗することがある

### 6. workflow 名を見やすくした

最初は Actions 画面で名前が分かりづらかったので、次の名前に整理しました。

- `CI / Test`
- `PR / AI Review`
- `Deploy / GitHub Pages`

学習ポイント:

- workflow 名は見やすさに直結する
- Actions 画面で何が起きているか理解しやすくなる

### 7. branch protection を設定した

GitHub の新しい UI では classic rule ではなく ruleset 画面になっていました。

最終的に required checks として追加したもの:

- `test`
- `review`

ここで学んだこと:

- required checks で表示される名前は workflow 名ではなく job 名や check 名になることがある
- 今回は `CI / Test` ではなく `test`、`PR / AI Review` ではなく `review` が候補になった

### 8. わざと壊したPRを作って CI 失敗を確認した

テストの期待値をわざと壊して、`CI / Test` が落ちるPRを作りました。

変更内容:

- `assert.equal(items.length, 3);`
- を
- `assert.equal(items.length, 4);`
- に変更

結果:

- `test` が失敗した
- `review` も危険な変更として `fail` にした

AIレビューの内容:

- 「期待件数が 4 になっているのに、期待ID一覧は3件のままで不整合」
- という指摘を日本語で返した

学習ポイント:

- AIレビューが実際の不整合を見つけられる
- `test` と `review` の両方が落ちるケースを体験できた

### 9. AIレビューの指摘を修正して再pushした

そのあと、AIレビューの指摘どおりにテスト期待値を元に戻しました。

結果:

- ローカルの `npm test` が成功
- 同じPRブランチに push すると、自動で再チェックされた

ここで学んだこと:

- 開いているPRのブランチに push すると、PRは自動更新される
- `push` と `synchronize` によって CI と AIレビューが再実行される

### 10. AIレビューを日本語化した

AIレビューコメントを英語から日本語に変えました。

やったこと:

- プロンプトで summary / title / body を日本語で出すよう指定
- コメント見出しやラベルも日本語に変更

結果:

- PRコメントが日本語になった
- たとえば `判定: pass`、`指摘はありません。` などの表示になった

## 学んだこと

### ローカルのテストと GitHub Actions のテストは両方やる

質問:
単体テストってローカルでしないの？ Actions でだけやるの？

答え:
両方やるのが基本です。

- ローカルテスト
  - 自分がすぐ確認するため
  - 修正してすぐ試せる
- GitHub Actions のテスト
  - GitHub上で同じ条件で自動確認するため
  - PRごとに共通のチェックとして使える

おすすめの流れ:

- まずローカルで `npm test`
- 問題なければ push
- GitHub Actions でも同じテストを再確認

### PR は Git ではなく GitHub の機能

質問:
PRってクライアントから git コマンドで出すのではなく、GitHub でやるものなの？

答え:
PR は Git の機能ではなく GitHub の機能です。

一般的な流れ:

- ローカルでブランチを作る
- commit する
- push する
- GitHub 上で PR を作る

補足:

- `gh pr create` のような GitHub CLI でも作れる
- でも本質的には GitHub 側の機能

### 開いている PR に push すると何が起きるか

質問:
push したら自動でテストが走った。もう open してるから？

答え:
はい、そのとおりです。

今回の設定では:

- `push` で `test` が走る
- `pull_request` / `pull_request_target` で PR向けのチェックも走る

そのため、PRブランチに push すると:

- ブランチへの `push` として `test` が動く
- PR更新 (`synchronize`) として `review` も動く

### AIレビューは何を見ているのか

質問:
AIチェックは差分を見てるの？全部見てるの？

答え:
今回の実装では、基本的に PR の差分を見ています。

具体的には:

- GitHub API で changed files を取得
- 各ファイルの patch を取得
- その差分を OpenAI API に送る

つまり:

- リポジトリ全体を丸ごと見ているわけではない
- PRで変わった差分中心にレビューしている

### テストと AIレビューのコストの違い

質問:
test はお金がかかるの？ GitHub が無料でしてるの？

答え:

- `test`
  - OpenAI API は使わない
  - OpenAI の料金はかからない
  - GitHub Actions の実行時間は消費する
- `review`
  - OpenAI API を使う
  - OpenAI の料金がかかる
  - GitHub Actions の実行時間も使う

つまり:

- `test` は GitHub Actions の利用分だけ
- `review` は GitHub Actions + OpenAI API の両方

### AIレビューのコストを下げる方法

教えてもらった3案:

1. 差分が小さい PR だけ AIレビューする
2. もっと軽いモデルを使う
3. 実行タイミングを減らす

## ハマりどころ

今回ハマったポイントをまとめると次のとおりです。

### 1. Pages が有効化されていない

症状:

- `configure-pages` で失敗

原因:

- GitHub Pages の Source が `GitHub Actions` になっていなかった

### 2. `.github/workflows/` を含む push が拒否された

症状:

- HTTPS push 時に workflow scope が足りないエラー

対処:

- SSH 認証に切り替えた

### 3. `pull_request_target` の仕様が分かりづらい

症状:

- PRブランチで直した workflow が、そのPR自身には反映されなかった

原因:

- `pull_request_target` は `main` 側の workflow 定義で動くため

### 4. required checks で表示名が違う

症状:

- `CI / Test` が候補に出ず、`test` が出た

原因:

- branch protection の required checks は workflow 名ではなく check 名で表示されることがあるため

### 5. AIレビューの誤検知

症状:

- 空行削除を大げさに `high` 判定した

学び:

- AIレビューは便利だが、常に完全ではない
- 誤検知を前提に運用方針を考える必要がある

## AIレビューの運用について

今回の体験から、AIレビューは次のように考えるのが良さそうです。

- 便利な補助レビューとして使う
- ただし誤検知はありうる
- 本当に必須チェックにするかは運用次第

考えられる運用:

- `test` は必須
- `review` は参考コメント寄りにする
- あるいは `review` は fail するが、管理者が最終判断する

## ブランチ整理について

質問:
ローカルブランチを整理するって何？

答え:
役目の終わったブランチを消して、一覧を見やすくすることです。

今回のようにブランチが増えると:

- `git branch` の一覧が長くなる
- どれが今使っているブランチか分かりにくくなる
- 間違って古いブランチで作業しやすくなる

必須ではないですが、見通しをよくするために役立ちます。

## 今回の練習でできるようになったこと

- GitHub Actions でテストを自動実行する
- GitHub Pages へ自動デプロイする
- OpenAI API を使った AIレビューを PR に組み込む
- `pull_request_target` の基本的な挙動を理解する
- PR を使って変更を確認し、レビュー指摘を受けて修正する
- branch protection で required checks を設定する

## 次にやると理解が深まること

- `review` を「コメントのみ」にする版も試す
- AIレビューのプロンプトを改善して誤検知を減らす
- `push` と `pull_request` の二重実行を減らすよう workflow を調整する
- 不要になったローカルブランチを整理する

## ひとことメモ

今回の練習で特に大事だったのは、

- ローカルでまず確認する
- GitHub Actions で自動確認する
- PR で変更を流し、結果を見ながら直す

という流れです。

この流れが作れると、GitHub Actions は「難しい設定ファイル」ではなく、「開発の進め方を自動化する仕組み」として理解しやすくなります。

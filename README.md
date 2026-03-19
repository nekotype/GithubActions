# GitHub Actions Practice

GitHub Actionsの基本をまとめて練習するための最小サンプルです。以下の3つを一つのリポジトリで体験できます。

- `ci`: `push` と `pull_request` で `npm test` を実行
- `ai-review`: PR差分をOpenAI APIへ送り、AIレビューコメントを投稿
- `deploy`: `main` へマージされた静的サイトをGitHub Pagesへ公開

## ローカルで試す

```bash
npm install
npm test
```

静的サイトはブラウザで `index.html` を開くだけでも確認できます。簡易サーバーを使う場合は次のように起動します。

```bash
python3 -m http.server
```

## GitHub側のセットアップ

1. このディレクトリを新しいGitHubリポジトリとして `main` ブランチ付きでpushする
2. Repository Settings > Pages で Source を `GitHub Actions` にする
3. Repository Settings > Secrets and variables > Actions に `OPENAI_API_KEY` を追加する
4. 必要なら Repository Variables に `OPENAI_MODEL` を追加する
   - 未設定時は workflow 側で `gpt-4.1-mini` を既定値として使います
5. Branch protection rules で `main` に対して `ci` と `ai-review` を required checks に設定する

## 各workflowの役割

### `ci.yml`

- `push` と `pull_request` で起動
- Node.jsをセットアップ
- `npm install` と `npm test` を実行

### `ai-review.yml`

- `pull_request_target` で起動
- PRブランチのコードは実行せず、ベースブランチ上の安全なスクリプトだけを使う
- GitHub APIからPR差分を取得し、OpenAI Responses APIへ送る
- PRに要約と指摘をコメントする
- `high` 指摘があるか、安全に判定できない場合はworkflowを失敗させる

### `deploy.yml`

- `main` への push で起動
- 静的ファイルをGitHub Pagesへデプロイ

## AIレビューのJSON契約

AIレビュー用スクリプトは、モデルに次の形式のJSONを返すよう求めます。

```json
{
  "summary": "PR全体の短い要約",
  "findings": [
    {
      "severity": "high",
      "file": "script.js",
      "line": 10,
      "title": "問題の要約",
      "body": "なぜ危険かの説明"
    }
  ],
  "verdict": "fail"
}
```

`severity` は `high` / `medium` / `low`、`verdict` は `pass` / `fail` を想定しています。

## 注意点

- AIレビューは人間レビューの補助です
- 差分が大きすぎる場合や解析に失敗した場合は、安全側に倒して `fail` にします
- `pull_request_target` は強力なので、PRコードをcheckoutして実行しない構成にしています

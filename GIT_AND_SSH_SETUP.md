# Git / SSH セットアップ手順メモ

このファイルは、このリポジトリを GitHub に初回 push するまでに使ったコマンドを、1つずつ説明するためのメモです。

## 1. Git のユーザー設定を確認する

```bash
git config --get user.name
```

意味:
Git のコミットに使われるユーザー名を表示します。

```bash
git config --get user.email
```

意味:
Git のコミットに使われるメールアドレスを表示します。

## 2. リポジトリを初期化する

```bash
git init -b main
```

意味:
今いるディレクトリを Git 管理の対象にします。`-b main` は最初のブランチ名を `main` にする指定です。

補足:
これを実行すると `.git` ディレクトリが作られます。ここに Git の履歴や設定が入ります。

## 3. いまの状態を確認する

```bash
git status --short --branch
```

意味:
どのブランチにいるか、どのファイルが未追跡か、どのファイルが変更されたかを短く表示します。

補足:
`??` は「まだ Git に追加されていないファイル」です。

## 4. 変更をステージする

```bash
git add .
```

意味:
今のディレクトリ以下の変更を、次のコミット対象としてまとめて登録します。

補足:
`add` は「コミットする候補に入れる」という意味で、まだ履歴には保存されていません。

## 5. 最初のコミットを作る

```bash
git commit -m "Initial commit: GitHub Actions practice setup"
```

意味:
ステージ済みの変更を 1 つの履歴として保存します。

補足:
`-m` はコミットメッセージをその場で指定するオプションです。

## 6. リモート設定を確認する

```bash
git remote -v
```

意味:
GitHub などの接続先リポジトリが登録されているかを表示します。

補足:
最初は何も出ないことが多いです。

## 7. SSH 用のディレクトリを作る

```bash
mkdir -p ~/.ssh
```

意味:
SSH 鍵を保存するための `~/.ssh` ディレクトリを作ります。

補足:
`-p` を付けると、すでに存在していてもエラーになりません。

```bash
chmod 700 ~/.ssh
```

意味:
`~/.ssh` ディレクトリの権限を「自分だけ読める・使える」状態にします。

補足:
SSH は権限が緩すぎると安全でないとして拒否することがあります。

## 8. SSH 鍵を作る

```bash
ssh-keygen -t ed25519 -C "46503254+nekotype@users.noreply.github.com"
```

意味:
GitHub 接続用の SSH 鍵ペアを作ります。

補足:
- `-t ed25519` は鍵の種類です
- `-C` はコメントで、誰の鍵か分かりやすくするためのメモです
- 通常は `~/.ssh/id_ed25519` と `~/.ssh/id_ed25519.pub` が作られます

## 9. SSH エージェントを起動する

```bash
eval "$(ssh-agent -s)"
```

意味:
秘密鍵をメモリ上で管理してくれる SSH エージェントを起動します。

補足:
毎回ファイルを直接読ませるより、エージェントに鍵を持たせる方が扱いやすいです。

## 10. 秘密鍵を SSH エージェントに登録する

```bash
ssh-add ~/.ssh/id_ed25519
```

意味:
作成した秘密鍵を SSH エージェントに読み込ませます。

補足:
これで Git や SSH がその鍵を使えるようになります。

## 11. 公開鍵を表示する

```bash
cat ~/.ssh/id_ed25519.pub
```

意味:
GitHub に登録するための公開鍵を表示します。

補足:
`.pub` の方が公開鍵です。こちらは GitHub に貼って大丈夫です。
秘密鍵の `id_ed25519` の方は公開してはいけません。

## 12. GitHub のホスト鍵を known_hosts に登録する

```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

意味:
GitHub サーバーの公開ホスト鍵を `known_hosts` に追加します。

補足:
初回接続時の確認で詰まるときに使うと安定します。

```bash
chmod 600 ~/.ssh/known_hosts
```

意味:
`known_hosts` を自分だけが読める設定にします。

## 13. GitHub に SSH 接続できるか確認する

```bash
ssh -T git@github.com
```

意味:
GitHub に SSH 認証できるか確認します。

補足:
成功すると、`You've successfully authenticated` という内容のメッセージが出ます。
GitHub はシェルログイン先ではないので、ログイン自体はできなくて正常です。

## 14. GitHub リポジトリを origin に登録する

```bash
git remote add origin https://github.com/nekotype/GithubActions.git
```

意味:
このローカルリポジトリの接続先として GitHub リポジトリを `origin` という名前で登録します。

補足:
最初は HTTPS で登録しました。

## 15. SSH 接続用の URL に切り替える

```bash
git remote set-url origin git@github.com:nekotype/GithubActions.git
```

意味:
`origin` の接続先を HTTPS から SSH に変更します。

補足:
`.github/workflows/` を含む push では、認証方法によっては拒否されることがあります。今回は SSH に切り替えることで解決しました。

## 16. GitHub に初回 push する

```bash
git push -u origin main
```

意味:
ローカルの `main` ブランチを GitHub の `origin` に送ります。

補足:
- `origin` は接続先の名前です
- `main` は送るブランチ名です
- `-u` を付けると、次回以降は `git push` や `git pull` だけで追跡先が分かるようになります

## 17. いま覚えておくと便利な最小セット

よく使うのはまずこの4つです。

```bash
git status
git add .
git commit -m "メッセージ"
git push
```

意味:
- `git status`: いま何が起きているか確認する
- `git add .`: 次のコミットに含める変更を選ぶ
- `git commit -m "...": 変更を履歴として保存する
- `git push`: GitHub に送る

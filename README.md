# LoL Counter Insights

LoLのカウンターピック確認に特化したミニマルなWebアプリ

## クイックスタート（2回目以降）

ターミナルで以下を実行:

```bash
npm install
npm run dev
```

http://localhost:5173 をブラウザで開く

---

## 初回セットアップ（環境構築）

### 1. Homebrewのインストール（未インストールの場合）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Voltaのインストール（未インストールの場合）

```bash
brew install volta
```

シェル設定ファイル（`~/.zshrc` など）に以下を追加:

```bash
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

設定を反映:

```bash
source ~/.zshrc
```

### 3. Node.jsのインストール

```bash
volta install node
```

### 4. プロジェクトのセットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

http://localhost:5173 でアクセス

## ビルド

```bash
npm run build
```

## 技術スタック

- React + TypeScript
- Vite
- Riot Games Data Dragon API

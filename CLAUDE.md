# LoL Counter Insights

LoLのカウンターピック確認に特化したミニマルなWebアプリ。
日本語のみ対応。ターゲットはアイアン〜シルバー帯のプレイヤー。

## 技術スタック

- React + TypeScript + Vite
- Riot Games Data Dragon API
- デプロイ: Cloudflare Pages

## プロジェクト構造

- `src/data/champions.json` - チャンピオン愛称・相性データ
- `src/utils/` - ユーティリティ関数
- `Doc/kickoff.md` - プロジェクト詳細仕様

## 開発ルール

- 日本語UIを維持
- シンプルさ優先（最小要件で実装）
- DDragon APIバージョンは定数管理（`DDRAGON_VERSION`）

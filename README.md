# Kanshi

Netlify Functions + Blobsで動く最小限の稼働監視ツール

## セットアップ

Project configuration → Environment variablesでMONITORSを設定（書式は.env.example参照）してデプロイしてください

## 開発

```bash
npm install
cp .env.example .env
DEV_MODE=trueを.envに追記
npm run dev
```

DEV_MODE有効時はBlobsに接続せずモックデータで動作します

## 通知

DISCORD_WEBHOOK_URLを設定すると、NOTIFY_AFTER_FAILURES回（デフォルト5回）連続失敗/復帰時にDiscordへ通知します。

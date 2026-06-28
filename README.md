# LINE スタンプ デイリージェネレーター

トレンドキーワードを分析し、LINEクリエイターズマーケットの仕様に沿った
スタンプ画像セットを毎日自動生成する仕組み。

## 構成

1. **トレンド取得** (`src/lib/trends.js`) — Google Trends（日本）の急上昇キーワードを取得。
   取得に失敗した場合は固定のフォールバックキーワードを使う。
2. **企画** (`src/lib/stickerPlanner.js`) — トレンドのトップキーワードをテーマに、
   定番の8表現（おはよう／ありがとう／お疲れ様 など）でスタンプ案を組み立てる。
3. **画像生成** (`src/lib/imageProviders/`) — `IMAGE_PROVIDER` 環境変数で切り替え可能。
   - `mock`（デフォルト・APIキー不要）: プレースホルダー画像を生成し、パイプライン全体を検証できる。
   - `openai`: OpenAI Images API（`OPENAI_API_KEY` が必要）。
   - `stability`: Stability AI Image API（`STABILITY_API_KEY` が必要）。
4. **出力** — `public/output/<YYYY-MM-DD>/` に各スタンプPNGと `manifest.json` を保存し、
   `public/output/index.json` に生成済み日付一覧を追記する。

画像サイズは LINE のスタンプ仕様（370×320px）に準拠（`src/lib/lineStickerSpec.js`）。

## 実行方法

```bash
npm install
npm run generate:daily
```

## 結果の確認（ギャラリーUI）

```bash
npm run dev
```

生成済みのスタンプセットを一覧・プレビューできる簡易ギャラリー（`src/App.jsx`）が起動する。

## 毎日の自動実行

`.github/workflows/daily-sticker-generation.yml` が GitHub Actions の cron
（デフォルト: 毎日 06:00 JST）で `npm run generate:daily` を実行し、
生成された `public/output/` の差分をリポジトリへコミットする。

- 実プロバイダを使う場合は、リポジトリの Variables に `IMAGE_PROVIDER`
  （`openai` または `stability`）を設定し、対応する Secrets
  （`OPENAI_API_KEY` / `STABILITY_API_KEY`）を登録する。
- 何も設定しない場合は `mock` プロバイダで動作確認用の画像が生成され続ける。

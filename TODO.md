# AI Chat App 構築 TODO

## 技術スタック
- **フレームワーク**: Next.js (App Router) + TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Claude API (Anthropic SDK)
- **パッケージマネージャー**: npm

---

## フェーズ 1: プロジェクトセットアップ

- [x] `git init` でリポジトリ初期化
- [x] `create-next-app` でNext.jsプロジェクト生成
- [x] Anthropic SDKのインストール (`npm install @anthropic-ai/sdk`)
- [x] `.env.local` に `ANTHROPIC_API_KEY` を設定
- [x] `.gitignore` に `.env.local` を追加
- [x] GitHubにリモートリポジトリを作成してプッシュ

---

## フェーズ 2: バックエンド（API Routes）

- [x] `src/app/api/chat/route.ts` を作成
  - [x] POST エンドポイント実装
  - [x] Anthropic SDK でメッセージ送受信
  - [x] ストリーミングレスポンス対応
  - [x] エラーハンドリング

---

## フェーズ 3: フロントエンド（UIコンポーネント）

- [x] `src/components/ChatWindow.tsx` — メッセージ一覧表示
  - [x] ユーザー / アシスタントのメッセージ表示
  - [x] スクロール制御（最新メッセージへ自動スクロール）
- [x] `src/components/MessageInput.tsx` — 入力フォーム
  - [x] テキストエリア（Shift+Enterで改行、Enterで送信）
  - [x] 送信ボタン
  - [x] 送信中のローディング状態
- [x] `src/components/MessageBubble.tsx` — メッセージバブル
  - [x] Markdownレンダリング対応
  - [x] コードブロックのシンタックスハイライト
- [x] `src/app/page.tsx` — ページ組み立て

---

## フェーズ 4: 状態管理・UX改善

- [x] 会話履歴の管理（`useState` / `useReducer`）
- [x] ストリーミング表示（逐次テキスト描画）
- [x] 「新しい会話」ボタン（履歴クリア）
- [x] ローカルストレージで会話を保持

---

## フェーズ 5: スタイリング・デザイン

- [x] チャット画面レイアウト（サイドバー + メインエリア）
- [x] ダークモード対応
- [x] レスポンシブデザイン（モバイル対応）
- [x] ローディングアニメーション（タイピングインジケータ）

---

## フェーズ 6: テスト・品質

- [x] Vitestセットアップ
- [x] APIルートのユニットテスト
- [x] コンポーネントのテスト
- [x] ESLint / TypeScriptエラーの解消

---

## フェーズ 7: デプロイ（Google Cloud Run）

- [x] `next.config.ts` を standalone 出力に設定
- [x] `Dockerfile` を作成
- [x] `.dockerignore` を作成
- [x] `ANTHROPIC_API_KEY` を Secret Manager に登録
- [x] Cloud Run へデプロイ（`gcloud run deploy`）
- [x] 動作確認

---

## 完了条件

- ユーザーがメッセージを送信するとClaudeがリアルタイムに返答する
- 会話履歴が保持される
- Google Cloud Run で公開URLからアクセスできる

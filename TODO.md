# AI Chat App 構築 TODO

## 技術スタック
- **フレームワーク**: Next.js (App Router) + TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Claude API (Anthropic SDK)
- **パッケージマネージャー**: npm

---

## フェーズ 1: プロジェクトセットアップ

- [ ] `git init` でリポジトリ初期化
- [ ] `create-next-app` でNext.jsプロジェクト生成
- [ ] Anthropic SDKのインストール (`npm install @anthropic-ai/sdk`)
- [ ] `.env.local` に `ANTHROPIC_API_KEY` を設定
- [ ] `.gitignore` に `.env.local` を追加
- [ ] GitHubにリモートリポジトリを作成してプッシュ

---

## フェーズ 2: バックエンド（API Routes）

- [ ] `src/app/api/chat/route.ts` を作成
  - [ ] POST エンドポイント実装
  - [ ] Anthropic SDK でメッセージ送受信
  - [ ] ストリーミングレスポンス対応
  - [ ] エラーハンドリング

---

## フェーズ 3: フロントエンド（UIコンポーネント）

- [ ] `src/components/ChatWindow.tsx` — メッセージ一覧表示
  - [ ] ユーザー / アシスタントのメッセージ表示
  - [ ] スクロール制御（最新メッセージへ自動スクロール）
- [ ] `src/components/MessageInput.tsx` — 入力フォーム
  - [ ] テキストエリア（Shift+Enterで改行、Enterで送信）
  - [ ] 送信ボタン
  - [ ] 送信中のローディング状態
- [ ] `src/components/MessageBubble.tsx` — メッセージバブル
  - [ ] Markdownレンダリング対応
  - [ ] コードブロックのシンタックスハイライト
- [ ] `src/app/page.tsx` — ページ組み立て

---

## フェーズ 4: 状態管理・UX改善

- [ ] 会話履歴の管理（`useState` / `useReducer`）
- [ ] ストリーミング表示（逐次テキスト描画）
- [ ] 「新しい会話」ボタン（履歴クリア）
- [ ] ローカルストレージで会話を保持

---

## フェーズ 5: スタイリング・デザイン

- [ ] チャット画面レイアウト（サイドバー + メインエリア）
- [ ] ダークモード対応
- [ ] レスポンシブデザイン（モバイル対応）
- [ ] ローディングアニメーション（タイピングインジケータ）

---

## フェーズ 6: テスト・品質

- [ ] Vitestセットアップ
- [ ] APIルートのユニットテスト
- [ ] コンポーネントのテスト
- [ ] ESLint / TypeScriptエラーの解消

---

## フェーズ 7: デプロイ

- [ ] Vercel CLIのインストール・ログイン
- [ ] 環境変数（`ANTHROPIC_API_KEY`）をVercelに設定
- [ ] `vercel --prod` でデプロイ
- [ ] 動作確認

---

## 完了条件

- ユーザーがメッセージを送信するとClaudeがリアルタイムに返答する
- 会話履歴が保持される
- Vercelで公開URLからアクセスできる

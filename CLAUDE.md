# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

Claude APIを使ったAIチャットアプリ（Next.js + TypeScript）。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS v4
- **AI**: Claude API (`@anthropic-ai/sdk`)
- **テスト**: Vitest + React Testing Library
- **デプロイ先**: Google Cloud Run

## 主要コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm test           # テスト実行（vitest run）
npm run lint       # ESLint チェック
```

## ディレクトリ構成

```
src/
├── app/
│   ├── api/chat/route.ts   # Claude API ストリーミングエンドポイント
│   ├── layout.tsx           # ThemeProvider / メタデータ
│   └── page.tsx             # メインページ
├── components/
│   ├── ChatWindow.tsx       # メッセージ一覧 + 自動スクロール
│   ├── MessageBubble.tsx    # Markdown + シンタックスハイライト
│   ├── MessageInput.tsx     # テキストエリア入力フォーム
│   ├── Sidebar.tsx          # 会話一覧 + ダークモードトグル
│   └── ThemeProvider.tsx    # next-themes ラッパー
└── hooks/
    ├── useChat.ts           # useReducer ベースのチャット状態管理
    └── useConversations.ts  # 複数会話 + localStorage 永続化
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー（必須） |

## デプロイ（Google Cloud Run）

```bash
# イメージのビルド & プッシュ
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-chat

# Cloud Run へデプロイ
gcloud run deploy ai-chat \
  --image gcr.io/PROJECT_ID/ai-chat \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

## テストコード作成時の厳守事項

- テストは必ず実際の機能を検証すること
- `expect(true).toBe(true)` のような意味のないアサーションは絶対に書かない
- ハードコーディング禁止（テストを通すためだけのハードコードは不可）
- Red-Green-Refactor パターンを遵守すること

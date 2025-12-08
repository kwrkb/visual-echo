# Visual Echo - API仕様書

## 概要

このドキュメントは、Visual EchoのバックエンドAPI（Server Actions + Route Handlers）の仕様を定義します。

## 認証

現在のMVPフェーズでは認証は不要です。将来的にSupabase Authを統合する予定。

## Server Actions

Server Actionsは、Next.js 15のServer Components内で直接呼び出せる関数です。

### generations.ts

#### createGeneration

新しい画像生成リクエストを作成します。

**シグネチャ**:
```typescript
async function createGeneration(
  parentId: string | null,
  prompt: string
): Promise<{
  data: { id: string } | null;
  error: string | null;
}>
```

**パラメータ**:
- `parentId` (string | null): 親画像のID。nullの場合は新しいルート画像
- `prompt` (string): ユーザーが入力した画像の説明文（1-1000文字）

**レスポンス**:
```typescript
{
  data: {
    id: "550e8400-e29b-41d4-a716-446655440000"
  },
  error: null
}
```

**エラー例**:
```typescript
{
  data: null,
  error: "Prompt is required and must be between 1 and 1000 characters"
}
```

**バリデーション**:
- プロンプトは1-1000文字
- parentIdが指定された場合、存在確認
- 同一parent_idに対して同時に複数生成不可（オプション）

---

#### generateImage

Gemini APIを使用して画像を生成し、Storageに保存します。

**シグネチャ**:
```typescript
async function generateImage(
  generationId: string
): Promise<{
  data: { imageUrl: string } | null;
  error: string | null;
}>
```

**パラメータ**:
- `generationId` (string): 対象のgeneration ID（status: pending）

**レスポンス**:
```typescript
{
  data: {
    imageUrl: "https://project.supabase.co/storage/v1/object/public/generated-images/abc123.jpg"
  },
  error: null
}
```

**処理フロー**:
1. generationIdのレコード取得（status確認）
2. promptを使ってGemini APIに画像生成リクエスト
3. 生成された画像URLを取得
4. 画像をダウンロード
5. Supabase Storageにアップロード
6. DBのimage_urlとstatusを更新（completed）

**エラーケース**:
- `generation not found`: 指定IDが存在しない
- `generation already completed`: すでに完了済み
- `API error: ...`: Gemini API側のエラー
- `upload failed: ...`: Storageアップロード失敗

---

#### getGeneration

特定の画像生成データを取得します。

**シグネチャ**:
```typescript
async function getGeneration(
  id: string
): Promise<{
  data: Generation | null;
  error: string | null;
}>
```

**パラメータ**:
- `id` (string): generation ID

**レスポンス**:
```typescript
{
  data: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    parent_id: "440e8400-e29b-41d4-a716-446655440000",
    image_url: "https://.../image.jpg",
    prompt: "A serene mountain landscape",
    created_at: "2025-12-08T12:00:00Z",
    status: "completed"
  },
  error: null
}
```

---

#### listGenerations

画像生成のリストを取得します（ページネーション対応）。

**シグネチャ**:
```typescript
async function listGenerations(
  options?: {
    parentId?: string | null;
    status?: GenerationStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{
  data: Generation[] | null;
  error: string | null;
  total?: number;
}>
```

**パラメータ**:
- `parentId` (string | null, optional): 親IDでフィルタ。nullでルートのみ
- `status` (string, optional): ステータスでフィルタ
- `limit` (number, optional): 取得件数（デフォルト: 20、最大: 100）
- `offset` (number, optional): オフセット（デフォルト: 0）

**レスポンス**:
```typescript
{
  data: [
    {
      id: "...",
      parent_id: null,
      image_url: "...",
      prompt: "...",
      created_at: "...",
      status: "completed"
    },
    // ...
  ],
  error: null,
  total: 42
}
```

---

#### getGenerationTree

指定されたIDをルートとするツリー構造を取得します。

**シグネチャ**:
```typescript
async function getGenerationTree(
  rootId: string,
  maxDepth?: number
): Promise<{
  data: GenerationNode | null;
  error: string | null;
}>
```

**パラメータ**:
- `rootId` (string): ツリーのルートとなるgeneration ID
- `maxDepth` (number, optional): 最大深度（デフォルト: 無制限）

**レスポンス**:
```typescript
{
  data: {
    id: "root-id",
    parent_id: null,
    image_url: "...",
    prompt: "...",
    created_at: "...",
    status: "completed",
    children: [
      {
        id: "child-1-id",
        parent_id: "root-id",
        // ...
        children: []
      },
      {
        id: "child-2-id",
        parent_id: "root-id",
        // ...
        children: [...]
      }
    ]
  },
  error: null
}
```

**型定義**:
```typescript
interface GenerationNode extends Generation {
  children: GenerationNode[];
}
```

---

## Route Handlers (REST API)

将来的な拡張や外部連携のためのRESTful API。

### GET /api/generations

画像生成のリストを取得。

**Query Parameters**:
- `parent_id` (string, optional): 親IDでフィルタ
- `status` (string, optional): completed | pending | failed
- `limit` (number, optional): 1-100
- `offset` (number, optional)

**Response**:
```json
{
  "data": [...],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/generations/:id

単一の画像生成データを取得。

**Path Parameters**:
- `id` (string): generation ID

**Response**:
```json
{
  "data": {
    "id": "...",
    "parent_id": "...",
    "image_url": "...",
    "prompt": "...",
    "created_at": "...",
    "status": "completed"
  }
}
```

**Error Response (404)**:
```json
{
  "error": "Generation not found"
}
```

---

### POST /api/generations

新しい画像生成リクエストを作成。

**Request Body**:
```json
{
  "parent_id": "550e8400-e29b-41d4-a716-446655440000",
  "prompt": "A beautiful sunset over the ocean"
}
```

**Response (201)**:
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "status": "pending"
  }
}
```

**Error Response (400)**:
```json
{
  "error": "Prompt is required"
}
```

---

### GET /api/generations/:id/tree

ツリー構造を取得。

**Path Parameters**:
- `id` (string): ルートとなるgeneration ID

**Query Parameters**:
- `max_depth` (number, optional): 最大深度

**Response**:
```json
{
  "data": {
    "id": "...",
    "children": [...]
  }
}
```

---

### PATCH /api/generations/:id

画像生成データを更新（主にステータス更新用）。

**Path Parameters**:
- `id` (string): generation ID

**Request Body**:
```json
{
  "status": "completed",
  "image_url": "https://..."
}
```

**Response**:
```json
{
  "data": {
    "id": "...",
    "status": "completed",
    "image_url": "..."
  }
}
```

---

### DELETE /api/generations/:id

画像生成データを削除（将来的に管理者機能として実装）。

**Path Parameters**:
- `id` (string): generation ID

**Response (204)**:
```
No Content
```

**Error Response (403)**:
```json
{
  "error": "Forbidden: Admin access required"
}
```

---

## エラーレスポンス形式

すべてのAPIエラーは以下の形式で返却されます：

```typescript
{
  error: string;           // エラーメッセージ
  code?: string;          // エラーコード（オプション）
  details?: any;          // 追加情報（オプション）
}
```

### エラーコード一覧

| コード | 説明 | HTTPステータス |
|-------|------|---------------|
| `VALIDATION_ERROR` | 入力データの検証エラー | 400 |
| `NOT_FOUND` | リソースが見つからない | 404 |
| `ALREADY_EXISTS` | 重複データ | 409 |
| `API_ERROR` | 外部API（Gemini等）のエラー | 502 |
| `STORAGE_ERROR` | Storageアップロードエラー | 500 |
| `DATABASE_ERROR` | データベースエラー | 500 |
| `RATE_LIMIT_EXCEEDED` | レート制限超過 | 429 |
| `FORBIDDEN` | 権限不足 | 403 |

---

## レート制限

### 開発環境
- 制限なし

### 本番環境
- **画像生成**: IPアドレスごとに10回/分
- **読み取り**: IPアドレスごとに100回/分

**レート制限超過時のレスポンス**:
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retry_after": 60
  }
}
```

HTTPヘッダー:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1638360000
```

---

## Webhook（将来実装予定）

画像生成完了時に外部サービスへ通知。

**エンドポイント設定**: Supabase管理画面

**Payload**:
```json
{
  "event": "generation.completed",
  "data": {
    "id": "...",
    "parent_id": "...",
    "image_url": "...",
    "prompt": "...",
    "created_at": "..."
  }
}
```

---

## SDK（将来実装予定）

TypeScript/JavaScript用のクライアントライブラリ。

```typescript
import { VisualEchoClient } from '@visual-echo/sdk';

const client = new VisualEchoClient({
  apiUrl: 'https://visual-echo.vercel.app'
});

// 画像生成
const generation = await client.generations.create({
  parentId: 'parent-id',
  prompt: 'A beautiful landscape'
});

// ツリー取得
const tree = await client.generations.getTree('root-id');
```

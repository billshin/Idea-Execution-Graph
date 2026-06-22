## Context

目前 Idea Execution Graph 前端將所有專案資料存於瀏覽器 localStorage。後端目錄 `backend/` 已建立但為空。前端使用 React + Zustand + React Flow，資料層位於 `idea-graph-app/src/persistence/` 和 `idea-graph-app/src/store/`。

專案的 snapshot 結構（`GraphSnapshot`）包含 nodes, edges, parkingLot, ideaSpace, ui，由前端 `types/graph.ts` 定義。

## Goals / Non-Goals

**Goals:**
- 建立可獨立運行的 Express 後端，提供專案 CRUD API
- 使用 SQLite 作為開發期資料庫，未來可遷移至 PostgreSQL
- 前端支援 local/api 雙模式，不破壞現有 localStorage 功能
- API 路徑使用 `/Idea-Execution-Graph/api/` 前綴

**Non-Goals:**
- 使用者認證/授權
- 即時協作（WebSocket）
- 檔案上傳
- 前端 UI 改動（除了 API 呼叫層）

## Decisions

### 1. ORM: Prisma
- **選擇**: Prisma
- **理由**: 類型安全、自動遷移、SQLite/PostgreSQL 無痛切換
- **替代方案**: Drizzle（更輕量但生態較新）、TypeORM（較重且型別推斷弱）

### 2. 資料庫: SQLite (dev)
- **選擇**: SQLite 單檔資料庫
- **理由**: 零配置、無需安裝外部服務、適合單機開發
- **替代方案**: PostgreSQL（未來正式環境使用，Prisma 切換只需改 connection string）

### 3. Snapshot 儲存方式: JSON 欄位
- **選擇**: 將整個 `GraphSnapshot` 存為 JSON 欄位
- **理由**: 前端結構複雜（nodes/edges/parkingLot），拆表成本高且無查詢需求
- **替代方案**: 將 nodes/edges 各自建表（查詢彈性高但增加複雜度，目前無此需求）

### 4. 前端整合: 資料來源抽象層
- **選擇**: 在 `projectStore.ts` 加入 mode 切換（local | api）
- **理由**: 漸進式遷移，不破壞現有功能；離線時可退回 local
- **替代方案**: 完全移除 localStorage（風險高，無離線退路）

### 5. API 路由前綴
- **選擇**: `/Idea-Execution-Graph/api/`
- **理由**: 與 GitHub Pages 部署路徑一致，方便反向代理配置

### 6. 自動保存策略
- **選擇**: 前端 debounce 800ms 後 PUT
- **理由**: 減少頻繁請求，用戶停止編輯後才送出
- **替代方案**: 定時輪詢（增加不必要請求）、WebSocket（超出此階段範圍）

## Risks / Trade-offs

- **Snapshot JSON 結構改版** → 在 snapshot 內加入 `schemaVersion` 欄位，未來可寫遷移邏輯
- **頻繁自動保存** → debounce 800ms + 僅在內容實際變更時發送
- **SQLite 並發限制** → 此階段單使用者，無並發問題；未來遷移 PostgreSQL 解決
- **離線/網路斷線** → mode=api 時若請求失敗，顯示錯誤提示；不自動退回 local（避免資料分歧）
- **CORS** → 開發期使用 cors middleware 允許 localhost；正式環境需配置白名單

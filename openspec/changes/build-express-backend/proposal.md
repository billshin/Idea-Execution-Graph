## Why

目前前端所有資料保存在 localStorage，無法跨裝置、無法備份、無法擴展為多人協作。需要建立 Express 後端 API，作為資料持久化的第一步，將專案資料從瀏覽器本地儲存遷移到伺服器端資料庫。

## What Changes

- 新增 Express + TypeScript 後端專案（`backend/` 目錄）
- 使用 Prisma + SQLite 建立 Project 資料模型
- 提供 RESTful API：健康檢查、專案 CRUD
- 前端新增 API 層，支援 localStorage / API 雙模式切換
- API 路徑統一使用 `/Idea-Execution-Graph/api/` 前綴
- 請求驗證使用 Zod

## Capabilities

### New Capabilities
- `backend-api-server`: Express 後端骨架，包含路由、中間件、錯誤處理、健康檢查端點
- `backend-project-crud`: 專案 CRUD API（GET/POST/PUT/DELETE），Prisma ORM + SQLite 持久化
- `frontend-api-integration`: 前端 API 層與資料來源切換機制（local/api mode）

### Modified Capabilities

（無既有 spec 需修改）

## Impact

- 新增 `backend/` 目錄及其所有檔案（Express 專案）
- 前端新增 `idea-graph-app/src/api/projectsApi.ts`
- 修改 `idea-graph-app/src/store/projectStore.ts`（加入 API 模式切換）
- 修改 `idea-graph-app/src/pages/IdeaListPage.tsx`（讀取 API）
- 修改 `idea-graph-app/src/pages/IdeaEditorPage.tsx`（自動保存改為 PUT API + debounce）
- 新增依賴：express, prisma, zod, pino, cors

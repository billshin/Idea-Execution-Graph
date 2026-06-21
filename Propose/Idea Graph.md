# Idea Execution Graph

## 核心目標

設定好目標,讓你思考並一步步的完成並且達到,只要開始了,即使是一點點,目標就不遠了對吧?


## 前端技術選型

Frontend Framework

- React

Graph Visualization

- React Flow

State Management

- Zustand

Storage

- LocalStorage (MVP)

## 主要項目

畫面左上方顯示

- Title > Goal:任務目標 (Required)
- Sub Title > Explain:任務解釋
- Target Date > 目標日期 (為了讓探索有所節制)
- Idea Status > 整體狀態 (不強制系統約束狀態範圍,畢竟自己說了算)

畫面設定圖示區點開後可以顯示以下設定

- [按鈕] 全收合 > Hide non Custom Display 項目
- [按鈕] 注目模式 (只針對卡片端點 is_focus_path 的路線顯示)
- [按鈕] 達成模式 (只對狀態卡片端點 Finish 的路線顯示 )
- [List] 端點路線顯示&透明化 , 依據路線結尾可以選擇那些要顯示& 手條透明度(High medium low)
- Custom Display: 自訂node內顯示資訊 [checkbox] list

## 節點說明

說明想做的事情,一般的文字框輸入內容 ,可以有一些預設 Title
  - Require 需求
  - Hypothesis 假設
  - user story 情境
  - 自填Title

labels 可標示此node是否有特殊任務,或是當作一種標籤
  - Task 
  - Risk 
  - POC
  - 自填Title


卡片下方可以新增任務功能: 任務名稱,想要達成目標的的必須事項,可以是 


## 起始狀態

New Idea ,Title 預設文字寫 START

## JSON 設計

```json

{
  "nodes": [
    {
      "id": "node_uuid",
      "labels": ["Hypothesis", "POC","僅在node顯示文字當作提示"],
      "title": "Azure AD 登入驗證",
      "subtitle": "確認是否可整合現有系統",
      "conclusion": "確認可行",
      "content": "Markdown Content",

      "status": "open",
      
      

      "target_date": "2026-07-01",
      "start_date": "2026-06-20",
      "end_date": "2026-06-30",
      "created_at": "2026-06-20T10:00:00Z",
      "updated_at": "2026-06-20T14:30:00Z",

      "files": [
        {
          "id": "file_uuid",
          "name": "azure-ad-test.docx",
          "url": "/files/azure-ad-test.docx"
        }
      ]
    }

  ],

  "edges": [
    {
      "id": "e1",
      "source": "n1",
      "target": "n2"
    }
  ],

  "ui": {
    "positions": {},
    "display":["label", "title" ,"subtitle" ],
    "viewport": {
      "zoom": 1,
      "x": 0,
      "y": 0
    },
    "mode": "default"
}
 
}
```

## status:


| 顏色 | 狀態 |
| :--- | :--- |
| White | Open |
| Blue | Doing |
| Yellow | wait |
| Purple | Hold |
| Green | Finish |
| Red | FAIL |
| Gray | Cancel |

因為只用卡片外框顏色代表狀態,所以要一個 legend 說明顏色

## 卡片節點通用性

- Node 只顯示以下避免視覺混亂:
  - Title 
  - Sub title 
  - Target Date(有填入才顯示),
  - Conclusion

- 點進去可以寫md ,向各種markdown 軟體依樣可以貼上圖片,保留內容補充性
- 可以有upload的file system ,可以保存各種來源檔案,作為資料來源輔助
- 都採用狀態外框配色



## Node新增方式

這邊借鏡n8n,新增方式:

- 節點後新增
- 空白處新增

然後卡片左右端都有接點讓user自行拉線

## Node收放方式

主畫面上放一個 按鈕:全收合/全打開
文字卡片放一個按鈕:收合/打開

- 打開 : 預設狀態
- 收合 : 僅下一層所有任務Task List 都收到文字卡片中 , 只追加各任務數量統計數字

## Task Parking Lot: (放置於專案畫面右下角落)

也就是暫存區:

- 可以放置專案中有規劃或想法但不知道去處的 Task & Text
- 可以放置sub Graph,專案衍伸的 **好像很有趣,但現在不重要**的事情


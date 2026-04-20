# 投资学大作业（2026）—各组基金净值（NAV）增长率

## 页面说明

- **风格**：Bloomberg市场报价风格（黑底白字）
- **表格标题**：各组基金净值变化及增长率排名
- **数据来源**：东方财富（eastmoney.com）
- **基期**：2026.04.20（紫色高亮显示）

## 日期标签（页面顶部）

| 标签 | 说明 | 示例 |
|------|------|------|
| 基期净值日期 | 起始日期，用于计算增长率 | 2026.04.20（紫色） |
| 最新净值日期 | 最新可获得的净值日期 | 2026.04.20（橙色） |
| 净值查询日期 | 手动更新数据的日期 | 2026.04.21（蓝色） |

**注意**：若某基金在基期无交易数据，脚本会自动使用最近交易日的净值作为基期（回退逻辑）。

## 快速开始

### 运行更新脚本

```bash
cd D:\KKP\A.Research.AI\Project_minimax_1\fund_nav_growth
node update_fund_data.js
```

### 一键更新 + 部署

```bash
cd D:\KKP\A.Research.AI\Project_minimax_1\fund_nav_growth
node update_fund_data.js && git add . && git commit -m "Update" && git push
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 主页面（由脚本自动生成，Netlify 部署用） |
| `fund_nav_growth.html` | 备份页面（内容相同） |
| `update_fund_data.js` | 数据更新脚本 |
| `README.md` | 说明文件 |

## 当前数据状态

- **基期净值日期**：2026.04.20（紫色 #bf5af2）
- **最新净值日期**：2026.04.20（橙色 #ff9500）
- **净值查询日期**：2026.04.21（蓝色 #00d4ff）
- **基金数量**：10只

## 10个小组数据

| 排名 | 小组 | 基金 | 增长率 |
|:---:|:---|:---|:---:|
| 1 | Big Mac | 科创50ETF | +0.00% |
| 2 | Jet2 Holiday | 创业板ETF | +0.00% |
| 3 | TACO | 沪深300ETF | +0.00% |
| 4 | Apocalypse | 科技ETF | +0.00% |
| 5 | The Port Authority | 中证1000ETF | +0.00% |
| 6 | Pro | 纳指ETF | +0.00% |
| 7 | Aespa | 标普500ETF | +0.00% |
| 8 | kskbl | 恒生ETF | +0.00% |
| 9 | The Legend of KK | 证券ETF | +0.00% |
| 10 | 404 Not Found | 中概互联ETF | +0.00% |

**注意**：增长率全为0%是因为基期（2026.04.20）与最新净值日期相同。跨境ETF（纳指、标普、中概）使用回退到2026.04.17的净值。

## 修改基期日期

编辑 `update_fund_data.js` 第24行：

```javascript
const BASE_DATE = '2026-04-20';  // 改为新的基期日期
```
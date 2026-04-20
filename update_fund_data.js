/**
 * 基金净值数据自动更新脚本
 * 使用方法: node update_fund_data.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 基金列表
const FUNDS = [
    { group: 1, groupName: 'Big Mac', code: '588000', name: '科创50ETF' },
    { group: 2, groupName: 'Jet2 Holiday', code: '159915', name: '创业板ETF' },
    { group: 3, groupName: 'TACO', code: '510300', name: '沪深300ETF' },
    { group: 4, groupName: 'Apocalypse', code: '515000', name: '科技ETF' },
    { group: 5, groupName: 'The Port Authority', code: '512100', name: '中证1000ETF' },
    { group: 6, groupName: 'Pro', code: '159941', name: '纳指ETF' },
    { group: 7, groupName: 'Aespa', code: '513500', name: '标普500ETF' },
    { group: 8, groupName: 'kskbl', code: '159920', name: '恒生ETF' },
    { group: 9, groupName: 'The Legend of KK', code: '512880', name: '证券ETF' },
    { group: 10, groupName: '404 Not Found', code: '159605', name: '中概互联ETF' }
];

const BASE_DATE = '2026-04-01';

/**
 * 获取基金历史净值
 */
function getFundHistory(code, date) {
    return new Promise((resolve, reject) => {
        const url = `http://api.fund.eastmoney.com/f10/lsjz?fundCode=${code}&pageIndex=1&pageSize=20&startDate=${date}&endDate=${date}`;
        const options = {
            headers: {
                'Referer': 'http://fundf10.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0'
            }
        };

        http.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.Data && json.Data.LSJZList && json.Data.LSJZList.length > 0) {
                        resolve({
                            nav: parseFloat(json.Data.LSJZList[0].DWJZ),
                            date: json.Data.LSJZList[0].FSRQ
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

/**
 * 获取基金最新净值
 */
function getFundLatest(code) {
    return getFundHistory(code, '');
}

/**
 * 获取查询日期（今天）
 */
function getQueryDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

/**
 * 生成HTML内容
 */
function generateHTML(fundData, baseDate, cutoffDate, queryDate) {
    // 将基期日期转换为点号分隔格式
    const baseDateDisplay = baseDate.replace(/-/g, '年').replace(/(\d{4})(\d{2})(\d{2})/, '$1年$2月$3日');
    // 最新净值日期
    const cutoffDateDisplay = cutoffDate;
    // 查询日期
    const queryDateDisplay = queryDate;

    // 计算增长率和排名
    const dataWithGrowth = fundData.map(f => {
        const growth = ((f.currentNav - f.baseNav) / f.baseNav) * 100;
        return { ...f, growth: parseFloat(growth.toFixed(2)) };
    });

    // 按增长率排序计算排名
    const sorted = [...dataWithGrowth].sort((a, b) => b.growth - a.growth);
    sorted.forEach((f, i) => f.rank = i + 1);

    // 按小组编号排序
    dataWithGrowth.sort((a, b) => a.group - b.group);

    const maxAbsGrowth = Math.max(...dataWithGrowth.map(f => Math.abs(f.growth)));

    const tableRows = dataWithGrowth.map(f => {
        const growthClass = f.growth >= 0 ? 'growth-positive' : 'growth-negative';
        const barClass = f.growth >= 0 ? 'positive' : 'negative';
        const rankClass = f.rank <= 3 ? 'top' : 'bottom';
        const barWidth = maxAbsGrowth > 0 ? (Math.abs(f.growth) / maxAbsGrowth) * 100 : 0;

        return `
                    <tr>
                        <td class="group-cell">${f.group}</td>
                        <td class="group-name">${f.groupName}</td>
                        <td class="fund-name">${f.name}</td>
                        <td class="fund-code">${f.code}</td>
                        <td class="nav-value">${f.baseNav.toFixed(4)}</td>
                        <td class="nav-value">${f.currentNav.toFixed(4)}</td>
                        <td>
                            <div class="growth-bar-container">
                                <div class="growth-bar">
                                    <div class="growth-bar-fill ${barClass}" style="width: ${barWidth}%"></div>
                                </div>
                                <span class="growth-value ${growthClass}">
                                    ${f.growth >= 0 ? '+' : ''}${f.growth.toFixed(2)}%
                                </span>
                            </div>
                        </td>
                        <td>
                            <span class="rank-badge ${rankClass}">${f.rank}</span>
                        </td>
                    </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投资学大作业（2026）</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background-color: #000000;
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 24px;
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 500;
            color: #ffffff;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
        }
        .date-info {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            font-size: 14px;
            flex-wrap: wrap;
        }
        .date-label { color: #888888; }
        .date-value { font-weight: 600; }
        .date-value.base { color: #888888; }
        .date-value.cutoff { color: #ff9500; }
        .date-value.query { color: #00d4ff; }
        .date-sep { color: #444444; }

        /* Table Container */
        .table-container {
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .table-title {
            font-size: 16px;
            font-weight: 500;
            color: #ffffff;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #333;
        }

        /* Table */
        table { width: 100%; border-collapse: collapse; }
        thead { background-color: #333333; }
        th {
            padding: 14px 10px;
            text-align: center;
            font-size: 13px;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #555555;
        }
        td {
            padding: 14px 10px;
            font-size: 13px;
            text-align: center;
            border-bottom: 1px solid #262626;
            color: #ffffff;
        }
        tbody tr:hover { background-color: #262626; }

        /* Cell Styles */
        .group-cell { font-weight: 400; color: #ff9500; font-size: 13px; }
        .group-name { font-weight: 500; color: #ffffff; }
        .fund-name { color: #ffffff; }
        .fund-code { color: #ffffff; font-size: 13px; }
        .nav-value { font-family: 'SF Mono', 'Consolas', monospace; color: #ffffff; }

        /* Growth Colors - 中国习惯：红涨绿跌 */
        .growth-positive { color: #ff3b30; font-weight: 600; }
        .growth-negative { color: #34c759; font-weight: 600; }

        .growth-bar-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .growth-bar {
            position: relative;
            width: 60px;
            height: 6px;
            background-color: #333;
            border-radius: 3px;
            overflow: hidden;
        }
        .growth-bar-fill {
            position: absolute;
            top: 0;
            height: 100%;
            border-radius: 3px;
        }
        .growth-bar-fill.positive { left: 0; background: #ff3b30; }
        .growth-bar-fill.negative { right: 0; background: #34c759; }
        .growth-value { min-width: 65px; text-align: left; }

        /* Rank Badge */
        .rank-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 12px;
        }
        .rank-badge.top { background-color: #ff3b30; color: #ffffff; }
        .rank-badge.bottom { background-color: #34c759; color: #ffffff; }

        /* Status Bar */
        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            font-size: 12px;
            color: #888888;
        }

        /* Bloomberg Green Accent */
        .bloomberg-accent { color: #ff9500; }

        /* Responsive */
        @media (max-width: 768px) {
            body { padding: 12px; }
            .header h1 { font-size: 20px; }
            table { font-size: 12px; }
            td, th { padding: 10px 6px; }
            .date-info { flex-wrap: wrap; gap: 4px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>投资学大作业（2026）—各组基金净值（NAV）增长率</h1>
            <div class="date-info">
                <span class="date-label">即期净值日期：</span><span class="date-value base">2026年4月20日</span>
                <span class="date-sep">|</span>
                <span class="date-label">当前净值日期：</span><span class="date-value cutoff">${cutoffDateDisplay}</span>
                <span class="date-sep">|</span>
                <span class="date-label">净值查询日期：</span><span class="date-value query">${queryDateDisplay}</span>
            </div>
        </div>

        <div class="table-container">
            <div class="table-title">各组基金净值变化及增长率排名</div>
            <table>
                <thead>
                    <tr>
                        <th>小组编号</th>
                        <th>小组名称</th>
                        <th>基金名称</th>
                        <th>基金代码</th>
                        <th>基期净值</th>
                        <th>当前净值</th>
                        <th>净值增长率</th>
                        <th>排名</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <div class="status-bar">
            <span>数据来源：东方财富（eastmoney.com）</span>
        </div>
    </div>
</body>
</html>`;
}

/**
 * 主函数
 */
async function main() {
    console.log('开始获取基金数据...\n');

    const fundData = [];

    for (const fund of FUNDS) {
        try {
            console.log(`获取 ${fund.group}组 ${fund.name} (${fund.code})...`);

            // 获取基期净值
            const baseData = await getFundHistory(fund.code, BASE_DATE);
            if (!baseData) {
                console.log(`  警告: 无法获取基期数据`);
                continue;
            }

            // 获取最新净值
            const latestData = await getFundLatest(fund.code);
            if (!latestData) {
                console.log(`  警告: 无法获取最新数据`);
                continue;
            }

            fundData.push({
                ...fund,
                baseNav: baseData.nav,
                currentNav: latestData.nav,
                latestDate: latestData.date
            });

            console.log(`  基期净值: ${baseData.nav} -> 最新净值: ${latestData.nav}`);

        } catch (e) {
            console.error(`  获取失败: ${e.message}`);
        }
    }

    if (fundData.length === 0) {
        console.error('没有获取到任何数据!');
        process.exit(1);
    }

    // 获取截止日期（最新净值日期），格式化为点号分隔
    const cutoffDateRaw = fundData.reduce((max, f) => f.latestDate > max ? f.latestDate : max, '');
    const cutoffDate = cutoffDateRaw.replace(/-/g, '.');
    const queryDate = getQueryDate();

    // 生成HTML
    const html = generateHTML(fundData, BASE_DATE, cutoffDate, queryDate);

    // 写入文件（直接写入 index.html 供 Netlify 使用）
    const outputPath = path.join(__dirname, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf8');

    // 同时保留 fund_nav_growth.html 作为备份
    const backupPath = path.join(__dirname, 'fund_nav_growth.html');
    fs.writeFileSync(backupPath, html, 'utf8');

    console.log(`\n数据更新成功!`);
    console.log(`文件已保存: ${outputPath}`);
    console.log(`最新净值更新日期: ${cutoffDate}`);
    console.log(`查询日期（获取日期）: ${queryDate}`);

    // 打印排名
    const sorted = [...fundData].sort((a, b) => {
        const ga = (a.currentNav - a.baseNav) / a.baseNav;
        const gb = (b.currentNav - b.baseNav) / b.baseNav;
        return gb - ga;
    });

    console.log('\n增长率排名:');
    sorted.forEach((f, i) => {
        const growth = ((f.currentNav - f.baseNav) / f.baseNav * 100).toFixed(2);
        console.log(`  ${i + 1}. ${f.groupName}: ${growth >= 0 ? '+' : ''}${growth}%`);
    });
}

main().catch(console.error);

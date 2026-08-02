# ECharts 样式定制核心属性速记表

日常拿到需求后，对照下表就能快速定位需要修改的属性。

---

## 一、按"想达到的效果"速查

| 效果需求 | 核心属性（路径） | 关键可选值 / 示例 |
|---------|----------------|------------------|
| 柱/饼边缘变圆润 | `itemStyle.borderRadius` | 数字（如 `10`）或数组 `[左上, 右上, 右下, 左下]` |
| 立体阴影 / 悬浮感 | `itemStyle.shadowBlur`、`shadowColor`、`shadowOffsetX/Y` | `shadowBlur: 12`、`shadowColor: 'rgba(0,0,0,0.2)'` |
| 发光 / 霓虹效果 | `itemStyle.shadowBlur` + 亮色 `shadowColor` | `shadowBlur: 30`、`shadowColor: '#ff6ec7'` |
| 渐变填充（线性） | `itemStyle.color` → `LinearGradient` | `new echarts.graphic.LinearGradient(x0,y0,x1,y1,[...])` |
| 渐变填充（径向） | `itemStyle.color` → `RadialGradient` | `new echarts.graphic.RadialGradient(x,y,r,[...])` |
| 透明度调整 | `itemStyle.opacity` | `0.1` ~ `1` |
| 扇区间隔（饼图） | `series.padAngle` | 数字（角度，如 `2`） |
| 环形 / 玫瑰图 | `series.radius`、`roseType` | `radius: ['40%','70%']`、`roseType: 'area'` |
| 折线变虚线 / 点线 | `lineStyle.type` | `'solid'`、`'dashed'`、`'dotted'` |
| 线条平滑 | `series.smooth` | `true` / `false` 或数字（如 `0.4`） |
| 折线下方渐变面积 | `series.areaStyle` | 设置 `color` 为渐变对象（同 `LinearGradient`） |
| 数据点形状 | `series.symbol` | `'circle'`、`'rect'`、`'roundRect'`、`'triangle'`、`'diamond'`、`'pin'`、`'arrow'` |
| 数据点大小 | `series.symbolSize` | 数字 或 函数 `function(data){ return ... }` |
| 网格线变成虚线 | `xAxis/yAxis.splitLine.lineStyle` | `type: 'dashed'`，`color` |
| 坐标轴颜色/粗细 | `axisLine.lineStyle` | `color`、`width` |
| 标签富文本样式 | `series.label.rich` | 定义多个样式名，用 `{name|text}` 格式化 |
| 悬停放大/高亮 | `emphasis` 块内重写 `itemStyle`、`label`、`scale` | `scale: true`，加大 `shadowBlur` 和 `fontSize` |
| 提示框样式 | `tooltip.backgroundColor`、`borderColor`、`extraCssText` | `extraCssText: 'box-shadow:...; border-radius:...'` |
| 暗色主题背景 | 全局 `backgroundColor` | `'#1a1a2e'`，同时调整文字、轴线颜色为浅色 |
| 图例图标形状 | `legend.icon` | `'circle'`、`'rect'`、`'roundRect'`、`'triangle'`、`'diamond'`、`'pin'`、`'arrow'`、`'none'` |
| 图例文字样式 | `legend.textStyle` | `fontSize`、`fontWeight`、`color` |
| 饼图中心文字 | 使用 `graphic` 组件 | `type: 'text'`，定位在中心 |

---

## 二、核心属性层级与常用可选值

| 属性路径 | 作用对象 | 常用可选值 / 说明 |
|---------|---------|------------------|
| `itemStyle.color` | 系列数据项颜色 | 十六进制色值、`LinearGradient` 对象、`RadialGradient` 对象 |
| `itemStyle.borderRadius` | 柱/饼圆角 | 数字或数组（柱为 `[上左, 上右, 下右, 下左]`） |
| `itemStyle.borderColor` / `borderWidth` | 边框 | 颜色字符串、数字宽度 |
| `itemStyle.shadowBlur` / `shadowColor` / `shadowOffsetX/Y` | 阴影 | 模糊半径、颜色、偏移 |
| `itemStyle.opacity` | 透明度 | `0` ~ `1` |
| `lineStyle.type` | 折线/坐标轴线型 | `'solid'`、`'dashed'`、`'dotted'` |
| `lineStyle.width` | 线宽 | 数字 |
| `lineStyle.cap` / `join` | 线条端点/连接样式 | `'butt'`、`'round'`、`'square'` / `'bevel'`、`'round'`、`'miter'` |
| `areaStyle.color` | 面积填充色 | 颜色值或渐变对象 |
| `symbol` | 数据点形状 | `'circle'`、`'rect'`、`'roundRect'`、`'triangle'`、`'diamond'`、`'pin'`、`'arrow'` |
| `symbolSize` | 数据点大小 | 固定值或函数（如 `function(data){ return data[2]*10; }`） |
| `label` / `emphasis.label` | 数据标签样式 | `position`、`color`、`fontSize`、`fontWeight`、`rich` 等 |
| `label.rich.<styleName>` | 富文本标签 | 可定义 `fontSize`、`fontWeight`、`color`、`padding` 等子样式 |
| `splitLine.lineStyle` | 网格分割线 | 同 `lineStyle`，可设置 `type` 和 `color` |
| `axisLine.lineStyle` | 坐标轴线 | 同 `lineStyle` |
| `axisLabel` | 坐标轴文字 | `color`、`fontSize`、`fontWeight` 等 |
| `tooltip` | 提示框 | `backgroundColor`、`borderColor`、`extraCssText`（原生 CSS 字符串） |
| `legend.textStyle` / `legend.icon` | 图例 | 文字样式属性同上 |
| `graphic` | 自定义图形/文字 | `type: 'text'`，`left/right/top/bottom`，`style: {text, fill, fontSize...}` |
| `backgroundColor` | 图表全局背景 | 十六进制色值 |

---

## 三、实战速记口诀

- **要柔和** → 加 `borderRadius`、减 `shadowBlur`
- **要立体** → 加 `shadowBlur` + `shadowOffsetY`
- **要炫酷** → 用渐变 `color` + 亮色 `shadowColor` + 暗色背景
- **要区分系列** → 不同 `lineStyle.type`（虚实线）+ 不同 `symbol`
- **要突出重点** → `emphasis` 里放大 `symbolSize`、加深阴影、加粗标签
- **要精致文字** → 用 `label.rich` 分块定义样式
- **要暗色模式** → 改全局 `backgroundColor` 和所有文字、轴线颜色为浅色

---

## 使用说明

拿到设计稿或需求时，直接用这张表和口诀对照，就能快速知道该从哪些属性入手调整样式。

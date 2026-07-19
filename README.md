# Normal Map Converter / 法线贴图转换器

---

**[English](#english)** | **[中文](#中文)**

---

## English

One-click conversion from yellow normal maps to standard tangent-space normal maps.

### Example

| Before | After |
|---|---|
| ![yellow normal map](example_before.png) | ![standard normal map](example_after.png) |

### Download

Go to [Releases](../../releases) and download `NormalMapConverter.exe` (72 MB, portable, no install needed).

### Single Mode

1. Click **Browse...** and select a yellow normal map
2. Preview the original and converted result
3. Click **Convert & Save** to save as PNG

### Batch Mode

1. Click **Add Images** or **Add Folder** to add files
2. Set output directory
3. Click **Batch Convert**

### Conversion Algorithm

| Channel | Operation |
|---------|-----------|
| Red     | Color invert (255 - value) |
| Green   | Unchanged |
| Blue    | Fill white (255) |

### Build from Source

```bash
npm install
npm run build
```

Output: `dist/NormalMapConverter.exe` | Requires: Node.js 18+

### Tech Stack

Electron 28 / HTML / CSS / JavaScript / CSS `backdrop-filter` / Canvas API

---

## 中文

一键将黄色法线贴图转换为标准切线空间法线贴图。

### 效果示例

| 转换前 | 转换后 |
|---|---|
| ![黄色法线贴图](example_before.png) | ![标准法线贴图](example_after.png) |

### 下载

去 [Releases](../../releases) 下载 `NormalMapConverter.exe`（72MB，便携版，无需安装）。

### 单张转换

1. 点 **浏览...** 选一张黄色法线贴图
2. 左右预览原图和转换结果
3. 点 **转换并保存** 存为 PNG

### 批量转换

1. 点 **添加图片** 或 **添加文件夹** 添加文件
2. 设置输出目录
3. 点 **批量转换**

### 转换算法

| 通道 | 操作 |
|------|------|
| 红   | 反色（255 - 值） |
| 绿   | 不变 |
| 蓝   | 填充白色（255） |

### 从源码构建

```bash
npm install
npm run build
```

输出：`dist/NormalMapConverter.exe` | 需要：Node.js 18+

### 技术栈

Electron 28 / HTML / CSS / JavaScript / CSS `backdrop-filter` / Canvas API

---

MIT

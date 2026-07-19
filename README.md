# Normal Map Converter / 法线贴图转换器

一键将黄色法线贴图转换为标准法线贴图。

One-click conversion from yellow normal maps to standard tangent-space normal maps.

## Screenshot / 截图

![screenshot](screenshot.png)

## Download / 下载

Go to [Releases](../../releases) and download `NormalMapConverter.exe` (72 MB, portable, no install needed).

去 [Releases](../../releases) 下载 `NormalMapConverter.exe`（72MB，便携版，无需安装）。

## How to Use / 使用方法

### Single Mode / 单张转换
1. Click **Browse...** and select a yellow normal map
2. Preview the original and converted result
3. Click **Convert & Save** to save as PNG

1. 点 **浏览...** 选一张黄色法线贴图
2. 左右预览原图和转换结果
3. 点 **转换并保存** 存为 PNG

### Batch Mode / 批量转换
1. Click **Add Images** or **Add Folder** to add files
2. Set output directory
3. Click **Batch Convert**

1. 点 **添加图片** 或 **添加文件夹** 添加文件
2. 设置输出目录
3. 点 **批量转换**

## Conversion Algorithm / 转换算法

| Channel | Operation |
|---------|-----------|
| Red / 红 | Color invert (255 - value) / 反色 |
| Green / 绿 | Unchanged / 不变 |
| Blue / 蓝 | Fill white (255) / 填充白色 |

## Build from Source / 从源码构建

```bash
npm install
npm run build
```

Output: `dist/NormalMapConverter.exe`

Requires: Node.js 18+

## Tech Stack / 技术栈

- Electron 28
- HTML / CSS / JavaScript
- CSS `backdrop-filter` for frosted glass effect
- Canvas API for image processing

## License

MIT

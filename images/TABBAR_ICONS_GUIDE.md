# TabBar 图标使用指南

## 图标要求

微信小程序 TabBar 图标需要满足以下要求:
- 图片格式: PNG
- 图片尺寸: 81px × 81px (推荐)
- 文件大小: 每个图标建议 < 40KB
- 每个 Tab 需要两个图标: 未选中状态 + 选中状态

## 需要的图标文件

请准备以下 8 个图标文件,放在 `images/tabbar/` 目录下:

### 1. 首页 (Home)
- `home.png` - 未选中状态 (灰色 #999999)
- `home-active.png` - 选中状态 (天蓝色 #87CEEB)
- 图标建议: 房子/教堂图标

### 2. 详情 (Details)
- `details.png` - 未选中状态 (灰色 #999999)
- `details-active.png` - 选中状态 (天蓝色 #87CEEB)
- 图标建议: 文档/列表图标

### 3. 回执 (RSVP)
- `rsvp.png` - 未选中状态 (灰色 #999999)
- `rsvp-active.png` - 选中状态 (天蓝色 #87CEEB)
- 图标建议: 信封/表单图标

### 4. 祝福 (Blessings)
- `blessings.png` - 未选中状态 (灰色 #999999)
- `blessings-active.png` - 选中状态 (天蓝色 #87CEEB)
- 图标建议: 对话框/留言图标

## 图标设计建议

### 风格
- 线性图标 (line icon)
- 简洁清晰
- 线条粗细: 2-3px
- 圆角: 2-4px

### 颜色
- 未选中: #999999 (灰色)
- 选中: #87CEEB (天蓝色)
- 背景: 透明

## 在线图标资源

你可以从以下网站下载或定制图标:

1. **Iconfont (阿里巴巴矢量图标库)**
   - 网址: https://www.iconfont.cn/
   - 搜索关键词: home, document, mail, message
   - 下载 PNG 格式,尺寸选择 81px

2. **IconPark (字节跳动图标库)**
   - 网址: https://iconpark.oceanengine.com/
   - 可以在线调整颜色和尺寸

3. **Flaticon**
   - 网址: https://www.flaticon.com/
   - 搜索英文关键词

## 图标制作步骤

### 方法1: 使用在线工具
1. 访问 Iconfont.cn
2. 搜索并选择合适的图标
3. 点击"下载" → 选择 PNG 格式
4. 设置尺寸为 81px × 81px
5. 下载两次,分别设置颜色为 #999999 和 #87CEEB

### 方法2: 使用设计工具 (Figma/Sketch)
1. 创建 81px × 81px 画布
2. 绘制简单的线性图标
3. 导出为 PNG 格式
4. 分别导出灰色和蓝色版本

## 文件放置位置

```
images/
  └── tabbar/
      ├── home.png
      ├── home-active.png
      ├── details.png
      ├── details-active.png
      ├── rsvp.png
      ├── rsvp-active.png
      ├── blessings.png
      └── blessings-active.png
```

## 配置说明

图标文件准备好后,`app.json` 已经配置好了图标路径:

```json
{
  "pagePath": "pages/index/index",
  "text": "首页",
  "iconPath": "images/tabbar/home.png",
  "selectedIconPath": "images/tabbar/home-active.png"
}
```

## 快速测试

如果暂时没有图标文件,可以:
1. 先使用纯文字 TabBar (当前配置)
2. 后续添加图标文件后,取消 app.json 中图标路径的注释即可

## 注意事项

1. 图标文件名不要使用中文
2. 确保所有图标风格统一
3. 图标要清晰,避免过于复杂的细节
4. 测试时注意查看不同设备上的显示效果

# Tab 图标准备指南

底部导航栏需要8个图标文件（每个Tab需要默认和选中两个状态）。

## 所需图标列表

### 1. 首页图标
- `tab-home.png` - 默认状态（灰色）
- `tab-home-active.png` - 选中状态（淡蓝色）
- 推荐图标：🏠 房子、💒 教堂、💝 爱心

### 2. 详情图标
- `tab-details.png` - 默认状态（灰色）
- `tab-details-active.png` - 选中状态（淡蓝色）
- 推荐图标：📋 列表、📅 日历、ℹ️ 信息

### 3. 回执图标
- `tab-rsvp.png` - 默认状态（灰色）
- `tab-rsvp-active.png` - 选中状态（淡蓝色）
- 推荐图标：✍️ 编辑、📝 表单、✅ 确认

### 4. 祝福图标
- `tab-blessings.png` - 默认状态（灰色）
- `tab-blessings-active.png` - 选中状态（淡蓝色）
- 推荐图标：💬 对话、💌 信件、🎉 庆祝

## 图标规格

### 尺寸要求
- **推荐尺寸**: 81px × 81px
- **最小尺寸**: 40px × 40px
- **最大尺寸**: 120px × 120px
- **格式**: PNG（支持透明背景）

### 颜色要求
- **默认状态**: #999999（灰色）
- **选中状态**: #87CEEB（淡蓝色）
- **背景**: 透明

### 设计建议
- 使用简洁的线条图标
- 保持风格统一
- 确保在小尺寸下清晰可辨

## 获取图标的方法

### 方法一：使用 Iconfont（推荐）

1. 访问 [iconfont.cn](https://www.iconfont.cn/)
2. 搜索相关图标（如"home"、"list"、"edit"、"message"）
3. 选择喜欢的图标加入购物车
4. 下载PNG格式，尺寸选择81px
5. 使用图片编辑工具修改颜色

### 方法二：使用 IconPark

1. 访问 [IconPark](https://iconpark.oceanengine.com/)
2. 搜索并下载图标
3. 选择PNG格式，调整颜色和尺寸

### 方法三：使用 Figma/Sketch 设计

1. 创建 81px × 81px 的画布
2. 使用矢量工具绘制图标
3. 导出为PNG格式
4. 分别导出灰色和蓝色版本

### 方法四：使用 AI 生成

可以使用 AI 工具生成简单的图标，然后调整颜色。

## 快速方案：使用 Emoji 图标

如果暂时没有图标，可以先使用 emoji 作为占位：

1. 使用在线工具将 emoji 转换为图片
2. 网站推荐：[Emoji to PNG](https://emoji.gg/)
3. 下载后调整颜色和尺寸

## 图标放置位置

将准备好的8个图标文件放入 `images/` 目录：

```
images/
├── tab-home.png
├── tab-home-active.png
├── tab-details.png
├── tab-details-active.png
├── tab-rsvp.png
├── tab-rsvp-active.png
├── tab-blessings.png
└── tab-blessings-active.png
```

## 临时方案

如果暂时没有图标，可以：

1. **使用纯色方块**：创建简单的彩色方块作为占位
2. **使用文字**：在小程序中可以只显示文字，不显示图标
3. **使用默认图标**：微信开发者工具会显示默认图标

### 修改为纯文字导航（无图标）

如果不想使用图标，可以修改 `app.json`，删除 iconPath 和 selectedIconPath：

```json
"tabBar": {
  "color": "#999999",
  "selectedColor": "#87CEEB",
  "backgroundColor": "#ffffff",
  "borderStyle": "white",
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "首页"
    },
    {
      "pagePath": "pages/details/details",
      "text": "详情"
    },
    {
      "pagePath": "pages/rsvp/rsvp",
      "text": "回执"
    },
    {
      "pagePath": "pages/blessings/blessings",
      "text": "祝福"
    }
  ]
}
```

## 图标示例

### 首页图标建议
```
默认: 🏠 (灰色房子图标)
选中: 🏠 (蓝色房子图标)
```

### 详情图标建议
```
默认: 📋 (灰色列表图标)
选中: 📋 (蓝色列表图标)
```

### 回执图标建议
```
默认: ✍️ (灰色编辑图标)
选中: ✍️ (蓝色编辑图标)
```

### 祝福图标建议
```
默认: 💬 (灰色对话图标)
选中: 💬 (蓝色对话图标)
```

## 注意事项

1. **文件大小**: 每个图标建议 < 40KB
2. **命名规范**: 使用小写字母和连字符
3. **透明背景**: 确保PNG图标有透明背景
4. **测试**: 在真机上测试图标显示效果

## 完成后

图标准备好后：
1. 将8个图标文件放入 `images/` 目录
2. 在微信开发者工具中编译项目
3. 查看底部导航栏是否正常显示
4. 点击各个Tab测试切换效果

如果图标不显示，检查：
- 文件路径是否正确
- 文件名是否匹配
- 图标尺寸是否符合要求

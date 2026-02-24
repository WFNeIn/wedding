# 微信小程序婚宴请帖

一个清新淡雅的微信小程序婚礼邀请函，包含婚礼信息展示、宾客回执收集、祝福留言等功能。

**🚀 零基础用户请先阅读：[快速开始指南](./QUICK_START.md)**

## 功能特性

- 📸 **邀请函首页** - 轮播展示婚纱照，显示婚礼基本信息和倒计时
- 📅 **婚礼详情** - 展示婚礼流程、交通指引、联系方式
- ✍️ **宾客回执** - 收集宾客参会信息（姓名、电话、人数等）
- 💬 **祝福留言** - 宾客可发送祝福留言，查看其他人的祝福

## 技术栈

- 微信小程序原生框架
- 微信云开发（云数据库 + 云函数）
- WXSS 样式

## 项目结构

```
wedding-invitation-miniapp/
├── pages/              # 页面目录
│   ├── index/         # 首页
│   ├── details/       # 详情页
│   ├── rsvp/          # 回执页
│   └── blessings/     # 留言板
├── utils/             # 工具函数
│   └── util.js
├── images/            # 图片资源
├── cloudfunctions/    # 云函数（待创建）
├── app.js             # 小程序逻辑
├── app.json           # 小程序配置
└── app.wxss           # 全局样式
```

## 快速开始

### 1. 准备工作

- 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（[安装指南](./INSTALL_DEVTOOLS.md)）
- 注册微信小程序账号，获取 AppID

### 2. 配置项目

1. 在微信开发者工具中导入项目
2. 修改 `project.config.json` 中的 `appid` 为你的小程序 AppID
3. 修改 `app.js` 中的婚礼信息配置：
   - 新人姓名
   - 婚礼日期和时间
   - 婚宴地点和地址
   - 联系电话

### 3. 配置云开发

1. 在微信开发者工具中点击"云开发"按钮
2. 开通云开发服务，创建环境
3. 复制环境ID，填入 `app.js` 的 `wx.cloud.init()` 中
4. 在云开发控制台创建数据库集合：
   - `rsvp` - 宾客回执集合
   - `blessings` - 祝福留言集合

详细配置步骤请参考 [SETUP.md](./SETUP.md)

### 4. 准备图片资源

将婚纱照和Tab图标放入 `images/` 目录，详见 `images/README.md`

### 5. 运行项目

在微信开发者工具中点击"编译"按钮即可预览

## 配置说明

### 修改婚礼信息

编辑 `app.js` 中的 `globalData.weddingInfo` 对象：

```javascript
weddingInfo: {
  couple: {
    groom: '新郎姓名',
    bride: '新娘姓名'
  },
  date: '2025-05-04',
  time: '12:00',
  venue: {
    name: '酒店名称',
    address: '详细地址',
    latitude: 30.826285,  // 纬度
    longitude: 114.811298  // 经度
  },
  // ...
}
```

### 修改主题色

编辑 `app.wxss` 中的颜色变量，默认为淡蓝色 `#87CEEB`

## 云函数部署

云函数将在后续任务中创建，包括：
- `submitRSVP` - 提交宾客回执
- `addBlessing` - 添加祝福留言

## 注意事项

- 图片资源需要压缩到合适大小（建议每张 < 500KB）
- 小程序主包大小限制为 2MB
- 云开发环境ID需要正确配置
- 地图坐标可通过[腾讯位置服务](https://lbs.qq.com/getPoint/)获取

## 开发进度

- [x] 项目初始化和基础配置
- [ ] 工具函数模块
- [ ] 首页实现
- [ ] 详情页实现
- [ ] 回执页实现
- [ ] 留言板实现
- [ ] 云开发配置
- [ ] 测试和优化

## 许可证

MIT License

# 设计文档

## 概述

微信小程序婚宴请帖应用是一个基于微信小程序原生框架开发的数字化婚礼邀请系统。应用采用四页面架构，使用微信云开发服务处理数据存储，提供婚礼信息展示、宾客回执收集和祝福留言功能。

设计目标：
- 清新淡雅的视觉风格，主色调为淡蓝色+白色
- 简洁直观的用户交互体验
- 可靠的数据存储和读取
- 易于维护和扩展的代码结构

## 架构

### 整体架构

应用采用微信小程序标准架构，包含以下层次：

```
┌─────────────────────────────────────┐
│         表现层 (View Layer)          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │ 首页 │ │ 详情 │ │ 回执 │ │ 留言 ││
│  └──────┘ └──────┘ └──────┘ └──────┘│
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│        逻辑层 (Logic Layer)          │
│  ┌──────────────────────────────┐   │
│  │   页面逻辑 (Page Logic)       │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │   工具函数 (Utils)            │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│       数据层 (Data Layer)            │
│  ┌──────────────────────────────┐   │
│  │   微信云开发 (Cloud Base)     │   │
│  │   - 云数据库                  │   │
│  │   - 云函数                    │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 技术栈

- **前端框架**: 微信小程序原生框架
- **样式**: WXSS (微信样式表)
- **数据存储**: 微信云开发 - 云数据库
- **云函数**: 微信云开发 - 云函数
- **地图服务**: 微信地图API
- **图标**: 微信官方图标库

### 目录结构

```
wedding-invitation-miniapp/
├── pages/                    # 页面目录
│   ├── index/               # 首页
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   ├── index.js
│   │   └── index.json
│   ├── details/             # 详情页
│   │   ├── details.wxml
│   │   ├── details.wxss
│   │   ├── details.js
│   │   └── details.json
│   ├── rsvp/                # 回执页
│   │   ├── rsvp.wxml
│   │   ├── rsvp.wxss
│   │   ├── rsvp.js
│   │   └── rsvp.json
│   └── blessings/           # 留言板
│       ├── blessings.wxml
│       ├── blessings.wxss
│       ├── blessings.js
│       └── blessings.json
├── utils/                   # 工具函数
│   └── util.js
├── images/                  # 图片资源
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── photo3.jpg
├── cloudfunctions/          # 云函数
│   ├── submitRSVP/
│   │   └── index.js
│   └── addBlessing/
│       └── index.js
├── app.js                   # 小程序逻辑
├── app.json                 # 小程序配置
└── app.wxss                 # 全局样式
```

## 组件和接口

### 页面组件

#### 1. 首页 (index)

**职责**: 展示新人婚纱照、婚礼基本信息和倒计时

**数据结构**:
```javascript
{
  photos: [String],        // 婚纱照URL数组
  groomName: String,       // 新郎名字
  brideName: String,       // 新娘名字
  weddingDate: String,     // 婚礼日期
  weddingTime: String,     // 婚礼时间
  venue: String,           // 婚宴地点
  address: String,         // 详细地址
  daysLeft: Number         // 倒计时天数
}
```

**关键方法**:
- `calculateDaysLeft()`: 计算距离婚礼的剩余天数
- `onLoad()`: 页面加载时初始化数据和计算倒计时

**UI组件**:
- `swiper`: 轮播组件，展示3张婚纱照
- `swiper-item`: 轮播项
- `view`: 信息展示容器
- `text`: 文本显示

#### 2. 详情页 (details)

**职责**: 展示婚礼流程、交通指引和联系方式

**数据结构**:
```javascript
{
  schedule: [
    { time: String, event: String }
  ],
  venue: {
    name: String,
    address: String,
    latitude: Number,
    longitude: Number
  },
  contact: {
    name: String,
    phone: String
  }
}
```

**关键方法**:
- `openMap()`: 调用微信地图API打开导航
- `makePhoneCall()`: 调用微信拨号API

**UI组件**:
- `view`: 流程展示容器
- `map`: 地图组件（可选，或使用静态图片）
- `button`: 导航按钮、拨号按钮

#### 3. 回执页 (rsvp)

**职责**: 收集宾客参会信息并保存到云数据库

**数据结构**:
```javascript
{
  formData: {
    name: String,           // 姓名
    phone: String,          // 电话
    attendees: Number,      // 到场人数 (1-4)
    hasChildren: Boolean,   // 是否有儿童
    dietaryRestrictions: String  // 饮食禁忌
  }
}
```

**关键方法**:
- `validateForm()`: 验证表单数据完整性
- `submitRSVP()`: 提交回执到云数据库
- `showToast(message)`: 显示提示信息

**UI组件**:
- `form`: 表单容器
- `input`: 文本输入框
- `picker`: 数字选择器
- `switch`: 开关选择器
- `textarea`: 多行文本输入
- `button`: 提交按钮

#### 4. 留言板 (blessings)

**职责**: 展示和收集宾客祝福留言

**数据结构**:
```javascript
{
  blessingsList: [
    {
      _id: String,
      nickname: String,
      content: String,
      createTime: Date
    }
  ],
  inputContent: String
}
```

**关键方法**:
- `loadBlessings()`: 从云数据库加载留言列表
- `sendBlessing()`: 发送新留言到云数据库
- `formatTime(timestamp)`: 格式化时间显示

**UI组件**:
- `scroll-view`: 滚动列表容器
- `view`: 留言项容器
- `input`: 留言输入框
- `button`: 发送按钮

### 云开发接口

#### 云数据库集合

**rsvp 集合** (宾客回执):
```javascript
{
  _id: String,              // 自动生成
  _openid: String,          // 用户openid（自动）
  name: String,             // 姓名
  phone: String,            // 电话
  attendees: Number,        // 到场人数
  hasChildren: Boolean,     // 是否有儿童
  dietaryRestrictions: String,  // 饮食禁忌
  createTime: Date          // 提交时间（服务端时间）
}
```

**blessings 集合** (祝福留言):
```javascript
{
  _id: String,              // 自动生成
  _openid: String,          // 用户openid（自动）
  nickname: String,         // 访客昵称
  content: String,          // 祝福内容
  createTime: Date          // 发送时间（服务端时间）
}
```

#### 云函数

**submitRSVP** (提交回执):
```javascript
// 输入
{
  name: String,
  phone: String,
  attendees: Number,
  hasChildren: Boolean,
  dietaryRestrictions: String
}

// 输出
{
  success: Boolean,
  message: String,
  data: Object
}
```

**addBlessing** (添加留言):
```javascript
// 输入
{
  nickname: String,
  content: String
}

// 输出
{
  success: Boolean,
  message: String,
  data: Object
}
```

### 工具函数

**util.js**:
```javascript
// 格式化时间
formatTime(date): String

// 计算日期差
calculateDaysDiff(targetDate): Number

// 验证手机号
validatePhone(phone): Boolean

// 显示加载提示
showLoading(title): void

// 隐藏加载提示
hideLoading(): void
```

## 数据模型

### 婚礼信息模型

```javascript
WeddingInfo = {
  couple: {
    groom: "王峰",
    bride: "杨丽琴"
  },
  date: "2025-05-04",
  time: "12:00",
  venue: {
    name: "新城宴",
    address: "‌武汉市新洲区邾城街龙腾大道新城华府A4号楼",
    latitude: 30.826285,      // 示例坐标
    longitude: 114.811298
  },
  schedule: [
    { time: "11:00", event: "迎宾" },
    { time: "12:00", event: "仪式" },
    { time: "12:30", event: "午宴" }
  ],
  contact: {
    name: "新郎",
    phone: "13098812825"
  },
  photos: [
    "/images/20260223-183518.jpg",
    "/images/20260223-183532.jpg",
    "/images/20260223-183537.jpg"
    "/images/20260223-183542.jpg"
  ]
}
```

### 回执数据模型

```javascript
RSVPRecord = {
  _id: String,              // 数据库自动生成
  _openid: String,          // 微信用户标识
  name: String,             // 必填，宾客姓名
  phone: String,            // 必填，联系电话
  attendees: Number,        // 必填，1-4人
  hasChildren: Boolean,     // 必填，是否携带儿童
  dietaryRestrictions: String,  // 可选，饮食禁忌说明
  createTime: Date,         // 服务端时间戳
  updateTime: Date          // 更新时间
}
```

### 留言数据模型

```javascript
BlessingRecord = {
  _id: String,              // 数据库自动生成
  _openid: String,          // 微信用户标识
  nickname: String,         // 访客昵称（从微信获取）
  content: String,          // 祝福内容，最大500字
  createTime: Date,         // 服务端时间戳
  isVisible: Boolean        // 是否可见（预留审核功能）
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性反思

在编写正确性属性之前，我需要识别并消除冗余：

**识别的冗余**:
- 属性 3.4（验证必填字段）和 3.5（保存完整表单）可以合并为一个综合属性，测试表单验证和提交的完整流程
- 属性 4.6（保存留言）和 4.8（验证空内容）可以合并为一个属性，测试留言提交的验证和保存
- 多个"example"类型的测试（如导航、UI组件存在性）不需要单独的属性，可以通过单元测试覆盖

**保留的核心属性**:
- 倒计时计算（通用日期计算逻辑）
- 表单验证和数据保存（完整的输入验证流程）
- 留言排序（通用排序逻辑）
- 留言渲染（通用渲染逻辑）
- 数据完整性（保存时的字段完整性）

### 正确性属性

#### 属性 1: 倒计时计算正确性

*对于任意* 当前日期和目标婚礼日期，计算出的剩余天数应该等于两个日期之间的日历天数差

**验证需求: 1.8**

#### 属性 2: 到场人数范围验证

*对于任意* 输入的到场人数值，如果不在1-4范围内，表单验证应该返回失败

**验证需求: 3.3**

#### 属性 3: 必填字段验证

*对于任意* 回执表单数据，如果姓名、电话或到场人数字段为空或无效，表单验证应该返回失败并阻止提交

**验证需求: 3.4**

#### 属性 4: 回执数据完整性

*对于任意* 有效的回执表单提交，保存到数据库的记录应该包含所有必需字段：姓名、电话、到场人数、是否有儿童、饮食禁忌、提交时间

**验证需求: 7.4**

#### 属性 5: 留言时间倒序排列

*对于任意* 留言列表，显示顺序应该按createTime字段降序排列，即最新的留言显示在最前面

**验证需求: 4.3**

#### 属性 6: 留言内容渲染完整性

*对于任意* 留言对象，渲染后的HTML应该包含访客昵称、祝福内容和格式化后的发送时间

**验证需求: 4.4**

#### 属性 7: 空留言验证

*对于任意* 由纯空格字符组成的字符串或空字符串，留言提交验证应该返回失败并阻止提交

**验证需求: 4.8**

#### 属性 8: 留言数据完整性

*对于任意* 有效的留言提交，保存到数据库的记录应该包含所有必需字段：访客昵称、祝福内容、发送时间

**验证需求: 7.5**

#### 属性 9: Tab导航功能

*对于任意* Tab索引（0-3），点击对应Tab应该导航到正确的页面路径

**验证需求: 5.3**

## 错误处理

### 网络错误处理

**场景**: 云数据库操作失败（网络超时、服务不可用）

**处理策略**:
1. 捕获所有云数据库操作的Promise错误
2. 显示用户友好的错误提示："网络连接失败，请稍后重试"
3. 记录错误日志到控制台，便于调试
4. 不清空用户已输入的表单数据，允许重新提交

**实现**:
```javascript
try {
  const result = await db.collection('rsvp').add({
    data: formData
  });
  wx.showToast({ title: '提交成功', icon: 'success' });
} catch (error) {
  console.error('提交失败:', error);
  wx.showToast({ 
    title: '网络连接失败，请稍后重试', 
    icon: 'none',
    duration: 3000
  });
}
```

### 表单验证错误

**场景**: 用户提交不完整或无效的表单数据

**处理策略**:
1. 在提交前进行客户端验证
2. 显示具体的错误提示，指出哪个字段有问题
3. 阻止表单提交，保持用户输入
4. 使用红色边框或文字标记错误字段

**验证规则**:
- 姓名: 非空，长度2-20字符
- 电话: 符合中国手机号格式（11位数字）
- 到场人数: 1-4之间的整数
- 祝福内容: 非空，长度1-500字符

**实现**:
```javascript
validateForm(data) {
  if (!data.name || data.name.trim().length < 2) {
    wx.showToast({ title: '请输入有效姓名', icon: 'none' });
    return false;
  }
  
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(data.phone)) {
    wx.showToast({ title: '请输入有效手机号', icon: 'none' });
    return false;
  }
  
  if (data.attendees < 1 || data.attendees > 4) {
    wx.showToast({ title: '到场人数应为1-4人', icon: 'none' });
    return false;
  }
  
  return true;
}
```

### 云开发未初始化

**场景**: 云开发环境未正确配置或初始化失败

**处理策略**:
1. 在app.js的onLaunch中初始化云开发
2. 捕获初始化错误并记录
3. 在需要使用云功能的页面检查初始化状态
4. 显示配置指引信息

**实现**:
```javascript
// app.js
onLaunch() {
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力');
  } else {
    wx.cloud.init({
      env: 'app-env-wf-invitation-3a8672c704',  // 云开发环境ID
      traceUser: true
    });
  }
}
```

### 地图API调用失败

**场景**: 用户拒绝位置权限或地图API调用失败

**处理策略**:
1. 捕获wx.openLocation的错误
2. 提示用户检查位置权限设置
3. 提供备选方案：显示文字地址，允许复制

**实现**:
```javascript
openMap() {
  wx.openLocation({
    latitude: this.data.venue.latitude,
    longitude: this.data.venue.longitude,
    name: this.data.venue.name,
    address: this.data.venue.address,
    fail: (error) => {
      console.error('打开地图失败:', error);
      wx.showModal({
        title: '提示',
        content: '无法打开地图，请检查位置权限设置',
        showCancel: false
      });
    }
  });
}
```

### 图片加载失败

**场景**: 婚纱照图片加载失败或路径错误

**处理策略**:
1. 为图片设置默认占位图
2. 监听image组件的error事件
3. 显示加载失败提示或使用备用图片

**实现**:
```xml
<!-- wxml -->
<image 
  src="{{photoUrl}}" 
  mode="aspectFill"
  binderror="onImageError"
  class="photo"
/>
```

```javascript
// js
onImageError(e) {
  console.error('图片加载失败:', e.detail);
  // 可以设置默认图片
  this.setData({
    photoUrl: '/images/default-photo.jpg'
  });
}
```

## 测试策略

### 双重测试方法

本项目采用单元测试和属性测试相结合的方法，确保全面的代码覆盖和正确性验证。

**单元测试**: 验证特定示例、边缘情况和错误条件
**属性测试**: 验证跨所有输入的通用属性

两者互补且都是必需的：单元测试捕获具体错误，属性测试验证一般正确性。

### 单元测试

**测试框架**: 微信小程序官方测试框架 miniprogram-simulate

**测试重点**:
- 页面初始化和数据加载
- 用户交互事件处理
- API调用（模拟wx对象）
- 特定边缘情况

**示例测试用例**:

```javascript
// 测试首页加载
describe('首页', () => {
  it('应该正确显示新人名字', () => {
    const page = render('pages/index/index');
    expect(page.data.groomName).toBe('王峰');
    expect(page.data.brideName).toBe('杨丽琴');
  });
  
  it('应该显示3张婚纱照', () => {
    const page = render('pages/index/index');
    expect(page.data.photos.length).toBe(3);
  });
});

// 测试表单验证
describe('回执表单验证', () => {
  it('应该拒绝空姓名', () => {
    const result = validateForm({ name: '', phone: '13098812825', attendees: 2 });
    expect(result).toBe(false);
  });
  
  it('应该拒绝无效手机号', () => {
    const result = validateForm({ name: '张三', phone: '123', attendees: 2 });
    expect(result).toBe(false);
  });
  
  it('应该接受有效表单', () => {
    const result = validateForm({ 
      name: '张三', 
      phone: '13900000000', 
      attendees: 2,
      hasChildren: false,
      dietaryRestrictions: ''
    });
    expect(result).toBe(true);
  });
});
```

### 属性测试

**测试框架**: 由于JavaScript生态中属性测试库较少，建议使用 **fast-check** 库

**配置**: 每个属性测试运行最少100次迭代

**标签格式**: 每个测试必须引用设计文档中的属性
```javascript
// Feature: wedding-invitation-miniapp, Property 1: 倒计时计算正确性
```

**属性测试实现**:

```javascript
const fc = require('fast-check');

// 属性 1: 倒计时计算正确性
// Feature: wedding-invitation-miniapp, Property 1: 倒计时计算正确性
describe('属性测试: 倒计时计算', () => {
  it('对于任意日期，计算的天数差应该正确', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') }),
        (currentDate, targetDate) => {
          const result = calculateDaysDiff(currentDate, targetDate);
          const expected = Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));
          return result === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// 属性 2: 到场人数范围验证
// Feature: wedding-invitation-miniapp, Property 2: 到场人数范围验证
describe('属性测试: 到场人数验证', () => {
  it('对于1-4范围外的任意数字，验证应该失败', () => {
    fc.assert(
      fc.property(
        fc.integer().filter(n => n < 1 || n > 4),
        (attendees) => {
          const result = validateAttendees(attendees);
          return result === false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('对于1-4范围内的任意数字，验证应该成功', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        (attendees) => {
          const result = validateAttendees(attendees);
          return result === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// 属性 5: 留言时间倒序排列
// Feature: wedding-invitation-miniapp, Property 5: 留言时间倒序排列
describe('属性测试: 留言排序', () => {
  it('对于任意留言列表，排序后应该按时间降序', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          nickname: fc.string(),
          content: fc.string(),
          createTime: fc.date()
        })),
        (blessings) => {
          const sorted = sortBlessingsByTime(blessings);
          // 验证排序正确性
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].createTime < sorted[i + 1].createTime) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// 属性 7: 空留言验证
// Feature: wedding-invitation-miniapp, Property 7: 空留言验证
describe('属性测试: 空留言验证', () => {
  it('对于任意纯空格字符串，验证应该失败', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.trim().length === 0),
        (content) => {
          const result = validateBlessingContent(content);
          return result === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 集成测试

**测试场景**:
1. 完整的回执提交流程：填写表单 → 验证 → 保存到云数据库 → 显示成功提示
2. 完整的留言发送流程：输入内容 → 验证 → 保存到云数据库 → 刷新列表
3. 页面导航流程：点击Tab → 切换页面 → 验证页面内容加载

**模拟环境**:
- 使用miniprogram-simulate模拟小程序环境
- 模拟wx.cloud数据库操作
- 模拟wx API调用（showToast, openLocation等）

### 测试覆盖目标

- 代码覆盖率: 目标80%以上
- 关键路径: 100%覆盖（表单提交、数据保存、页面导航）
- 错误处理: 所有catch块都应该有对应的测试用例

### 测试执行

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行属性测试
npm run test:property

# 生成覆盖率报告
npm run test:coverage
```

## 实现注意事项

### 云开发配置

1. 在微信开发者工具中开通云开发
2. 创建云开发环境，获取环境ID
3. 在app.js中配置环境ID
4. 创建数据库集合：rsvp、blessings
5. 配置数据库权限：允许所有用户读写（或根据需求设置）

### 性能优化

1. **图片优化**: 婚纱照应该压缩到合适大小（建议每张<500KB）
2. **懒加载**: 留言列表使用分页加载，每次加载20条
3. **缓存**: 婚礼信息可以缓存到本地存储，减少重复加载
4. **防抖**: 留言发送按钮添加防抖，防止重复提交

### 用户体验

1. **加载状态**: 数据加载时显示loading提示
2. **空状态**: 留言列表为空时显示友好提示
3. **反馈**: 所有操作都应该有明确的成功/失败反馈
4. **无障碍**: 添加适当的aria标签，支持屏幕阅读器

### 安全考虑

1. **输入验证**: 所有用户输入都应该在客户端和服务端验证
2. **XSS防护**: 留言内容显示前进行HTML转义
3. **敏感信息**: 电话号码等敏感信息应该加密存储（可选）
4. **权限控制**: 考虑添加管理员功能，审核留言内容

# 云函数使用指南

本项目提供了两种数据操作方式：

## 方式一：直接使用云数据库（当前实现）

**优点**：
- 代码简单，无需额外配置
- 实时性好，直接操作数据库
- 适合快速开发和原型验证

**缺点**：
- 需要配置数据库权限为"所有用户可读写"
- 缺少服务端验证和安全控制
- 无法实现复杂的业务逻辑

**当前使用场景**：
- `pages/rsvp/rsvp.js` - 直接使用 `db.collection('rsvp').add()`
- `pages/blessings/blessings.js` - 直接使用 `db.collection('blessings').add()`

## 方式二：使用云函数（推荐生产环境）

**优点**：
- 服务端验证，安全性高
- 可以实现复杂业务逻辑
- 统一的错误处理和日志记录
- 可以添加敏感词过滤、限流等功能

**缺点**：
- 需要部署和维护云函数
- 代码相对复杂一些

### 如何切换到云函数方式

#### 1. 修改回执页面（pages/rsvp/rsvp.js）

将 `submitRSVP()` 方法中的数据库操作替换为云函数调用：

```javascript
// 原代码（直接使用数据库）
const db = wx.cloud.database();
db.collection('rsvp').add({
  data: {
    name: formData.name.trim(),
    phone: formData.phone,
    attendees: formData.attendees,
    hasChildren: formData.hasChildren,
    dietaryRestrictions: formData.dietaryRestrictions.trim(),
    createTime: db.serverDate()
  }
}).then(res => {
  // ...
});

// 修改为（使用云函数）
wx.cloud.callFunction({
  name: 'submitRSVP',
  data: {
    name: formData.name.trim(),
    phone: formData.phone,
    attendees: formData.attendees,
    hasChildren: formData.hasChildren,
    dietaryRestrictions: formData.dietaryRestrictions.trim()
  }
}).then(res => {
  util.hideLoading();
  
  if (res.result.success) {
    util.showSuccess('提交成功');
    this.resetForm();
  } else {
    util.showError(res.result.message);
  }
}).catch(err => {
  util.hideLoading();
  console.error('提交失败:', err);
  util.showError('提交失败，请稍后重试');
});
```

#### 2. 修改留言板页面（pages/blessings/blessings.js）

将 `submitBlessing()` 方法中的数据库操作替换为云函数调用：

```javascript
// 原代码（直接使用数据库）
const db = wx.cloud.database();
db.collection('blessings').add({
  data: {
    nickname: nickname,
    content: content,
    createTime: db.serverDate()
  }
}).then(res => {
  // ...
});

// 修改为（使用云函数）
wx.cloud.callFunction({
  name: 'addBlessing',
  data: {
    nickname: nickname,
    content: content
  }
}).then(res => {
  util.hideLoading();
  
  if (res.result.success) {
    util.showSuccess('发送成功');
    this.setData({
      inputContent: '',
      submitting: false
    });
    this.loadBlessings();
  } else {
    util.showError(res.result.message);
    this.setData({ submitting: false });
  }
}).catch(err => {
  util.hideLoading();
  console.error('发送失败:', err);
  util.showError('发送失败，请稍后重试');
  this.setData({ submitting: false });
});
```

#### 3. 修改数据库权限

使用云函数后，可以将数据库权限设置为更严格的模式：

- rsvp 集合：仅管理员可读写（通过云函数操作）
- blessings 集合：所有用户可读，仅管理员可写（通过云函数操作）

## 推荐方案

### 开发阶段
使用**方式一（直接使用数据库）**：
- 快速开发，无需部署云函数
- 数据库权限设置为"所有用户可读写"
- 适合快速迭代和测试

### 生产环境
使用**方式二（使用云函数）**：
- 更安全，有服务端验证
- 可以添加敏感词过滤、限流等功能
- 数据库权限设置为更严格的模式

## 性能对比

| 操作方式 | 响应时间 | 安全性 | 复杂度 |
|---------|---------|--------|--------|
| 直接数据库 | 快（~100ms） | 低 | 简单 |
| 云函数 | 中（~200ms） | 高 | 中等 |

## 注意事项

1. **云函数冷启动**：首次调用云函数可能需要1-2秒，后续调用会很快
2. **并发限制**：云函数有并发限制，基础版为1000次/秒
3. **超时设置**：云函数默认超时时间为20秒
4. **日志查看**：在云开发控制台可以查看云函数调用日志

## 混合使用

也可以混合使用两种方式：
- 读操作：直接使用数据库（更快）
- 写操作：使用云函数（更安全）

例如：
- 留言列表加载：直接查询数据库
- 留言提交：使用云函数

## 总结

当前项目使用**方式一（直接数据库）**实现，适合快速开发和演示。

如果需要部署到生产环境，建议切换到**方式二（云函数）**，提高安全性和可维护性。

切换方式只需要修改两个文件中的数据提交代码，其他代码无需改动。

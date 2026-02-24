# 云函数说明

本项目包含两个云函数，用于处理宾客回执和祝福留言的数据操作。

## 云函数列表

### 1. submitRSVP - 提交宾客回执

**功能**: 接收并验证宾客回执表单数据，保存到云数据库

**输入参数**:
```javascript
{
  name: String,              // 姓名（必填，2-20字符）
  phone: String,             // 手机号（必填，11位数字）
  attendees: Number,         // 到场人数（必填，1-4）
  hasChildren: Boolean,      // 是否有儿童（必填）
  dietaryRestrictions: String // 饮食禁忌（选填）
}
```

**返回结果**:
```javascript
{
  success: Boolean,  // 是否成功
  message: String,   // 提示信息
  data: {
    _id: String     // 记录ID（成功时返回）
  }
}
```

**验证规则**:
- 姓名：2-20字符
- 手机号：符合中国手机号格式（1开头，11位数字）
- 到场人数：1-4之间的整数

### 2. addBlessing - 添加祝福留言

**功能**: 接收并验证祝福留言，保存到云数据库

**输入参数**:
```javascript
{
  nickname: String,  // 访客昵称（选填，默认"访客"）
  content: String    // 祝福内容（必填，1-500字符）
}
```

**返回结果**:
```javascript
{
  success: Boolean,  // 是否成功
  message: String,   // 提示信息
  data: {
    _id: String     // 记录ID（成功时返回）
  }
}
```

**验证规则**:
- 内容：非空，1-500字符
- 敏感词过滤：包含敏感词时拒绝提交

## 部署步骤

### 1. 安装依赖

在每个云函数目录下执行：

```bash
cd cloudfunctions/submitRSVP
npm install

cd ../addBlessing
npm install
```

### 2. 上传并部署

在微信开发者工具中：

1. 右键点击 `cloudfunctions/submitRSVP` 文件夹
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成
4. 重复以上步骤部署 `addBlessing` 云函数

### 3. 测试云函数

在云开发控制台的"云函数"页面：

1. 点击云函数名称
2. 点击"测试"标签
3. 输入测试参数
4. 点击"测试"按钮查看结果

**submitRSVP 测试参数**:
```json
{
  "name": "张三",
  "phone": "13900000000",
  "attendees": 2,
  "hasChildren": false,
  "dietaryRestrictions": "无"
}
```

**addBlessing 测试参数**:
```json
{
  "nickname": "测试用户",
  "content": "祝新人百年好合，永结同心！"
}
```

## 注意事项

1. **环境配置**: 云函数会自动使用当前环境，无需手动配置环境ID
2. **权限设置**: 确保数据库集合权限设置正确，允许云函数读写
3. **错误处理**: 云函数已包含完整的错误处理和日志记录
4. **性能优化**: 云函数会自动缓存，无需担心冷启动问题
5. **敏感词库**: 可根据需要在 `addBlessing/index.js` 中添加更多敏感词

## 可选优化

### 1. 添加更多验证规则

在云函数中可以添加更复杂的验证逻辑，如：
- IP限流：防止恶意刷屏
- 重复检测：防止重复提交
- 内容审核：接入微信内容安全API

### 2. 数据统计

可以添加云函数记录统计数据：
- 回执提交数量
- 留言发送数量
- 用户活跃度

### 3. 通知功能

可以添加云函数发送通知：
- 新回执提醒（发送模板消息给新人）
- 新留言提醒

## 故障排查

### 云函数调用失败

1. 检查云函数是否已上传并部署
2. 检查云开发环境是否已开通
3. 查看云函数日志（云开发控制台 → 云函数 → 日志）
4. 确认小程序基础库版本 >= 2.2.3

### 数据保存失败

1. 检查数据库集合是否已创建
2. 检查数据库权限设置
3. 查看云函数日志中的错误信息

## 相关文档

- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [云函数文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html)
- [云数据库文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)

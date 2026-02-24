# 云开发环境配置指南

本文档详细说明如何配置微信小程序云开发环境。

## 前置要求

- 已注册微信小程序账号
- 已安装微信开发者工具
- 小程序已通过实名认证（云开发需要）

## 配置步骤

### 1. 开通云开发

1. 打开微信开发者工具，导入项目
2. 点击工具栏的"云开发"按钮
3. 首次使用需要开通云开发服务
4. 选择"开通"，同意服务协议
5. 创建云开发环境：
   - 环境名称：可自定义，如 `wedding-prod`
   - 环境ID：系统自动生成，如 `wedding-xxx`
   - 选择基础版（免费）或其他套餐

### 2. 配置环境ID

1. 复制云开发环境ID
2. 打开项目中的 `app.js` 文件
3. 找到 `wx.cloud.init()` 方法
4. 将 `env` 参数修改为你的环境ID：

```javascript
wx.cloud.init({
  env: 'your-cloud-env-id',  // 替换为你的环境ID
  traceUser: true
});
```

### 3. 创建数据库集合

1. 在微信开发者工具中，点击"云开发"按钮
2. 进入云开发控制台
3. 点击左侧菜单"数据库"
4. 点击"添加集合"按钮

#### 创建 rsvp 集合（宾客回执）

- 集合名称：`rsvp`
- 权限设置：建议选择"所有用户可读写"（开发阶段）
- 字段说明：
  ```
  _id: String (自动生成)
  _openid: String (自动生成)
  name: String (姓名)
  phone: String (电话)
  attendees: Number (到场人数)
  hasChildren: Boolean (是否有儿童)
  dietaryRestrictions: String (饮食禁忌)
  createTime: Date (提交时间)
  ```

#### 创建 blessings 集合（祝福留言）

- 集合名称：`blessings`
- 权限设置：建议选择"所有用户可读写"（开发阶段）
- 字段说明：
  ```
  _id: String (自动生成)
  _openid: String (自动生成)
  nickname: String (访客昵称)
  content: String (祝福内容)
  createTime: Date (发送时间)
  ```

### 4. 配置数据库权限

开发阶段建议使用"所有用户可读写"权限，生产环境建议配置更严格的权限：

1. 进入数据库集合
2. 点击"权限设置"
3. 选择合适的权限模式：
   - **所有用户可读写**：适合开发测试
   - **仅创建者可读写**：用户只能读写自己创建的数据
   - **自定义权限**：使用云函数控制权限

### 5. 创建云函数（后续任务）

云函数已经创建完成，包括：

#### submitRSVP 云函数
- 功能：提交宾客回执到数据库
- 路径：`cloudfunctions/submitRSVP/`
- 包含服务端数据验证和错误处理

#### addBlessing 云函数
- 功能：添加祝福留言到数据库
- 路径：`cloudfunctions/addBlessing/`
- 包含敏感词过滤和内容验证

创建云函数的步骤：

**方法一：使用微信开发者工具（推荐）**

1. 在项目根目录创建 `cloudfunctions` 文件夹（已创建）
2. 在微信开发者工具中，右键点击 `cloudfunctions/submitRSVP` 文件夹
3. 选择"上传并部署：云端安装依赖"
4. 等待部署完成（首次部署需要安装依赖，可能需要几分钟）
5. 重复以上步骤部署 `addBlessing` 云函数

**方法二：使用命令行**

```bash
# 进入云函数目录
cd cloudfunctions/submitRSVP

# 安装依赖
npm install

# 返回项目根目录
cd ../..

# 使用微信开发者工具上传
```

**验证云函数部署**

1. 打开云开发控制台
2. 点击左侧"云函数"菜单
3. 应该看到 `submitRSVP` 和 `addBlessing` 两个云函数
4. 点击云函数名称，查看详情和日志

**测试云函数**

在云开发控制台测试云函数：

submitRSVP 测试参数：
```json
{
  "name": "张三",
  "phone": "13900000000",
  "attendees": 2,
  "hasChildren": false,
  "dietaryRestrictions": "无"
}
```

addBlessing 测试参数：
```json
{
  "nickname": "测试用户",
  "content": "祝新人百年好合，永结同心！"
}
```

### 6. 测试云开发

1. 在微信开发者工具中编译项目
2. 打开调试器，查看 Console
3. 应该看到"云开发初始化成功"的日志
4. 如果出现错误，检查环境ID是否正确

## 常见问题

### Q: 提示"云开发未开通"
A: 确保小程序已通过实名认证，并在云开发控制台开通服务

### Q: 提示"env参数错误"
A: 检查 `app.js` 中的环境ID是否正确复制

### Q: 数据库操作失败
A: 检查数据库集合是否创建，权限是否正确配置

### Q: 云函数调用失败
A: 确保云函数已上传并部署，检查云函数代码是否有错误

## 配额说明

微信云开发基础版（免费）配额：
- 数据库容量：2GB
- 云函数调用次数：10万次/月
- 云存储容量：5GB
- CDN流量：5GB/月

超出配额后需要升级套餐或等待下月重置。

## 安全建议

1. **生产环境**应使用更严格的数据库权限
2. 敏感操作应通过**云函数**处理，不要直接在小程序端操作数据库
3. 对用户输入进行**验证和过滤**，防止恶意数据
4. 定期**备份数据库**数据

## 参考资料

- [微信小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [云数据库文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)
- [云函数文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html)

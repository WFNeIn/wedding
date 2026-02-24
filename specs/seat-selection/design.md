# 设计文档 - 婚礼在线选座功能

## 概述

婚礼在线选座功能是一个基于微信小程序的座位管理系统，允许宾客在线查看宴会厅布局、选择座位类型并预订座位。系统使用微信云开发作为后端，提供实时座位状态同步和并发控制。

核心功能包括：
- 可视化座位布局展示（舞台、通道、左右就餐区）
- 4种宾客类型分类（同学同事、父亲的同事、母亲的同事、父母的亲友）
- 实时座位状态管理（空闲/已占用）
- 座位选择与提交
- 已选座位查询
- 管理员座位总览
- 并发控制确保座位唯一性

## 架构

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    微信小程序前端                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  选座页面     │  │  我的座位页面 │  │  管理员页面   │  │
│  │  (seat)      │  │  (my-seat)   │  │  (admin)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │  座位管理服务    │                     │
│                  │  (SeatService)  │                     │
│                  └────────┬────────┘                     │
└───────────────────────────┼──────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   微信云开发     │
                   ├─────────────────┤
                   │  云函数          │
                   │  - selectSeat   │
                   │  - getSeats     │
                   │  - getMySeat    │
                   │  - getAllSeats  │
                   ├─────────────────┤
                   │  云数据库        │
                   │  - seats集合    │
                   └─────────────────┘
```

### 数据流

1. **座位查询流程**
   ```
   用户打开选座页面 → 调用getSeats云函数 → 查询seats集合
   → 返回所有座位状态 → 渲染座位布局
   ```

2. **座位选择流程**
   ```
   用户选择宾客类型 → 点击空闲座位 → 本地标记选中状态 
   → 点击提交 → 调用selectSeat云函数 → 验证座位状态 
   → 保存到数据库 → 返回结果 → 更新UI
   ```

3. **并发控制流程**
   ```
   多个用户同时提交 → 云函数接收请求 → 使用数据库唯一索引 
   → 第一个请求成功，其他请求失败 → 返回相应结果
   ```

## 组件和接口

### 前端组件

#### 1. SeatLayout 组件（座位布局）

**职责**: 渲染宴会厅座位布局，包括舞台、通道和座位区域

**接口**:
```javascript
// 组件属性
{
  seats: Array<Seat>,        // 座位数据数组
  selectedSeat: Seat | null, // 当前选中的座位
  guestType: string | null,  // 当前宾客类型
  onSeatClick: (seat: Seat) => void  // 座位点击回调
}

// 座位对象结构
Seat {
  row: number,        // 排号 (1-4)
  col: number,        // 列号 (1-5)
  side: string,       // 左侧'left'或右侧'right'
  status: string,     // 状态: 'available' | 'occupied'
  guestType: string | null,  // 宾客类型
  openid: string | null      // 占用者openid
}
```

**渲染逻辑**:
- 舞台区域：固定在顶部，显示"舞台"文字
- 通道区域：中间垂直区域，显示"通道"文字
- 左侧座位区：4排5列，每排从左到右编号1-5
- 右侧座位区：4排5列，每排从左到右编号1-5
- 座位颜色：根据guestType映射颜色，空闲座位显示默认颜色

#### 2. GuestTypeSelector 组件（宾客类型选择器）

**职责**: 提供宾客类型选择界面

**接口**:
```javascript
{
  selectedType: string | null,  // 当前选中的类型
  onTypeSelect: (type: string) => void  // 类型选择回调
}

// 宾客类型常量
GUEST_TYPES = [
  { id: 'classmate', name: '同学同事', color: '#FF6B6B' },
  { id: 'father_colleague', name: '父亲的同事', color: '#4ECDC4' },
  { id: 'mother_colleague', name: '母亲的同事', color: '#FFD93D' },
  { id: 'parent_friend', name: '父母的亲友', color: '#95E1D3' }
]
```

#### 3. SeatService 服务（座位管理服务）

**职责**: 封装座位相关的业务逻辑和云函数调用

**接口**:
```javascript
class SeatService {
  // 获取所有座位状态
  async getSeats(): Promise<Array<Seat>>
  
  // 选择座位
  async selectSeat(row: number, col: number, side: string, guestType: string): Promise<Result>
  
  // 获取当前用户的座位
  async getMySeat(): Promise<Seat | null>
  
  // 获取所有座位（管理员）
  async getAllSeatsWithStats(): Promise<{
    seats: Array<Seat>,
    stats: {
      total: number,
      occupied: number,
      available: number,
      byType: { [key: string]: number }
    }
  }>
  
  // 生成初始座位数据
  generateInitialSeats(): Array<Seat>
}

// 结果对象
Result {
  success: boolean,
  message: string,
  data?: any
}
```

### 云函数接口

#### 1. selectSeat 云函数

**功能**: 处理座位选择请求，验证并保存座位信息

**输入参数**:
```javascript
{
  row: number,        // 排号 (1-4)
  col: number,        // 列号 (1-5)
  side: string,       // 'left' | 'right'
  guestType: string   // 宾客类型ID
}
```

**输出**:
```javascript
{
  success: boolean,
  message: string,
  data?: {
    _id: string,
    seat: Seat
  }
}
```

**处理逻辑**:
1. 获取用户openid
2. 验证输入参数（row: 1-4, col: 1-5, side: left/right, guestType: 有效类型）
3. 检查用户是否已选座位
4. 构造座位唯一标识：`${side}_${row}_${col}`
5. 尝试插入数据库（利用唯一索引确保并发安全）
6. 返回结果

#### 2. getSeats 云函数

**功能**: 获取所有座位的当前状态

**输入参数**: 无

**输出**:
```javascript
{
  success: boolean,
  data: Array<Seat>
}
```

**处理逻辑**:
1. 查询seats集合所有记录
2. 生成完整的40个座位数据（包括未占用的座位）
3. 返回座位数组

#### 3. getMySeat 云函数

**功能**: 获取当前用户已选的座位

**输入参数**: 无

**输出**:
```javascript
{
  success: boolean,
  data: Seat | null
}
```

**处理逻辑**:
1. 获取用户openid
2. 查询seats集合中openid匹配的记录
3. 返回座位信息或null

#### 4. getAllSeats 云函数（管理员）

**功能**: 获取所有座位信息和统计数据

**输入参数**: 无

**输出**:
```javascript
{
  success: boolean,
  data: {
    seats: Array<Seat>,
    stats: {
      total: number,
      occupied: number,
      available: number,
      byType: { [key: string]: number }
    }
  }
}
```

**处理逻辑**:
1. 查询所有座位记录
2. 计算统计数据
3. 返回完整信息

## 数据模型

### seats 集合（云数据库）

**集合名称**: `seats`

**文档结构**:
```javascript
{
  _id: string,              // 自动生成的文档ID
  _openid: string,          // 微信用户openid（自动添加）
  seatId: string,           // 座位唯一标识 "left_1_1" 格式
  row: number,              // 排号 (1-4)
  col: number,              // 列号 (1-5)
  side: string,             // 'left' | 'right'
  guestType: string,        // 宾客类型ID
  guestTypeName: string,    // 宾客类型名称（冗余字段，便于查询）
  createTime: Date,         // 选座时间（服务端时间）
  updateTime: Date          // 更新时间（服务端时间）
}
```

**索引设计**:
- `seatId`: 唯一索引，确保同一座位不能被多次占用
- `_openid`: 普通索引，用于查询用户的座位
- `guestType`: 普通索引，用于统计分析

**数据约束**:
- `seatId` 必须唯一
- `row` 范围: 1-4
- `col` 范围: 1-5
- `side` 枚举: 'left' | 'right'
- `guestType` 枚举: 'classmate' | 'father_colleague' | 'mother_colleague' | 'parent_friend'

### 座位编号规则

**座位标识格式**: `${side}_${row}_${col}`

**示例**:
- 左侧第1排第1列: `left_1_1`
- 右侧第4排第5列: `right_4_5`

**布局示意**:
```
                    [舞台]
        
左侧区域                        右侧区域
1-1  1-2  1-3  1-4  1-5    1-1  1-2  1-3  1-4  1-5
2-1  2-2  2-3  2-4  2-5    2-1  2-2  2-3  2-4  2-5
3-1  3-2  3-3  3-4  3-5    3-1  3-2  3-3  3-4  3-5
4-1  4-2  4-3  4-4  4-5    4-1  4-2  4-3  4-4  4-5
        
              [通道]
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 座位布局完整性

*对于任意*生成的座位布局，应该包含恰好40个座位（左侧20个，右侧20个），每侧4排5列，且每个座位具有唯一的seatId

**验证需求: 1.3, 1.4**

### 属性 2: 座位状态一致性

*对于任意*座位状态数据，如果座位的status为'available'，则其openid和guestType应为null；如果status为'occupied'，则openid和guestType应为有效值

**验证需求: 2.1, 2.2**

### 属性 3: 宾客类型颜色唯一性

*对于任意*两个不同的宾客类型，它们映射的颜色标识应该不同

**验证需求: 3.3**

### 属性 4: 类型选择记录一致性

*对于任意*宾客类型选择操作，选择后的状态应该与选择的类型值一致

**验证需求: 3.2, 3.4**

### 属性 5: 空闲座位可选性

*对于任意*状态为'available'的座位，点击操作应该能够标记为选中状态

**验证需求: 4.1**

### 属性 6: 已占用座位不可选

*对于任意*状态为'occupied'的座位，点击操作应该被阻止且不改变任何状态

**验证需求: 4.2**

### 属性 7: 座位提交验证

*对于任意*座位提交请求，如果座位当前为'occupied'状态，提交应该失败并返回错误信息

**验证需求: 4.4**

### 属性 8: 座位数据持久化完整性

*对于任意*成功保存的座位记录，数据库中的记录应该包含seatId、row、col、side、guestType、openid和createTime字段，且值与提交的数据一致

**验证需求: 5.2, 5.3, 5.4, 5.5**

### 属性 9: 座位唯一性约束

*对于任意*两个针对同一seatId的并发提交请求，只有一个应该成功，另一个应该失败

**验证需求: 5.6, 9.1**

### 属性 10: 用户座位查询一致性

*对于任意*已选座位的用户，查询自己的座位应该返回与数据库中该用户openid对应的座位记录一致的数据

**验证需求: 6.2, 6.3**

### 属性 11: 座位统计准确性

*对于任意*座位数据集合，统计的总座位数应为40，已占用数量应等于数据库记录数，空闲数量应等于40减去已占用数量，且各类型统计之和应等于已占用数量

**验证需求: 7.2, 7.4, 7.5**

### 属性 12: 并发冲突处理

*对于任意*座位选择冲突场景，后续的选座请求应该被拒绝，且系统应该刷新座位状态显示最新数据

**验证需求: 9.2, 9.3**

### 属性 13: 操作反馈一致性

*对于任意*座位选择操作，成功时应该更新UI状态并显示成功提示，失败时应该显示错误提示且不改变座位状态

**验证需求: 4.6, 10.2, 10.3**

## 错误处理

### 错误类型

1. **参数验证错误**
   - 无效的row/col值（超出范围）
   - 无效的side值（不是left或right）
   - 无效的guestType值（不在预定义类型中）
   - 处理：返回400错误，提示具体参数错误

2. **业务逻辑错误**
   - 用户未选择宾客类型就尝试选座
   - 用户已经选过座位再次选座
   - 座位已被占用
   - 处理：返回业务错误码，显示友好提示信息

3. **并发冲突错误**
   - 多个用户同时选择同一座位
   - 处理：利用数据库唯一索引，第一个成功，其他返回冲突错误

4. **网络错误**
   - 云函数调用失败
   - 数据库连接失败
   - 处理：显示网络错误提示，提供重试按钮

5. **权限错误**
   - 非管理员访问管理员功能
   - 处理：返回403错误，跳转到普通用户页面

### 错误处理策略

```javascript
// 统一错误处理函数
function handleError(error) {
  if (error.code === 'INVALID_PARAM') {
    wx.showToast({
      title: '参数错误：' + error.message,
      icon: 'none'
    });
  } else if (error.code === 'SEAT_OCCUPIED') {
    wx.showModal({
      title: '座位已被占用',
      content: '该座位刚刚被其他宾客选择，请选择其他座位',
      showCancel: false,
      success: () => {
        // 刷新座位状态
        this.loadSeats();
      }
    });
  } else if (error.code === 'ALREADY_SELECTED') {
    wx.showModal({
      title: '您已选过座位',
      content: '每位宾客只能选择一个座位',
      showCancel: false
    });
  } else if (error.code === 'NETWORK_ERROR') {
    wx.showModal({
      title: '网络错误',
      content: '请检查网络连接后重试',
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          // 重试操作
        }
      }
    });
  } else {
    wx.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    });
  }
}
```

### 降级策略

1. **数据加载失败**: 显示缓存数据（如果有），并提示数据可能不是最新
2. **提交失败**: 保存本地草稿，允许用户稍后重试
3. **实时更新失败**: 降级为手动刷新模式

## 测试策略

### 双重测试方法

本项目采用单元测试和属性测试相结合的方式，确保全面的代码覆盖和正确性验证：

- **单元测试**: 验证特定示例、边缘情况和错误条件
- **属性测试**: 通过随机生成的输入验证通用属性

两者互补，共同提供全面覆盖：单元测试捕获具体的bug，属性测试验证一般正确性。

### 属性测试配置

**测试框架**: 使用 `fast-check` 库进行属性测试（JavaScript/TypeScript的属性测试库）

**配置要求**:
- 每个属性测试最少运行100次迭代（由于随机化）
- 每个测试必须引用其设计文档中的属性
- 标签格式: `// Feature: seat-selection, Property {number}: {property_text}`
- 每个正确性属性必须由单个属性测试实现

**示例属性测试**:
```javascript
// Feature: seat-selection, Property 1: 座位布局完整性
test('座位布局应包含40个唯一座位', () => {
  fc.assert(
    fc.property(fc.constant(null), () => {
      const seats = generateInitialSeats();
      
      // 验证总数
      expect(seats.length).toBe(40);
      
      // 验证左右分布
      const leftSeats = seats.filter(s => s.side === 'left');
      const rightSeats = seats.filter(s => s.side === 'right');
      expect(leftSeats.length).toBe(20);
      expect(rightSeats.length).toBe(20);
      
      // 验证唯一性
      const seatIds = seats.map(s => s.seatId);
      const uniqueIds = new Set(seatIds);
      expect(uniqueIds.size).toBe(40);
      
      // 验证行列范围
      seats.forEach(seat => {
        expect(seat.row).toBeGreaterThanOrEqual(1);
        expect(seat.row).toBeLessThanOrEqual(4);
        expect(seat.col).toBeGreaterThanOrEqual(1);
        expect(seat.col).toBeLessThanOrEqual(5);
      });
    }),
    { numRuns: 100 }
  );
});
```

### 单元测试策略

**测试重点**:
1. 边缘情况：空数据、边界值、特殊字符
2. 错误条件：无效输入、权限不足、网络失败
3. 集成点：云函数调用、数据库操作、UI交互

**测试工具**:
- 微信小程序官方测试工具
- Jest（用于云函数单元测试）
- Miniprogram Simulate（用于组件测试）

**测试覆盖目标**:
- 云函数代码覆盖率 > 80%
- 关键业务逻辑覆盖率 > 90%
- 所有错误处理路径必须测试

### 测试场景

#### 功能测试
1. 座位布局正确渲染
2. 宾客类型选择和颜色映射
3. 座位选择和提交流程
4. 已选座位查询
5. 管理员统计功能

#### 并发测试
1. 模拟多用户同时选择同一座位
2. 验证唯一性约束生效
3. 验证错误提示和状态刷新

#### 性能测试
1. 40个座位的渲染性能
2. 云函数响应时间
3. 数据库查询性能

#### 兼容性测试
1. 不同微信版本
2. 不同手机型号和屏幕尺寸
3. 网络环境（4G、WiFi、弱网）

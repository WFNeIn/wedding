/**
 * 座位服务模块
 * 提供座位相关的数据模型和业务逻辑
 */

// 宾客类型常量定义
const GUEST_TYPES = [
  { 
    id: 'classmate', 
    name: '同学同事', 
    color: '#FF6B6B' 
  },
  { 
    id: 'father_colleague', 
    name: '父亲的同事', 
    color: '#4ECDC4' 
  },
  { 
    id: 'mother_colleague', 
    name: '母亲的同事', 
    color: '#FFD93D' 
  },
  { 
    id: 'parent_friend', 
    name: '父母的亲友', 
    color: '#95E1D3' 
  }
];

/**
 * 生成座位唯一标识
 * @param {string} side - 左侧'left'或右侧'right'
 * @param {number} row - 排号 (1-4)
 * @param {number} col - 列号 (1-5)
 * @returns {string} 座位ID，格式: "left_1_1"
 */
function getSeatId(side, row, col) {
  return `${side}_${row}_${col}`;
}

/**
 * 生成初始座位数据
 * 生成40个座位（左侧20个，右侧20个）
 * @returns {Array} 座位数组
 */
function generateInitialSeats() {
  const seats = [];
  const sides = ['left', 'right'];
  
  sides.forEach(side => {
    for (let row = 1; row <= 4; row++) {
      for (let col = 1; col <= 5; col++) {
        seats.push({
          seatId: getSeatId(side, row, col),
          side: side,
          row: row,
          col: col,
          status: 'available',  // 'available' | 'occupied'
          guestType: null,
          guestTypeName: null,
          color: null,
          openid: null
        });
      }
    }
  });
  
  return seats;
}

/**
 * 根据宾客类型ID获取类型信息
 * @param {string} typeId - 宾客类型ID
 * @returns {Object|null} 类型信息对象
 */
function getGuestTypeInfo(typeId) {
  return GUEST_TYPES.find(type => type.id === typeId) || null;
}

/**
 * 合并座位数据
 * 将数据库中的已占用座位与初始座位数据合并
 * @param {Array} occupiedSeats - 数据库中的已占用座位
 * @returns {Array} 完整的座位数组
 */
function mergeSeatsData(occupiedSeats) {
  const allSeats = generateInitialSeats();
  
  // 创建已占用座位的映射
  const occupiedMap = {};
  occupiedSeats.forEach(seat => {
    occupiedMap[seat.seatId] = seat;
  });
  
  // 更新座位状态
  allSeats.forEach(seat => {
    if (occupiedMap[seat.seatId]) {
      const occupied = occupiedMap[seat.seatId];
      seat.status = 'occupied';
      seat.guestType = occupied.guestType;
      seat.guestTypeName = occupied.guestTypeName;
      seat.openid = occupied._openid || occupied.openid;
      
      // 获取颜色
      const typeInfo = getGuestTypeInfo(occupied.guestType);
      seat.color = typeInfo ? typeInfo.color : '#cccccc';
    }
  });
  
  return allSeats;
}

/**
 * 验证座位参数
 * @param {number} row - 排号
 * @param {number} col - 列号
 * @param {string} side - 左右侧
 * @param {string} guestType - 宾客类型
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
function validateSeatParams(row, col, side, guestType) {
  if (!row || row < 1 || row > 4) {
    return { valid: false, message: '排号必须在1-4之间' };
  }
  
  if (!col || col < 1 || col > 5) {
    return { valid: false, message: '列号必须在1-5之间' };
  }
  
  if (side !== 'left' && side !== 'right') {
    return { valid: false, message: '座位位置必须是left或right' };
  }
  
  const typeInfo = getGuestTypeInfo(guestType);
  if (!typeInfo) {
    return { valid: false, message: '无效的宾客类型' };
  }
  
  return { valid: true, message: '' };
}

module.exports = {
  GUEST_TYPES,
  getSeatId,
  generateInitialSeats,
  getGuestTypeInfo,
  mergeSeatsData,
  validateSeatParams
};

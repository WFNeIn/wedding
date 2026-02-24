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
 * @param {number} tableNum - 桌号 (1-10)
 * @param {number} seatNum - 座位号 (1-10)
 * @returns {string} 座位ID，格式: "left_1_1"
 */
function getSeatId(side, tableNum, seatNum) {
  return `${side}_${tableNum}_${seatNum}`;
}

/**
 * 生成初始座位数据
 * 生成200个座位（左侧100个，右侧100个）
 * 20个桌子，每桌10人
 * @returns {Array} 座位数组
 */
function generateInitialSeats() {
  const seats = [];
  const sides = ['left', 'right'];
  
  sides.forEach(side => {
    // 每侧10个桌子
    for (let tableNum = 1; tableNum <= 10; tableNum++) {
      // 每桌10个座位
      for (let seatNum = 1; seatNum <= 10; seatNum++) {
        // 桌号10为备用桌
        const isReserveTable = tableNum === 10;
        
        seats.push({
          seatId: getSeatId(side, tableNum, seatNum),
          side: side,
          tableNum: tableNum,
          seatNum: seatNum,
          status: 'available',  // 'available' | 'occupied' | 'reserved'
          isReserveTable: isReserveTable,
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
 * @param {number} tableNum - 桌号
 * @param {number} seatNum - 座位号
 * @param {string} side - 左右侧
 * @param {string} guestType - 宾客类型
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
function validateSeatParams(tableNum, seatNum, side, guestType) {
  if (!tableNum || tableNum < 1 || tableNum > 10) {
    return { valid: false, message: '桌号必须在1-10之间' };
  }
  
  if (!seatNum || seatNum < 1 || seatNum > 10) {
    return { valid: false, message: '座位号必须在1-10之间' };
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

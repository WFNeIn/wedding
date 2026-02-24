/**
 * 座位服务模块
 * 提供座位相关的数据模型和业务逻辑
 */

// 宾客类型常量定义
const GUEST_TYPES = [
  { 
    id: 'classmate', 
    name: '同学', 
    color: '#FF6B6B',
    tableCount: 2  // 2桌
  },
  { 
    id: 'bride_family', 
    name: '女方亲友', 
    color: '#FFB6C1',
    tableCount: 6  // 6桌
  },
  { 
    id: 'groom_family', 
    name: '男方亲友', 
    color: '#87CEEB',
    tableCount: 12  // 12桌
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
 * 左侧：3列5排 = 15桌（150座位）
 * 右侧：2列3排 = 6桌（60座位）
 * 总计：21桌，210座位
 * 
 * 区域划分：
 * - 左侧前2桌（1-2桌）：同学区
 * - 左侧中6桌（3-8桌）：女方亲友区
 * - 左侧后7桌 + 右侧6桌（9-21桌）：男方亲友区
 * - 21号桌为备用桌
 * 
 * @returns {Array} 座位数组
 */
function generateInitialSeats() {
  const seats = [];
  
  // 左侧：15个桌子（3列5排）
  // 桌号分配：
  // 1-2桌：同学（前2桌）
  // 3-8桌：女方亲友（中6桌）
  // 9-15桌：男方亲友（后7桌）
  for (let tableNum = 1; tableNum <= 15; tableNum++) {
    // 确定宾客类型
    let guestType, guestTypeName, areaColor;
    if (tableNum <= 2) {
      guestType = 'classmate';
      guestTypeName = '同学区';
      areaColor = '#FF6B6B';
    } else if (tableNum <= 8) {
      guestType = 'bride_family';
      guestTypeName = '女方亲友区';
      areaColor = '#FFB6C1';
    } else {
      guestType = 'groom_family';
      guestTypeName = '男方亲友区';
      areaColor = '#87CEEB';
    }
    
    for (let seatNum = 1; seatNum <= 10; seatNum++) {
      seats.push({
        seatId: getSeatId('left', tableNum, seatNum),
        side: 'left',
        tableNum: tableNum,
        seatNum: seatNum,
        status: 'available',
        isReserveTable: false,
        guestType: null,
        guestTypeName: null,
        color: null,
        openid: null,
        areaType: guestType,
        areaName: guestTypeName,
        areaColor: areaColor
      });
    }
  }
  
  // 右侧：6个桌子（2列3排）
  // 桌号分配：16-21桌，全部为男方亲友区
  // 21号桌为备用桌
  for (let tableNum = 16; tableNum <= 21; tableNum++) {
    const isReserveTable = tableNum === 21;
    
    for (let seatNum = 1; seatNum <= 10; seatNum++) {
      seats.push({
        seatId: getSeatId('right', tableNum, seatNum),
        side: 'right',
        tableNum: tableNum,
        seatNum: seatNum,
        status: 'available',
        isReserveTable: isReserveTable,
        guestType: null,
        guestTypeName: null,
        color: null,
        openid: null,
        areaType: 'groom_family',
        areaName: '男方亲友区',
        areaColor: '#87CEEB'
      });
    }
  }
  
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
  // 左侧15桌（1-15），右侧6桌（16-21）
  if (side === 'left') {
    if (!tableNum || tableNum < 1 || tableNum > 15) {
      return { valid: false, message: '左侧桌号必须在1-15之间' };
    }
  } else if (side === 'right') {
    if (!tableNum || tableNum < 16 || tableNum > 21) {
      return { valid: false, message: '右侧桌号必须在16-21之间' };
    }
  } else {
    return { valid: false, message: '座位位置必须是left或right' };
  }
  
  if (!seatNum || seatNum < 1 || seatNum > 10) {
    return { valid: false, message: '座位号必须在1-10之间' };
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

// 云函数：getSeats
// 功能：获取所有座位的当前状态
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 宾客类型颜色映射
const GUEST_TYPE_COLORS = {
  'classmate': '#FF6B6B',
  'bride_family': '#FFB6C1',
  'groom_family': '#87CEEB'
};

/**
 * 获取座位的区域类型
 */
function getSeatAreaType(tableNum) {
  if (tableNum <= 2) {
    return {
      areaType: 'classmate',
      areaName: '同学区',
      areaColor: '#FF6B6B'
    };
  } else if (tableNum <= 8) {
    return {
      areaType: 'bride_family',
      areaName: '女方亲友区',
      areaColor: '#FFB6C1'
    };
  } else {
    return {
      areaType: 'groom_family',
      areaName: '男方亲友区',
      areaColor: '#87CEEB'
    };
  }
}

/**
 * 生成完整的210个座位数据
 * 左侧：3列5排 = 15桌（150座位）
 * 右侧：2列3排 = 6桌（60座位）
 */
function generateAllSeats(occupiedSeats) {
  const allSeats = [];
  
  // 创建已占用座位的映射
  const occupiedMap = {};
  occupiedSeats.forEach(seat => {
    occupiedMap[seat.seatId] = seat;
  });
  
  // 左侧：15个桌子（1-15桌）
  for (let tableNum = 1; tableNum <= 15; tableNum++) {
    const areaInfo = getSeatAreaType(tableNum);
    
    for (let seatNum = 1; seatNum <= 10; seatNum++) {
      const seatId = `left_${tableNum}_${seatNum}`;
      const occupied = occupiedMap[seatId];
      
      if (occupied) {
        // 已占用的座位
        allSeats.push({
          seatId: seatId,
          side: 'left',
          tableNum: tableNum,
          seatNum: seatNum,
          status: 'occupied',
          isReserveTable: false,
          guestType: occupied.guestType,
          guestTypeName: occupied.guestTypeName,
          color: GUEST_TYPE_COLORS[occupied.guestType] || '#cccccc',
          areaType: areaInfo.areaType,
          areaName: areaInfo.areaName,
          areaColor: areaInfo.areaColor
        });
      } else {
        // 空闲座位
        allSeats.push({
          seatId: seatId,
          side: 'left',
          tableNum: tableNum,
          seatNum: seatNum,
          status: 'available',
          isReserveTable: false,
          guestType: null,
          guestTypeName: null,
          color: null,
          areaType: areaInfo.areaType,
          areaName: areaInfo.areaName,
          areaColor: areaInfo.areaColor
        });
      }
    }
  }
  
  // 右侧：6个桌子（16-21桌）
  for (let tableNum = 16; tableNum <= 21; tableNum++) {
    const isReserveTable = tableNum === 21;
    const areaInfo = getSeatAreaType(tableNum); // 右侧全部是男方亲友区
    
    for (let seatNum = 1; seatNum <= 10; seatNum++) {
      const seatId = `right_${tableNum}_${seatNum}`;
      const occupied = occupiedMap[seatId];
      
      if (occupied) {
        // 已占用的座位
        allSeats.push({
          seatId: seatId,
          side: 'right',
          tableNum: tableNum,
          seatNum: seatNum,
          status: 'occupied',
          isReserveTable: isReserveTable,
          guestType: occupied.guestType,
          guestTypeName: occupied.guestTypeName,
          color: GUEST_TYPE_COLORS[occupied.guestType] || '#cccccc',
          areaType: areaInfo.areaType,
          areaName: areaInfo.areaName,
          areaColor: areaInfo.areaColor
        });
      } else {
        // 空闲座位或备用桌
        allSeats.push({
          seatId: seatId,
          side: 'right',
          tableNum: tableNum,
          seatNum: seatNum,
          status: isReserveTable ? 'reserved' : 'available',
          isReserveTable: isReserveTable,
          guestType: null,
          guestTypeName: null,
          color: null,
          areaType: areaInfo.areaType,
          areaName: areaInfo.areaName,
          areaColor: areaInfo.areaColor
        });
      }
    }
  }
  
  return allSeats;
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  try {
    // 查询所有已占用的座位
    const result = await db.collection('seats')
      .field({
        seatId: true,
        tableNum: true,
        seatNum: true,
        side: true,
        guestType: true,
        guestTypeName: true
      })
      .get();
    
    // 生成完整的座位数据（包括空闲座位）
    const allSeats = generateAllSeats(result.data);
    
    return {
      success: true,
      data: allSeats
    };
    
  } catch (error) {
    console.error('获取座位失败:', error);
    return {
      success: false,
      message: '获取座位失败，请稍后重试',
      data: []
    };
  }
};

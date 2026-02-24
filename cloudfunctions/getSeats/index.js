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
  'father_colleague': '#4ECDC4',
  'mother_colleague': '#FFD93D',
  'parent_friend': '#95E1D3'
};

/**
 * 生成完整的200个座位数据
 */
function generateAllSeats(occupiedSeats) {
  const allSeats = [];
  const sides = ['left', 'right'];
  
  // 创建已占用座位的映射
  const occupiedMap = {};
  occupiedSeats.forEach(seat => {
    occupiedMap[seat.seatId] = seat;
  });
  
  // 生成所有座位
  sides.forEach(side => {
    // 每侧10个桌子
    for (let tableNum = 1; tableNum <= 10; tableNum++) {
      // 每桌10个座位
      for (let seatNum = 1; seatNum <= 10; seatNum++) {
        const seatId = `${side}_${tableNum}_${seatNum}`;
        const occupied = occupiedMap[seatId];
        const isReserveTable = tableNum === 10;
        
        if (occupied) {
          // 已占用的座位
          allSeats.push({
            seatId: seatId,
            side: side,
            tableNum: tableNum,
            seatNum: seatNum,
            status: 'occupied',
            isReserveTable: isReserveTable,
            guestType: occupied.guestType,
            guestTypeName: occupied.guestTypeName,
            color: GUEST_TYPE_COLORS[occupied.guestType] || '#cccccc'
          });
        } else {
          // 空闲座位或备用桌
          allSeats.push({
            seatId: seatId,
            side: side,
            tableNum: tableNum,
            seatNum: seatNum,
            status: isReserveTable ? 'reserved' : 'available',
            isReserveTable: isReserveTable,
            guestType: null,
            guestTypeName: null,
            color: null
          });
        }
      }
    }
  });
  
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

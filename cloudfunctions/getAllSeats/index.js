// 云函数：getAllSeats
// 功能：获取所有座位信息和统计数据（管理员功能）
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
 * 生成完整的40个座位数据
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
    for (let row = 1; row <= 4; row++) {
      for (let col = 1; col <= 5; col++) {
        const seatId = `${side}_${row}_${col}`;
        const occupied = occupiedMap[seatId];
        
        if (occupied) {
          // 已占用的座位
          allSeats.push({
            seatId: seatId,
            side: side,
            row: row,
            col: col,
            status: 'occupied',
            guestType: occupied.guestType,
            guestTypeName: occupied.guestTypeName,
            color: GUEST_TYPE_COLORS[occupied.guestType] || '#cccccc',
            createTime: occupied.createTime
          });
        } else {
          // 空闲座位
          allSeats.push({
            seatId: seatId,
            side: side,
            row: row,
            col: col,
            status: 'available',
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
 * 计算统计数据
 */
function calculateStats(occupiedSeats) {
  const stats = {
    total: 40,
    occupied: occupiedSeats.length,
    available: 40 - occupiedSeats.length,
    byType: {
      classmate: 0,
      father_colleague: 0,
      mother_colleague: 0,
      parent_friend: 0
    }
  };
  
  // 统计各类型数量
  occupiedSeats.forEach(seat => {
    if (stats.byType.hasOwnProperty(seat.guestType)) {
      stats.byType[seat.guestType]++;
    }
  });
  
  return stats;
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
        row: true,
        col: true,
        side: true,
        guestType: true,
        guestTypeName: true,
        createTime: true
      })
      .get();
    
    // 生成完整的座位数据
    const allSeats = generateAllSeats(result.data);
    
    // 计算统计数据
    const stats = calculateStats(result.data);
    
    return {
      success: true,
      data: {
        seats: allSeats,
        stats: stats
      }
    };
    
  } catch (error) {
    console.error('获取座位数据失败:', error);
    return {
      success: false,
      message: '获取数据失败，请稍后重试',
      data: {
        seats: [],
        stats: {
          total: 40,
          occupied: 0,
          available: 40,
          byType: {}
        }
      }
    };
  }
};

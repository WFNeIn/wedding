// 云函数：getMySeat
// 功能：获取当前用户已选的座位
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  try {
    // 查询当前用户的座位
    const result = await db.collection('seats')
      .where({
        _openid: openid
      })
      .get();
    
    if (result.data.length > 0) {
      const seat = result.data[0];
      return {
        success: true,
        data: {
          seatId: seat.seatId,
          tableNum: seat.tableNum,
          seatNum: seat.seatNum,
          side: seat.side,
          guestType: seat.guestType,
          guestTypeName: seat.guestTypeName,
          createTime: seat.createTime
        }
      };
    } else {
      return {
        success: true,
        data: null
      };
    }
    
  } catch (error) {
    console.error('查询我的座位失败:', error);
    return {
      success: false,
      message: '查询失败，请稍后重试',
      data: null
    };
  }
};

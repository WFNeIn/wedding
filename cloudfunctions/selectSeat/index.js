// 云函数：selectSeat
// 功能：处理座位选择请求
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 宾客类型映射
const GUEST_TYPE_MAP = {
  'classmate': '同学同事',
  'father_colleague': '父亲的同事',
  'mother_colleague': '母亲的同事',
  'parent_friend': '父母的亲友'
};

/**
 * 验证参数
 */
function validateParams(tableNum, seatNum, side, guestType) {
  if (!tableNum || tableNum < 1 || tableNum > 10) {
    return { valid: false, message: '桌号必须在1-10之间' };
  }
  
  if (!seatNum || seatNum < 1 || seatNum > 10) {
    return { valid: false, message: '座位号必须在1-10之间' };
  }
  
  if (side !== 'left' && side !== 'right') {
    return { valid: false, message: '座位位置必须是left或right' };
  }
  
  if (!GUEST_TYPE_MAP[guestType]) {
    return { valid: false, message: '无效的宾客类型' };
  }
  
  return { valid: true };
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  const { tableNum, seatNum, side, guestType } = event;
  
  try {
    // 1. 验证参数
    const validation = validateParams(tableNum, seatNum, side, guestType);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }
    
    // 2. 检查是否是备用桌（桌号10）
    if (tableNum === 10) {
      return {
        success: false,
        message: '该桌为备用桌，暂不开放选座'
      };
    }
    
    // 3. 检查用户是否已选座位
    const existingSeats = await db.collection('seats')
      .where({
        _openid: openid
      })
      .get();
    
    if (existingSeats.data.length > 0) {
      return {
        success: false,
        message: '您已经选过座位了，每位宾客只能选择一个座位'
      };
    }
    
    // 4. 构造座位ID
    const seatId = `${side}_${tableNum}_${seatNum}`;
    const guestTypeName = GUEST_TYPE_MAP[guestType];
    
    // 5. 尝试插入座位记录（利用唯一索引确保并发安全）
    try {
      const result = await db.collection('seats').add({
        data: {
          seatId: seatId,
          tableNum: tableNum,
          seatNum: seatNum,
          side: side,
          guestType: guestType,
          guestTypeName: guestTypeName,
          isReserveTable: false,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
      
      return {
        success: true,
        message: '选座成功',
        data: {
          _id: result._id,
          seat: {
            seatId,
            tableNum,
            seatNum,
            side,
            guestType,
            guestTypeName
          }
        }
      };
      
    } catch (insertError) {
      // 检查是否是唯一索引冲突错误
      if (insertError.errCode === -1 || insertError.message.includes('duplicate')) {
        return {
          success: false,
          message: '该座位已被其他宾客选择，请选择其他座位'
        };
      }
      
      throw insertError;
    }
    
  } catch (error) {
    console.error('选座失败:', error);
    return {
      success: false,
      message: '选座失败，请稍后重试'
    };
  }
};

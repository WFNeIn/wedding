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
function validateParams(row, col, side, guestType) {
  if (!row || row < 1 || row > 4) {
    return { valid: false, message: '排号必须在1-4之间' };
  }
  
  if (!col || col < 1 || col > 5) {
    return { valid: false, message: '列号必须在1-5之间' };
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
  
  const { row, col, side, guestType } = event;
  
  try {
    // 1. 验证参数
    const validation = validateParams(row, col, side, guestType);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }
    
    // 2. 检查用户是否已选座位
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
    
    // 3. 构造座位ID
    const seatId = `${side}_${row}_${col}`;
    const guestTypeName = GUEST_TYPE_MAP[guestType];
    
    // 4. 尝试插入座位记录（利用唯一索引确保并发安全）
    try {
      const result = await db.collection('seats').add({
        data: {
          seatId: seatId,
          row: row,
          col: col,
          side: side,
          guestType: guestType,
          guestTypeName: guestTypeName,
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
            row,
            col,
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

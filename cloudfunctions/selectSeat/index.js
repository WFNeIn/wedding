// 云函数：selectSeat
// 功能：处理座位选择请求
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 宾客类型映射
const GUEST_TYPE_MAP = {
  'classmate': '同学',
  'bride_family': '女方亲友',
  'groom_family': '男方亲友'
};

/**
 * 获取座位的区域类型
 */
function getSeatAreaType(tableNum) {
  if (tableNum <= 2) {
    return 'classmate';
  } else if (tableNum <= 8) {
    return 'bride_family';
  } else {
    return 'groom_family';
  }
}

/**
 * 验证参数
 */
function validateParams(tableNum, seatNum, side, guestType) {
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
  
  if (!GUEST_TYPE_MAP[guestType]) {
    return { valid: false, message: '无效的宾客类型' };
  }
  
  return { valid: true };
}

/**
 * 验证区域限制
 */
function validateAreaRestriction(tableNum, guestType) {
  const seatAreaType = getSeatAreaType(tableNum);
  
  if (seatAreaType !== guestType) {
    const areaNames = {
      'classmate': '同学区（1-2桌）',
      'bride_family': '女方亲友区（3-8桌）',
      'groom_family': '男方亲友区（9-21桌）'
    };
    
    return {
      valid: false,
      message: `您选择的是"${GUEST_TYPE_MAP[guestType]}"类型，只能在${areaNames[guestType]}选座`
    };
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
    
    // 2. 检查是否是备用桌（21号桌）
    if (tableNum === 21) {
      return {
        success: false,
        message: '该桌为备用桌，暂不开放选座'
      };
    }
    
    // 3. 验证区域限制
    const areaValidation = validateAreaRestriction(tableNum, guestType);
    if (!areaValidation.valid) {
      return {
        success: false,
        message: areaValidation.message
      };
    }
    
    // 4. 检查用户是否已选座位
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
    
    // 5. 构造座位ID
    const seatId = `${side}_${tableNum}_${seatNum}`;
    const guestTypeName = GUEST_TYPE_MAP[guestType];
    
    // 6. 尝试插入座位记录（利用唯一索引确保并发安全）
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

// 云函数：提交宾客回执
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 云函数入口函数
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  try {
    // 获取提交的表单数据
    const { name, phone, attendees, hasChildren, dietaryRestrictions } = event;
    
    // 服务端数据验证
    if (!name || name.trim().length < 2 || name.trim().length > 20) {
      return {
        success: false,
        message: '姓名格式不正确'
      };
    }
    
    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return {
        success: false,
        message: '手机号格式不正确'
      };
    }
    
    // 验证到场人数
    if (attendees < 1 || attendees > 4) {
      return {
        success: false,
        message: '到场人数应为1-4人'
      };
    }
    
    // 保存到数据库
    const result = await db.collection('rsvp').add({
      data: {
        _openid: wxContext.OPENID, // 用户openid
        name: name.trim(),
        phone: phone,
        attendees: attendees,
        hasChildren: hasChildren || false,
        dietaryRestrictions: dietaryRestrictions ? dietaryRestrictions.trim() : '',
        createTime: db.serverDate(), // 服务端时间
        updateTime: db.serverDate()
      }
    });
    
    return {
      success: true,
      message: '提交成功',
      data: {
        _id: result._id
      }
    };
    
  } catch (error) {
    console.error('提交回执失败:', error);
    return {
      success: false,
      message: '提交失败，请稍后重试',
      error: error.message
    };
  }
};

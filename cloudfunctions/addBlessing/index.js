// 云函数：添加祝福留言
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
    // 获取提交的留言数据
    const { nickname, content } = event;
    
    // 服务端数据验证
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        message: '留言内容不能为空'
      };
    }
    
    if (content.trim().length > 500) {
      return {
        success: false,
        message: '留言内容不能超过500字'
      };
    }
    
    // 简单的敏感词过滤（可选）
    const sensitiveWords = ['广告', '垃圾', '测试敏感词']; // 可根据需要添加
    const contentLower = content.toLowerCase();
    for (let word of sensitiveWords) {
      if (contentLower.includes(word)) {
        return {
          success: false,
          message: '留言包含敏感词，请修改后重试'
        };
      }
    }
    
    // 保存到数据库
    const result = await db.collection('blessings').add({
      data: {
        _openid: wxContext.OPENID, // 用户openid
        nickname: nickname || '访客',
        content: content.trim(),
        createTime: db.serverDate(), // 服务端时间
        isVisible: true // 是否可见（预留审核功能）
      }
    });
    
    return {
      success: true,
      message: '发送成功',
      data: {
        _id: result._id
      }
    };
    
  } catch (error) {
    console.error('添加留言失败:', error);
    return {
      success: false,
      message: '发送失败，请稍后重试',
      error: error.message
    };
  }
};

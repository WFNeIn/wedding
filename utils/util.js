/**
 * 工具函数模块
 */

/**
 * 格式化时间显示
 * @param {Date|String|Number} date - 日期对象、时间戳或日期字符串
 * @param {String} format - 格式类型：'full'(完整), 'date'(仅日期), 'time'(仅时间), 'relative'(相对时间)
 * @returns {String} 格式化后的时间字符串
 */
function formatTime(date, format = 'full') {
  if (!date) return '';
  
  const d = new Date(date);
  
  // 检查日期是否有效
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  // 根据格式返回不同的字符串
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hour}:${minute}`;
    case 'relative':
      return formatRelativeTime(d);
    case 'full':
    default:
      return `${year}-${month}-${day} ${hour}:${minute}`;
  }
}

/**
 * 格式化相对时间（刚刚、几分钟前、几小时前等）
 * @param {Date} date - 日期对象
 * @returns {String} 相对时间字符串
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return formatTime(date, 'date');
  }
}

/**
 * 计算两个日期之间的天数差
 * @param {String|Date} targetDate - 目标日期
 * @returns {Number} 天数差（向上取整）
 */
function calculateDaysDiff(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  
  // 将时间设置为当天的开始（00:00:00）
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * 验证中国手机号格式
 * @param {String} phone - 手机号
 * @returns {Boolean} 是否有效
 */
function validatePhone(phone) {
  const phoneReg = /^1[3-9]\d{9}$/;
  return phoneReg.test(phone);
}

/**
 * 显示加载提示
 * @param {String} title - 提示文字
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title: title,
    mask: true
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示成功提示
 * @param {String} title - 提示文字
 */
function showSuccess(title) {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: 2000
  });
}

/**
 * 显示错误提示
 * @param {String} title - 提示文字
 */
function showError(title) {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 3000
  });
}

module.exports = {
  formatTime,
  formatRelativeTime,
  calculateDaysDiff,
  validatePhone,
  showLoading,
  hideLoading,
  showSuccess,
  showError
};

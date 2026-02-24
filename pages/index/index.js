// pages/index/index.js
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    // 婚纱照片数组
    photos: [
      '/images/20260223-183518.jpg',
      '/images/20260223-183532.jpg',
      '/images/20260223-183542.jpg',
      '/images/20260223-183537.jpg',
    ],
    // 新人信息
    groomName: '',
    brideName: '',
    // 婚礼日期和时间
    weddingDate: '',
    weddingTime: '',
    weddingDateDisplay: '', // 显示用的日期格式
    // 婚宴地点
    venue: '',
    address: '',
    // 倒计时
    countdown: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    },
    // 倒计时状态：'before'(婚礼前), 'today'(今天), 'after'(婚礼后)
    countdownStatus: 'before',
    // 定时器ID
    timer: null,
    // 开场动画相关
    showOpening: false,
    openingStep: 0
  },

  /**
   * 页面加载时初始化数据
   */
  onLoad() {
    this.initWeddingInfo();
    this.checkAndShowOpening();
    this.startCountdown();
  },

  /**
   * 检查是否需要显示开场动画
   */
  checkAndShowOpening() {
    // 检查是否是首次进入
    const hasShownOpening = wx.getStorageSync('hasShownOpening');
    
    if (!hasShownOpening) {
      // 首次进入,显示开场动画
      this.setData({ showOpening: true });
      this.playOpeningAnimation();
      
      // 标记已显示过
      wx.setStorageSync('hasShownOpening', true);
    }
  },

  /**
   * 播放开场动画
   */
  playOpeningAnimation() {
    // 步骤1: 0.5秒后开始打开请柬
    setTimeout(() => {
      this.setData({ openingStep: 1 });
    }, 500);
    
    // 步骤2: 1.5秒后显示欢迎文字
    setTimeout(() => {
      this.setData({ openingStep: 2 });
    }, 1500);
    
    // 步骤3: 3秒后隐藏整个动画
    setTimeout(() => {
      this.setData({ 
        showOpening: false,
        openingStep: 0
      });
    }, 3500);
  },

  /**
   * 初始化婚礼信息
   */
  initWeddingInfo() {
    const weddingInfo = app.globalData.weddingInfo;
    
    // 格式化日期显示
    const dateObj = new Date(weddingInfo.date + ' ' + weddingInfo.time);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weddingDateDisplay = `${year}年${month}月${day}日 ${weddingInfo.time}`;
    
    this.setData({
      groomName: weddingInfo.couple.groom,
      brideName: weddingInfo.couple.bride,
      weddingDate: weddingInfo.date,
      weddingTime: weddingInfo.time,
      weddingDateDisplay: weddingDateDisplay,
      venue: weddingInfo.venue.name,
      address: weddingInfo.venue.address
    });
  },

  /**
   * 计算距离婚礼的剩余时间（精确到秒）
   */
  calculateCountdown() {
    const weddingInfo = app.globalData.weddingInfo;
    const targetDateTime = `${weddingInfo.date} ${weddingInfo.time}:00`;
    const target = new Date(targetDateTime).getTime();
    const now = new Date().getTime();
    
    const diff = target - now;
    
    // 判断状态
    if (diff <= 0) {
      // 婚礼已过或正在进行
      const absDiff = Math.abs(diff);
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
      
      this.setData({
        countdown: { days, hours, minutes, seconds },
        countdownStatus: diff === 0 ? 'today' : 'after'
      });
    } else {
      // 婚礼未到
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      this.setData({
        countdown: { days, hours, minutes, seconds },
        countdownStatus: 'before'
      });
    }
  },

  /**
   * 启动倒计时定时器
   */
  startCountdown() {
    // 立即计算一次
    this.calculateCountdown();
    
    // 清除旧的定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    
    // 每秒更新一次
    const timer = setInterval(() => {
      this.calculateCountdown();
    }, 1000);
    
    this.setData({ timer });
  },

  /**
   * 停止倒计时定时器
   */
  stopCountdown() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
  },

  /**
   * 图片加载错误处理
   */
  onImageError(e) {
    console.error('图片加载失败:', e.detail);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到抽奖页面
   */
  goToLottery() {
    wx.navigateTo({
      url: '/pages/lottery/lottery'
    });
  },

  /**
   * 页面显示时重新启动倒计时
   */
  onShow() {
    this.startCountdown();
  },

  /**
   * 页面隐藏时停止倒计时
   */
  onHide() {
    this.stopCountdown();
  },

  /**
   * 页面卸载时停止倒计时
   */
  onUnload() {
    this.stopCountdown();
  }
});

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
    openingStep: 0,
    // 主题相关
    currentTheme: 'theme4', // 默认方案4：中国红+金色
    showThemeSelector: false
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
   * 页面显示时重新启动倒计时
   */
  onShow() {
    this.startCountdown();
    // 如果正在显示开场动画，隐藏TabBar
    if (this.data.showOpening) {
      wx.hideTabBar({
        animation: false
      });
    }
  },

  /**
   * 检查是否需要显示开场动画
   */
  checkAndShowOpening() {
    // 检查是否是首次进入
    const hasShownOpening = wx.getStorageSync('hasShownOpening');
    
    // 临时：每次都显示动画（方便测试）
    // 正式发布时可以改回 if (!hasShownOpening)
    if (true) {  // 改为 !hasShownOpening 可恢复只显示一次
      // 首次进入,显示开场动画
      this.setData({ showOpening: true });
      // 隐藏底部TabBar，增强沉浸感
      wx.hideTabBar({
        animation: false
      });
      // 不自动播放动画，等待用户点击
      
      // 标记已显示过
      wx.setStorageSync('hasShownOpening', true);
    }
  },

  /**
   * 用户点击请柬，开始播放动画
   */
  onClickInvitation() {
    if (this.data.openingStep === 0) {
      this.playOpeningAnimation();
    }
  },

  /**
   * 播放开场动画
   */
  playOpeningAnimation() {
    // 步骤1: 立即拆开印章
    this.setData({ openingStep: 1 });
    
    // 步骤2: 1.2秒后展开信件内容
    setTimeout(() => {
      this.setData({ openingStep: 2 });
    }, 1200);
    
    // 步骤3: 4秒后隐藏整个动画，进入首页
    setTimeout(() => {
      this.setData({ 
        showOpening: false,
        openingStep: 0
      });
      // 显示底部TabBar
      wx.showTabBar({
        animation: true
      });
    }, 4000);
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
   * 跳转到详情页面
   */
  goToDetails() {
    wx.navigateTo({
      url: '/pages/details/details'
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
  },

  /**
   * 打开墨迹天气小程序（半屏模式）
   */
  openMojiWeather() {
    const weddingInfo = app.globalData.weddingInfo;
    
    // 解析婚礼日期
    const dateObj = new Date(weddingInfo.date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`; // 格式：20250504
    
    // 获取婚礼地点的城市信息（武汉）
    const city = '武汉';
    
    // 显示加载提示
    wx.showLoading({
      title: '正在打开...',
      mask: true
    });
    
    // 使用半屏打开API
    wx.openEmbeddedMiniProgram({
      appId: 'wxb4ba3c02aa476ea1', // 墨迹天气小程序AppID
      path: 'pages/index/index',
      envVersion: 'release',
      extraData: {
        city: city,
        date: formattedDate
      },
      success: (res) => {
        wx.hideLoading();
        console.log('成功以半屏模式打开墨迹天气', res);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('半屏打开失败，尝试全屏打开', err);
        
        // 半屏打开失败，尝试全屏打开
        wx.navigateToMiniProgram({
          appId: 'wxb4ba3c02aa476ea1',
          path: 'pages/index/index',
          envVersion: 'release',
          extraData: {
            city: city,
            date: formattedDate
          },
          success: (res) => {
            console.log('成功以全屏模式打开墨迹天气', res);
          },
          fail: (err2) => {
            console.error('全屏打开也失败', err2);
            
            let errorMsg = '无法打开墨迹天气小程序';
            
            if (err2.errMsg.includes('cancel')) {
              return;
            } else if (err2.errMsg.includes('appId')) {
              errorMsg = '墨迹天气小程序配置错误';
            } else if (err2.errMsg.includes('permission')) {
              errorMsg = '没有权限打开墨迹天气';
            }
            
            wx.showModal({
              title: '温馨提示',
              content: errorMsg + '\n\n您可以手动搜索"墨迹天气"小程序查看' + weddingInfo.date + '武汉的天气',
              showCancel: true,
              cancelText: '知道了',
              confirmText: '复制日期',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.setClipboardData({
                    data: weddingInfo.date + ' 武汉',
                    success: () => {
                      wx.showToast({
                        title: '已复制日期',
                        icon: 'success'
                      });
                    }
                  });
                }
              }
            });
          }
        });
      }
    });
  },

  /**
   * 切换主题
   */
  switchTheme(e) {
    const theme = e.currentTarget.dataset.theme;
    this.setData({ 
      currentTheme: theme,
      showThemeSelector: false
    });
    
    wx.showToast({
      title: '主题已切换',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 显示/隐藏主题选择器
   */
  toggleThemeSelector() {
    this.setData({
      showThemeSelector: !this.data.showThemeSelector
    });
  },

  /**
   * 关闭主题选择器
   */
  closeThemeSelector() {
    this.setData({
      showThemeSelector: false
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击弹窗内容时关闭
  }
});

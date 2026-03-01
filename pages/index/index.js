// pages/index/index.js
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    // 主要婚纱照（第2张）
    mainPhoto: '/images/20260223-183532.jpg',
    // 祝福弹幕数据
    barrages: [],
    blessings: [], // 所有祝福数据
    barrageTimer: null, // 弹幕定时器
    // 天气数据（已移除）
    // weatherData: null,
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
    this.loadBlessings(); // 加载祝福数据
  },

  /**
   * 页面显示时重新启动倒计时
   */
  onShow() {
    this.startCountdown();
    this.startBarrage(); // 启动弹幕
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
    this.stopBarrage(); // 停止弹幕
  },

  /**
   * 页面卸载时停止倒计时
   */
  onUnload() {
    this.stopCountdown();
    this.stopBarrage(); // 停止弹幕
  },

  /**
   * 打开墨迹天气小程序查看当日天气（半屏模式）
   */
  openMojiWeather() {
    const weddingInfo = app.globalData.weddingInfo;
    
    // 解析婚礼日期
    const dateObj = new Date(weddingInfo.date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`; // 格式：20260504
    
    // 获取婚礼地点的城市信息（武汉）
    const city = '武汉';
    
    console.log('打开墨迹天气（半屏），日期:', formattedDate, '城市:', city);
    
    // 使用半屏模式打开墨迹天气小程序
    wx.openEmbeddedMiniProgram({
      appId: 'wxc30ae3bc7fb4cab1', // 墨迹天气小程序AppID
      path: 'pages/index/index',
      envVersion: 'release',
      extraData: {
        city: city,
        date: formattedDate
      },
      success: () => {
        console.log('成功以半屏模式打开墨迹天气');
      },
      fail: (err) => {
        console.error('半屏打开失败，尝试全屏打开', err);
        
        // 半屏打开失败，尝试全屏打开
        wx.navigateToMiniProgram({
          appId: 'wxc30ae3bc7fb4cab1',
          path: 'pages/index/index',
          envVersion: 'release',
          extraData: {
            city: city,
            date: formattedDate
          },
          success: () => {
            console.log('成功以全屏模式打开墨迹天气');
          },
          fail: (err2) => {
            console.error('全屏打开也失败', err2);
            
            // 如果用户取消，不显示错误
            if (err2.errMsg && err2.errMsg.includes('cancel')) {
              return;
            }
            
            // 其他错误，提示用户手动搜索
            wx.showModal({
              title: '温馨提示',
              content: '无法打开墨迹天气小程序\n\n您可以在微信中搜索"墨迹天气"小程序\n\n查看 ' + weddingInfo.date + ' 武汉 的天气预报',
              showCancel: true,
              cancelText: '知道了',
              confirmText: '复制日期',
              success: (res) => {
                if (res.confirm) {
                  // 复制日期和城市到剪贴板
                  wx.setClipboardData({
                    data: weddingInfo.date + ' 武汉',
                    success: () => {
                      wx.showToast({
                        title: '已复制到剪贴板',
                        icon: 'success',
                        duration: 2000
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
   * 加载祝福数据
   */
  loadBlessings() {
    const db = wx.cloud.database();
    db.collection('blessings')
      .orderBy('createTime', 'desc')
      .limit(100)
      .get()
      .then(res => {
        if (res.data && res.data.length > 0) {
          // 有真实祝福数据
          this.setData({
            blessings: res.data.map(item => item.content)
          });
        } else {
          // 没有数据，使用模拟数据
          this.generateMockBlessings();
        }
        // 启动弹幕
        this.startBarrage();
      })
      .catch(err => {
        console.error('加载祝福失败:', err);
        // 加载失败，使用模拟数据
        this.generateMockBlessings();
        this.startBarrage();
      });
  },

  /**
   * 生成模拟祝福数据（50条）
   */
  generateMockBlessings() {
    const mockBlessings = [
      '祝新婚快乐，百年好合！',
      '愿你们永远幸福美满！',
      '恭喜恭喜，白头偕老！',
      '祝福新人，早生贵子！',
      '新婚大喜，甜甜蜜蜜！',
      '执子之手，与子偕老！',
      '天作之合，佳偶天成！',
      '相亲相爱，幸福一生！',
      '琴瑟和鸣，鸾凤和鸣！',
      '花好月圆，永结同心！',
      '祝你们新婚愉快，幸福美满！',
      '愿爱情甜蜜，婚姻美满！',
      '恭祝百年好合，永浴爱河！',
      '祝福你们，白头到老！',
      '新婚快乐，永远幸福！',
      '祝两位新人，恩爱有加！',
      '愿你们的爱情，天长地久！',
      '祝福新婚，美满幸福！',
      '恭喜你们，喜结良缘！',
      '祝新人，幸福美满！',
      '愿你们相濡以沫，恩爱永久！',
      '祝福你们，永远快乐！',
      '新婚大吉，百年好合！',
      '祝你们，幸福一生！',
      '恭喜新婚，甜蜜美满！',
      '愿你们的婚姻，幸福长久！',
      '祝福新人，永远相爱！',
      '新婚快乐，早生贵子！',
      '祝你们，白头偕老！',
      '恭喜恭喜，幸福美满！',
      '愿你们，永远幸福！',
      '祝新婚愉快，恩爱有加！',
      '恭祝新婚，百年好合！',
      '祝福你们，甜甜蜜蜜！',
      '新婚大喜，永浴爱河！',
      '愿你们，相亲相爱！',
      '祝新人，幸福快乐！',
      '恭喜新婚，天长地久！',
      '祝福你们，美满幸福！',
      '新婚快乐，永结同心！',
      '愿你们，恩爱一生！',
      '祝新婚，幸福美满！',
      '恭喜你们，喜结连理！',
      '祝福新人，永远快乐！',
      '新婚大吉，甜蜜幸福！',
      '愿你们，白头到老！',
      '祝新婚愉快，百年好合！',
      '恭祝新人，幸福一生！',
      '祝福你们，永远相爱！',
      '新婚快乐，恩爱永久！'
    ];
    
    this.setData({
      blessings: mockBlessings
    });
  },

  /**
   * 启动弹幕
   */
  startBarrage() {
    if (this.data.blessings.length === 0) return;
    
    // 清除旧的定时器
    if (this.data.barrageTimer) {
      clearInterval(this.data.barrageTimer);
    }
    
    // 每2秒添加一条弹幕
    const timer = setInterval(() => {
      this.addBarrage();
    }, 2000);
    
    this.setData({ barrageTimer: timer });
    
    // 立即添加第一条
    this.addBarrage();
  },

  /**
   * 停止弹幕
   */
  stopBarrage() {
    if (this.data.barrageTimer) {
      clearInterval(this.data.barrageTimer);
      this.setData({ barrageTimer: null });
    }
  },

  /**
   * 添加一条弹幕
   */
  addBarrage() {
    const blessings = this.data.blessings;
    if (blessings.length === 0) return;
    
    // 随机选择一条祝福
    const content = blessings[Math.floor(Math.random() * blessings.length)];
    
    // 随机生成弹幕位置和速度
    const top = Math.random() * 600 + 50; // 50-650rpx之间
    const duration = Math.random() * 5 + 10; // 10-15秒
    const delay = 0;
    
    const newBarrage = {
      id: Date.now() + Math.random(),
      content,
      top,
      duration,
      delay
    };
    
    // 添加到弹幕列表
    const barrages = [...this.data.barrages, newBarrage];
    
    // 限制弹幕数量，最多保留20条
    if (barrages.length > 20) {
      barrages.shift();
    }
    
    this.setData({ barrages });
    
    // 动画结束后移除弹幕
    setTimeout(() => {
      const currentBarrages = this.data.barrages.filter(item => item.id !== newBarrage.id);
      this.setData({ barrages: currentBarrages });
    }, (duration + delay) * 1000);
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

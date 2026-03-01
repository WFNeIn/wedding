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
    
    // 步骤2: 0.6秒后展开信件内容（缩短等待时间）
    setTimeout(() => {
      this.setData({ openingStep: 2 });
    }, 600);
    
    // 步骤3: 2.5秒后隐藏整个动画，进入首页（总共3.1秒）
    setTimeout(() => {
      this.setData({ 
        showOpening: false,
        openingStep: 0
      });
      // 显示底部TabBar
      wx.showTabBar({
        animation: true
      });
    }, 2500);
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
          // 有真实祝福数据，进行质量筛选
          const qualityBlessings = this.filterQualityBlessings(res.data.map(item => item.content));
          this.setData({
            blessings: qualityBlessings
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
   * 筛选高质量祝福语
   * 评分标准：
   * 1. 长度：10-50字为最佳（+3分），50-100字（+2分），<10字或>100字（0分）
   * 2. 包含祝福关键词（+2分）
   * 3. 包含情感词汇（+1分）
   * 4. 包含标点符号（+1分，说明有结构）
   * 5. 去重：相似度过高的只保留一条
   */
  filterQualityBlessings(blessings) {
    // 祝福关键词
    const blessingKeywords = [
      '祝福', '恭喜', '幸福', '美满', '快乐', '甜蜜', '永远', '百年好合', 
      '白头偕老', '天长地久', '相爱', '恩爱', '美好', '圆满', '喜结良缘',
      '早生贵子', '琴瑟和鸣', '相濡以沫', '执子之手', '佳偶天成'
    ];
    
    // 情感词汇
    const emotionWords = [
      '爱', '真心', '祝愿', '期待', '见证', '感动', '温暖', '浪漫',
      '珍惜', '守护', '陪伴', '一生', '一世', '永恒', '真诚'
    ];

    // 1. 过滤掉少于10个字的祝福
    let filteredBlessings = blessings.filter(blessing => {
      const length = blessing.trim().length;
      return length >= 10;
    });

    // 如果过滤后数量太少，放宽到8个字
    if (filteredBlessings.length < 10) {
      filteredBlessings = blessings.filter(blessing => blessing.trim().length >= 8);
    }

    // 2. 计算每条祝福的质量分数
    const scoredBlessings = filteredBlessings.map(blessing => {
      let score = 0;
      const length = blessing.trim().length;
      
      // 长度评分
      if (length >= 10 && length <= 50) {
        score += 3;
      } else if (length > 50 && length <= 100) {
        score += 2;
      }
      
      // 包含祝福关键词
      const hasKeyword = blessingKeywords.some(keyword => blessing.includes(keyword));
      if (hasKeyword) {
        score += 2;
      }
      
      // 包含情感词汇
      const hasEmotion = emotionWords.some(word => blessing.includes(word));
      if (hasEmotion) {
        score += 1;
      }
      
      // 包含标点符号（说明有结构）
      const hasPunctuation = /[，。！？、；：""''（）【】《》]/.test(blessing);
      if (hasPunctuation) {
        score += 1;
      }
      
      // 避免纯重复字符
      const hasRepeat = /(.)\1{4,}/.test(blessing);
      if (hasRepeat) {
        score -= 2;
      }
      
      return {
        content: blessing,
        score: score
      };
    });

    // 3. 按分数排序，取前50条
    scoredBlessings.sort((a, b) => b.score - a.score);
    let topBlessings = scoredBlessings.slice(0, 50);

    // 4. 去重：移除相似度过高的祝福
    const uniqueBlessings = [];
    for (let i = 0; i < topBlessings.length; i++) {
      const current = topBlessings[i].content;
      let isDuplicate = false;
      
      for (let j = 0; j < uniqueBlessings.length; j++) {
        const similarity = this.calculateSimilarity(current, uniqueBlessings[j]);
        if (similarity > 0.7) { // 相似度超过70%认为是重复
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        uniqueBlessings.push(current);
      }
      
      // 保留至少20条
      if (uniqueBlessings.length >= 30) {
        break;
      }
    }

    console.log(`祝福筛选：原始${blessings.length}条 → 过滤后${filteredBlessings.length}条 → 高质量${uniqueBlessings.length}条`);
    
    // 如果筛选后数量太少，补充一些模拟数据
    if (uniqueBlessings.length < 10) {
      const mockBlessings = this.getHighQualityMockBlessings();
      return [...uniqueBlessings, ...mockBlessings].slice(0, 30);
    }
    
    return uniqueBlessings;
  },

  /**
   * 计算两个字符串的相似度（简单版本）
   */
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1.0;
    
    // 计算相同字符的数量
    let sameChars = 0;
    const minLen = Math.min(len1, len2);
    
    for (let i = 0; i < minLen; i++) {
      if (str1[i] === str2[i]) {
        sameChars++;
      }
    }
    
    return sameChars / maxLen;
  },

  /**
   * 获取高质量的模拟祝福数据
   */
  getHighQualityMockBlessings() {
    return [
      '祝你们新婚快乐，百年好合，永远幸福美满！',
      '愿你们的爱情天长地久，白头偕老，相濡以沫！',
      '恭喜你们喜结良缘，祝福你们恩爱有加，早生贵子！',
      '祝福新人，琴瑟和鸣，相亲相爱，幸福一生！',
      '愿你们执子之手，与子偕老，永远相爱相守！',
      '恭祝百年好合，永浴爱河，佳偶天成！',
      '祝你们新婚大喜，甜甜蜜蜜，花好月圆！',
      '愿你们的婚姻美满幸福，爱情甜蜜长久！',
      '祝福你们，相知相守，恩爱永久，幸福美满！',
      '恭喜新婚，祝你们永远快乐，真心相爱一辈子！',
      '愿你们珍惜彼此，携手共度美好人生！',
      '祝福新人，天作之合，鸾凤和鸣，永结同心！',
      '恭祝新婚愉快，愿你们的爱情永远浪漫温馨！',
      '祝你们相亲相爱，幸福美满，白头到老！',
      '愿你们的婚姻充满欢笑，生活充满阳光！'
    ];
  },

  /**
   * 生成模拟祝福数据（高质量版本）
   */
  generateMockBlessings() {
    const mockBlessings = this.getHighQualityMockBlessings();
    
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

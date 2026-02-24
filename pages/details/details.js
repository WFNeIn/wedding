// pages/details/details.js
const app = getApp();

Page({
  data: {
    // 婚礼流程
    schedule: [],
    // 地点信息
    venue: {
      name: '',
      address: '',
      latitude: 0,
      longitude: 0
    },
    // 联系方式
    contact: {
      name: '',
      phone: ''
    },
    // 音乐播放状态
    musicPlaying: false
  },

  /**
   * 页面加载时初始化数据
   */
  onLoad() {
    this.initDetailsData();
    this.initBackgroundMusic();
  },

  /**
   * 初始化背景音乐
   */
  initBackgroundMusic() {
    // 创建背景音频管理器
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    
    // 监听音乐播放
    this.backgroundAudioManager.onPlay(() => {
      this.setData({ musicPlaying: true });
    });
    
    // 监听音乐暂停
    this.backgroundAudioManager.onPause(() => {
      this.setData({ musicPlaying: false });
    });
    
    // 监听音乐停止
    this.backgroundAudioManager.onStop(() => {
      this.setData({ musicPlaying: false });
    });
    
    // 监听音乐自然播放结束
    this.backgroundAudioManager.onEnded(() => {
      this.setData({ musicPlaying: false });
      // 循环播放
      this.playMusic();
    });
  },

  /**
   * 播放音乐
   */
  playMusic() {
    const manager = this.backgroundAudioManager;
    
    // 设置音乐信息
    manager.title = '婚礼进行曲';
    manager.epname = '婚礼音乐';
    manager.singer = '婚礼背景音乐';
    
    // 设置音乐源 - 使用网络音乐URL
    // 注意: 需要替换为实际的音乐文件URL
    manager.src = 'https://example.com/wedding-music.mp3';
    
    // 如果没有网络音乐,可以提示用户
    wx.showToast({
      title: '音乐加载中...',
      icon: 'loading',
      duration: 1500
    });
  },

  /**
   * 切换音乐播放状态
   */
  toggleMusic() {
    const manager = this.backgroundAudioManager;
    
    if (this.data.musicPlaying) {
      // 暂停音乐
      manager.pause();
    } else {
      // 播放音乐
      if (manager.src) {
        manager.play();
      } else {
        this.playMusic();
      }
    }
  },

  /**
   * 初始化详情数据
   */
  initDetailsData() {
    const weddingInfo = app.globalData.weddingInfo;
    
    this.setData({
      schedule: weddingInfo.schedule,
      venue: weddingInfo.venue,
      contact: weddingInfo.contact
    });
  },

  /**
   * 打开地图导航
   */
  openMap() {
    const { venue } = this.data;
    
    wx.openLocation({
      latitude: venue.latitude,
      longitude: venue.longitude,
      name: venue.name,
      address: venue.address,
      scale: 16,
      success: () => {
        console.log('打开地图成功');
      },
      fail: (error) => {
        console.error('打开地图失败:', error);
        wx.showModal({
          title: '提示',
          content: '无法打开地图，请检查位置权限设置',
          showCancel: false
        });
      }
    });
  },

  /**
   * 拨打电话
   */
  makePhoneCall() {
    const { contact } = this.data;
    
    wx.makePhoneCall({
      phoneNumber: contact.phone,
      success: () => {
        console.log('拨打电话成功');
      },
      fail: (error) => {
        console.error('拨打电话失败:', error);
        wx.showModal({
          title: '提示',
          content: '无法拨打电话，请检查权限设置',
          showCancel: false
        });
      }
    });
  },

  /**
   * 页面卸载时停止音乐
   */
  onUnload() {
    if (this.backgroundAudioManager) {
      this.backgroundAudioManager.stop();
    }
  }
});

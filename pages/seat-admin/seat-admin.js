// pages/seat-admin/seat-admin.js
Page({
  data: {
    seats: [],
    stats: {
      total: 40,
      occupied: 0,
      available: 40,
      byType: {}
    },
    loading: false
  },

  /**
   * 页面加载
   */
  onLoad() {
    this.loadAllSeats();
  },

  /**
   * 加载所有座位数据
   */
  async loadAllSeats() {
    this.setData({ loading: true });
    
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getAllSeats'
      });
      
      wx.hideLoading();
      
      if (result.result && result.result.success) {
        this.setData({
          seats: result.result.data.seats,
          stats: result.result.data.stats,
          loading: false
        });
      } else {
        throw new Error('获取数据失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('加载失败:', error);
      this.setData({ loading: false });
      
      wx.showModal({
        title: '加载失败',
        content: '无法加载座位信息，请检查网络后重试',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            this.loadAllSeats();
          }
        }
      });
    }
  },

  /**
   * 刷新数据
   */
  onRefresh() {
    this.loadAllSeats();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadAllSeats();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});

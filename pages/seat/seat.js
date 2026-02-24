// pages/seat/seat.js
const seatService = require('../../utils/seatService.js');

Page({
  data: {
    // 座位数据
    seats: [],
    // 选中的宾客类型
    selectedGuestType: null,
    // 选中的座位
    selectedSeat: null,
    // 我的座位信息
    mySeat: null,
    // 加载状态
    loading: false,
    // 宾客类型列表
    guestTypes: seatService.GUEST_TYPES
  },

  /**
   * 页面加载
   */
  onLoad() {
    this.loadMySeat();
    this.loadSeats();
  },

  /**
   * 页面显示
   */
  onShow() {
    // 刷新座位状态
    this.loadSeats();
  },

  /**
   * 加载我的座位
   */
  async loadMySeat() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getMySeat'
      });
      
      if (result.result && result.result.success && result.result.data) {
        this.setData({
          mySeat: result.result.data
        });
      }
    } catch (error) {
      console.error('加载我的座位失败:', error);
    }
  },

  /**
   * 加载所有座位状态
   */
  async loadSeats() {
    this.setData({ loading: true });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getSeats'
      });
      
      if (result.result && result.result.success) {
        this.setData({
          seats: result.result.data,
          loading: false
        });
      } else {
        throw new Error('获取座位失败');
      }
    } catch (error) {
      console.error('加载座位状态失败:', error);
      this.setData({ loading: false });
      
      wx.showModal({
        title: '加载失败',
        content: '无法加载座位信息，请检查网络后重试',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            this.loadSeats();
          }
        }
      });
    }
  },

  /**
   * 选择宾客类型
   */
  onTypeSelect(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedGuestType: type,
      selectedSeat: null  // 切换类型时清空已选座位
    });
    
    wx.showToast({
      title: '已选择类型',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 点击座位
   */
  onSeatClick(e) {
    const seat = e.currentTarget.dataset.seat;
    
    // 检查是否已选择宾客类型
    if (!this.data.selectedGuestType) {
      wx.showModal({
        title: '提示',
        content: '请先选择您的宾客类型',
        showCancel: false
      });
      return;
    }
    
    // 检查座位是否已被占用
    if (seat.status === 'occupied') {
      wx.showModal({
        title: '座位已被占用',
        content: '该座位已被其他宾客选择，请选择其他座位',
        showCancel: false
      });
      return;
    }
    
    // 选中座位
    this.setData({
      selectedSeat: seat
    });
    
    wx.showToast({
      title: '已选择座位',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 提交座位选择
   */
  async onSubmit() {
    if (!this.data.selectedSeat) {
      wx.showToast({
        title: '请先选择座位',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.selectedGuestType) {
      wx.showToast({
        title: '请先选择宾客类型',
        icon: 'none'
      });
      return;
    }
    
    const { selectedSeat, selectedGuestType } = this.data;
    
    wx.showLoading({
      title: '提交中...'
    });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'selectSeat',
        data: {
          row: selectedSeat.row,
          col: selectedSeat.col,
          side: selectedSeat.side,
          guestType: selectedGuestType
        }
      });
      
      wx.hideLoading();
      
      if (result.result && result.result.success) {
        wx.showModal({
          title: '选座成功',
          content: `您已成功选择${selectedSeat.side === 'left' ? '左侧' : '右侧'}第${selectedSeat.row}排第${selectedSeat.col}列座位`,
          showCancel: false,
          success: () => {
            // 刷新页面
            this.setData({
              selectedSeat: null,
              selectedGuestType: null
            });
            this.loadMySeat();
            this.loadSeats();
          }
        });
      } else {
        wx.showModal({
          title: '选座失败',
          content: result.result.message || '选座失败，请稍后重试',
          showCancel: false,
          success: () => {
            // 刷新座位状态
            this.loadSeats();
          }
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('提交失败:', error);
      
      wx.showModal({
        title: '提交失败',
        content: '网络错误，请检查网络后重试',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            this.onSubmit();
          }
        }
      });
    }
  },

  /**
   * 管理员入口（长按舞台）
   */
  onAdminAccess() {
    wx.showModal({
      title: '管理员功能',
      content: '是否进入座位管理页面？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/seat-admin/seat-admin'
          });
        }
      }
    });
  }
});

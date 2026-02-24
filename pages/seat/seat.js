// pages/seat/seat.js
const seatService = require('../../utils/seatService.js');

Page({
  data: {
    // 座位数据
    seats: [],
    // 按区域和桌号组织的座位数据
    leftTables: [],     // 左侧桌子数组
    rightTables: [],    // 右侧桌子数组
    // 选中的宾客类型
    selectedGuestType: null,
    // 选中的座位
    selectedSeat: null,
    // 我的座位信息
    mySeat: null,
    // 加载状态
    loading: false,
    // 宾客类型列表
    guestTypes: seatService.GUEST_TYPES,
    // 缩放相关
    scale: 1,           // 当前缩放比例
    originX: 0,         // 缩放中心X
    originY: 0,         // 缩放中心Y
    lastScale: 1,       // 上次缩放比例
    // 触摸相关
    touches: [],        // 触摸点数组
    distance: 0         // 两指间距离
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
        const seats = result.result.data;
        
        // 组织座位数据：按桌号分组
        const leftTables = this.organizeSeatsByTables(seats, 'left', 1, 15);
        const rightTables = this.organizeSeatsByTables(seats, 'right', 16, 21);
        
        this.setData({
          seats: seats,
          leftTables: leftTables,
          rightTables: rightTables,
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
   * 按桌号组织座位数据
   */
  organizeSeatsByTables(seats, side, startTable, endTable) {
    const tables = [];
    
    for (let tableNum = startTable; tableNum <= endTable; tableNum++) {
      const tableSeats = seats.filter(seat => 
        seat.side === side && seat.tableNum === tableNum
      );
      
      if (tableSeats.length > 0) {
        tables.push({
          tableNum: tableNum,
          seats: tableSeats,
          areaType: tableSeats[0].areaType,
          areaName: tableSeats[0].areaName,
          areaColor: tableSeats[0].areaColor,
          isReserveTable: tableSeats[0].isReserveTable
        });
      }
    }
    
    return tables;
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
    
    // 调试信息
    console.log('点击座位:', {
      tableNum: seat.tableNum,
      seatNum: seat.seatNum,
      areaType: seat.areaType,
      selectedGuestType: this.data.selectedGuestType,
      isMatch: seat.areaType === this.data.selectedGuestType
    });
    
    // 检查是否已选择宾客类型
    if (!this.data.selectedGuestType) {
      wx.showModal({
        title: '提示',
        content: '请先选择您的宾客类型',
        showCancel: false
      });
      return;
    }
    
    // 检查是否是备用桌
    if (seat.isReserveTable) {
      wx.showModal({
        title: '备用桌',
        content: '该桌为备用桌，暂不开放选座',
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
    
    // 检查区域限制：用户只能在对应类型的区域选座
    if (seat.areaType !== this.data.selectedGuestType) {
      const areaNames = {
        'classmate': '同学区（1-2桌）',
        'bride_family': '女方亲友区（3-8桌）',
        'groom_family': '男方亲友区（9-21桌）'
      };
      
      console.log('区域限制触发:', {
        seatAreaType: seat.areaType,
        selectedGuestType: this.data.selectedGuestType,
        areaName: areaNames[this.data.selectedGuestType]
      });
      
      wx.showModal({
        title: '区域限制',
        content: `您选择的是"${this.getGuestTypeName(this.data.selectedGuestType)}"类型，只能在${areaNames[this.data.selectedGuestType]}选座`,
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
   * 获取宾客类型名称
   */
  getGuestTypeName(typeId) {
    const typeMap = {
      'classmate': '同学',
      'bride_family': '女方亲友',
      'groom_family': '男方亲友'
    };
    return typeMap[typeId] || typeId;
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
          tableNum: selectedSeat.tableNum,
          seatNum: selectedSeat.seatNum,
          side: selectedSeat.side,
          guestType: selectedGuestType
        }
      });
      
      wx.hideLoading();
      
      if (result.result && result.result.success) {
        wx.showModal({
          title: '选座成功',
          content: `您已成功选择${selectedSeat.side === 'left' ? '左侧' : '右侧'}第${selectedSeat.tableNum}桌${selectedSeat.seatNum}号座位`,
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
  },

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    const touches = e.touches;
    this.setData({
      touches: touches
    });
    
    // 如果是双指触摸，记录初始距离
    if (touches.length === 2) {
      const distance = this.getDistance(touches[0], touches[1]);
      this.setData({
        distance: distance,
        lastScale: this.data.scale
      });
    }
  },

  /**
   * 触摸移动
   */
  onTouchMove(e) {
    const touches = e.touches;
    
    // 双指缩放
    if (touches.length === 2 && this.data.touches.length === 2) {
      const newDistance = this.getDistance(touches[0], touches[1]);
      const scale = (newDistance / this.data.distance) * this.data.lastScale;
      
      // 限制缩放范围 0.5 - 3
      const limitedScale = Math.max(0.5, Math.min(3, scale));
      
      // 计算缩放中心点
      const centerX = (touches[0].x + touches[1].x) / 2;
      const centerY = (touches[0].y + touches[1].y) / 2;
      
      this.setData({
        scale: limitedScale,
        originX: centerX,
        originY: centerY
      });
    }
  },

  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    this.setData({
      touches: []
    });
  },

  /**
   * 计算两点间距离
   */
  getDistance(touch1, touch2) {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
});

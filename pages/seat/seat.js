// pages/seat/seat.js
Page({
  data: {
    scale: 1, // 缩放比例
    
    // 所有20桌的数据（按行顺序）
    allTables: [
      // 第2行：1-4桌
      { tableNum: 1, guestType: 'bride-family', guestTypeName: '女方亲友' },
      { tableNum: 2, guestType: 'bride-family', guestTypeName: '女方亲友' },
      { tableNum: 3, guestType: 'bride-family', guestTypeName: '女方亲友' },
      { tableNum: 4, guestType: 'father-friends', guestTypeName: '父亲朋友' },
      // 第3行：5-8桌
      { tableNum: 5, guestType: 'bride-family', guestTypeName: '女方亲友' },
      { tableNum: 6, guestType: 'bride-family', guestTypeName: '女方亲友' },
      { tableNum: 7, guestType: 'bride-family', guestTypeName: '女方亲友' },
      { tableNum: 8, guestType: 'father-friends', guestTypeName: '父亲朋友' },
      // 第4行：9-12桌
      { tableNum: 9, guestType: 'father-friends', guestTypeName: '父亲朋友' },
      { tableNum: 10, guestType: 'father-friends', guestTypeName: '父亲朋友' },
      { tableNum: 11, guestType: 'father-friends', guestTypeName: '父亲朋友' },
      { tableNum: 12, guestType: 'father-friends', guestTypeName: '父亲朋友' },
      // 第5行：13-16桌
      { tableNum: 13, guestType: 'father-friends', guestTypeName: '父亲朋友' },
      { tableNum: 14, guestType: 'classmate', guestTypeName: '男方同学' },
      { tableNum: 15, guestType: 'classmate', guestTypeName: '男方同学' },
      { tableNum: 16, guestType: 'mother-friends', guestTypeName: '母亲朋友' },
      // 第6行：17-20桌
      { tableNum: 17, guestType: 'relatives', guestTypeName: '亲人' },
      { tableNum: 18, guestType: 'relatives', guestTypeName: '亲人' },
      { tableNum: 19, guestType: 'relatives', guestTypeName: '亲人' },
      { tableNum: 20, guestType: 'father-friends', guestTypeName: '父亲朋友' }
    ],
    
    // 触摸相关
    touchStartDistance: 0,
    touchStartScale: 1
  },

  onLoad() {
    // 页面加载
  },

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    if (e.touches.length === 2) {
      // 双指触摸，记录初始距离
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = this.getDistance(touch1, touch2);
      
      this.setData({
        touchStartDistance: distance,
        touchStartScale: this.data.scale
      });
    }
  },

  /**
   * 触摸移动
   */
  onTouchMove(e) {
    if (e.touches.length === 2) {
      // 双指缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = this.getDistance(touch1, touch2);
      
      if (this.data.touchStartDistance > 0) {
        const scale = (distance / this.data.touchStartDistance) * this.data.touchStartScale;
        
        // 限制缩放范围 0.5 - 2
        const newScale = Math.max(0.5, Math.min(2, scale));
        
        this.setData({ scale: newScale });
      }
    }
  },

  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    if (e.touches.length < 2) {
      this.setData({
        touchStartDistance: 0
      });
    }
  },

  /**
   * 计算两点距离
   */
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
});

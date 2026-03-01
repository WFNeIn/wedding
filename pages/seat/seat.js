// pages/seat/seat.js
Page({
  data: {
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
    ]
  },

  onLoad() {
    // 页面加载
  }
});

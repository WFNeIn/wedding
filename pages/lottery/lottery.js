// pages/lottery/lottery.js
const util = require('../../utils/util.js');

Page({
  data: {
    lotteryNumber: '', // 用户的抽奖号码
    prizeInfo: null, // 中奖信息
    loading: true
  },

  /**
   * 页面加载
   */
  onLoad() {
    this.getLotteryNumber();
  },

  /**
   * 页面显示时刷新中奖状态
   */
  onShow() {
    if (this.data.lotteryNumber) {
      this.checkPrizeStatus();
    }
  },

  /**
   * 获取或分配抽奖号码
   */
  getLotteryNumber() {
    util.showLoading('加载中...');

    // 检查云开发是否初始化
    if (!wx.cloud) {
      console.error('云开发未初始化');
      util.hideLoading();
      util.showError('云开发未初始化');
      this.assignLocalNumber();
      return;
    }

    const db = wx.cloud.database();
    const _ = db.command;

    // 直接查询用户的号码(使用云数据库权限自动获取openid)
    db.collection('lottery_numbers')
      .where({
        _openid: _.exists(true)
      })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          // 用户已有号码
          const numberData = res.data[0];
          this.setData({
            lotteryNumber: numberData.number,
            loading: false
          });
          this.checkPrizeStatus();
        } else {
          // 分配新号码
          this.assignNewNumber();
        }
        util.hideLoading();
      })
      .catch(err => {
        console.error('获取号码失败:', err);
        util.hideLoading();
        util.showError('获取号码失败');
        
        // 使用本地生成
        this.assignLocalNumber();
      });
  },

  /**
   * 分配新号码
   */
  assignNewNumber() {
    const db = wx.cloud.database();
    const _ = db.command;

    // 获取当前最大号码
    db.collection('lottery_numbers')
      .orderBy('numberValue', 'desc')
      .limit(1)
      .get()
      .then(res => {
        let nextNumber = 1;
        if (res.data.length > 0) {
          nextNumber = res.data[0].numberValue + 1;
        }

        // 检查是否超过200
        if (nextNumber > 200) {
          util.showError('抽奖号码已分配完毕');
          this.setData({ loading: false });
          return;
        }

        // 格式化号码为3位数字
        const formattedNumber = String(nextNumber).padStart(3, '0');

        // 保存号码(云数据库会自动添加_openid字段)
        return db.collection('lottery_numbers').add({
          data: {
            number: formattedNumber,
            numberValue: nextNumber,
            createTime: db.serverDate(),
            hasPrize: false
          }
        }).then(() => {
          this.setData({
            lotteryNumber: formattedNumber,
            loading: false
          });
          util.showSuccess('号码分配成功');
        });
      })
      .catch(err => {
        console.error('分配号码失败:', err);
        util.showError('分配号码失败');
        this.setData({ loading: false });
      });
  },

  /**
   * 本地分配号码(备用方案)
   */
  assignLocalNumber() {
    // 使用时间戳生成临时号码
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 200) + 1;
    const formattedNumber = String(randomNum).padStart(3, '0');
    
    this.setData({
      lotteryNumber: formattedNumber,
      loading: false
    });
    
    wx.showModal({
      title: '提示',
      content: '当前使用临时号码,请配置云开发环境以获取正式号码',
      showCancel: false
    });
  },

  /**
   * 检查中奖状态
   */
  checkPrizeStatus() {
    if (!wx.cloud) return;

    const db = wx.cloud.database();
    
    db.collection('lottery_prizes')
      .where({
        winnerNumber: this.data.lotteryNumber
      })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          this.setData({
            prizeInfo: res.data[0]
          });
        }
      })
      .catch(err => {
        console.error('查询中奖状态失败:', err);
        // 如果是集合不存在的错误，静默处理
        if (err.errCode === -502005) {
          console.log('lottery_prizes 集合尚未创建，请在云开发控制台创建该集合');
        }
      });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.checkPrizeStatus();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});

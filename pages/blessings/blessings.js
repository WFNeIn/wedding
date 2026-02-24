// pages/blessings/blessings.js
const util = require('../../utils/util.js');

Page({
  data: {
    // 留言列表
    blessingsList: [],
    // 输入内容
    inputContent: '',
    // 是否正在加载
    loading: false,
    // 是否正在提交
    submitting: false,
    // 是否显示快速祝福语
    showQuickBlessings: false,
    // 快速祝福语列表
    quickBlessingsList: [
      '祝你们百年好合，永结同心！',
      '新婚快乐，白头偕老，早生贵子！',
      '愿你们的爱情如美酒般醇香，越久越浓！',
      '执子之手，与子偕老。祝新婚快乐！',
      '祝福你们新婚愉快，幸福美满，永浴爱河！',
      '相亲相爱好伴侣，同德同心美姻缘！',
      '愿你们的婚姻生活充满爱、欢笑和幸福！',
      '天作之合，鸾凤和鸣，祝新婚大喜！',
      '祝你们永远相爱，携手共度美好人生！',
      '真诚祝愿你们新婚快乐，幸福永远！'
    ]
  },

  /**
   * 页面加载
   */
  onLoad() {
    this.loadBlessings();
  },

  /**
   * 阻止横向滑动
   */
  preventTouchMove(e) {
    // 阻止默认的触摸移动行为,防止左右滑动
    return false;
  },

  /**
   * 页面显示时刷新留言列表
   */
  onShow() {
    this.loadBlessings();
  },

  /**
   * 加载留言列表
   */
  loadBlessings() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    // 检查云开发是否初始化
    if (!wx.cloud) {
      console.error('wx.cloud 未定义，云开发未初始化');
      this.setData({ loading: false });
      return;
    }

    const db = wx.cloud.database();

    // 从云数据库查询留言，按时间倒序排列
    db.collection('blessings')
      .orderBy('createTime', 'desc')
      .limit(100) // 限制最多加载100条
      .get()
      .then(res => {
        console.log('加载留言成功，数量:', res.data.length);
        
        // 格式化时间显示,并将所有昵称替换为匿名
        const blessingsList = res.data.map((item, index) => {
          return {
            ...item,
            nickname: this.generateAnonymousName(index), // 生成匿名昵称
            createTimeDisplay: util.formatTime(item.createTime, 'relative')
          };
        });

        this.setData({
          blessingsList: blessingsList,
          loading: false
        });
      })
      .catch(err => {
        console.error('加载留言失败，完整错误:', err);
        console.error('错误代码:', err.errCode);
        console.error('错误消息:', err.errMsg);
        this.setData({ loading: false });
        
        // 如果是集合不存在的错误，不显示提示（因为可能是第一次使用）
        if (err.errMsg && !err.errMsg.includes('collection')) {
          util.showError('加载留言失败');
        }
      });
  },

  /**
   * 生成匿名昵称
   */
  generateAnonymousName(index) {
    const prefixes = ['热心', '友善', '可爱', '温暖', '善良', '真诚', '快乐', '幸福', '美好', '甜蜜'];
    const suffixes = ['宾客', '朋友', '来宾', '好友', '伙伴'];
    
    const prefixIndex = index % prefixes.length;
    const suffixIndex = Math.floor(index / prefixes.length) % suffixes.length;
    const number = Math.floor(index / (prefixes.length * suffixes.length)) + 1;
    
    if (number === 1) {
      return `${prefixes[prefixIndex]}的${suffixes[suffixIndex]}`;
    } else {
      return `${prefixes[prefixIndex]}的${suffixes[suffixIndex]}${number}`;
    }
  },

  /**
   * 输入内容变化
   */
  onInput(e) {
    this.setData({
      inputContent: e.detail.value
    });
  },

  /**
   * 切换快速祝福语显示
   */
  toggleQuickBlessings() {
    this.setData({
      showQuickBlessings: !this.data.showQuickBlessings
    });
  },

  /**
   * 选择快速祝福语
   */
  selectQuickBlessing(e) {
    const content = e.currentTarget.dataset.content;
    this.setData({
      inputContent: content,
      showQuickBlessings: false
    });
  },

  /**
   * 验证留言内容
   */
  validateContent() {
    const content = this.data.inputContent.trim();

    if (!content) {
      util.showError('请输入祝福内容');
      return false;
    }

    if (content.length > 500) {
      util.showError('祝福内容不能超过500字');
      return false;
    }

    return true;
  },

  /**
   * 发送留言
   */
  sendBlessing() {
    // 防止重复提交
    if (this.data.submitting) {
      return;
    }

    // 验证内容
    if (!this.validateContent()) {
      return;
    }

    const content = this.data.inputContent.trim();

    this.setData({ submitting: true });
    util.showLoading('发送中...');

    // 获取用户信息
    wx.getUserProfile({
      desc: '用于显示您的昵称',
      success: (userRes) => {
        const nickname = userRes.userInfo.nickName || '访客';
        this.submitBlessing(nickname, content);
      },
      fail: () => {
        // 用户拒绝授权，使用默认昵称
        this.submitBlessing('访客', content);
      }
    });
  },

  /**
   * 提交留言到数据库
   */
  submitBlessing(nickname, content) {
    console.log('开始提交留言，昵称:', nickname, '内容:', content);
    
    // 检查云开发是否初始化
    if (!wx.cloud) {
      console.error('wx.cloud 未定义，云开发未初始化');
      util.hideLoading();
      util.showError('云开发未初始化，请检查配置');
      this.setData({ submitting: false });
      return;
    }

    const db = wx.cloud.database();
    console.log('数据库实例:', db);

    // 保存到数据库,包含真实昵称和openid(云数据库自动添加_openid)
    db.collection('blessings').add({
      data: {
        realNickname: nickname, // 真实昵称,仅存储在数据库
        nickname: '匿名用户', // 显示用的昵称(实际不会被使用,因为前端会替换)
        content: content,
        createTime: db.serverDate() // 使用服务端时间
      }
    }).then(res => {
      console.log('发送成功，返回结果:', res);
      util.hideLoading();
      util.showSuccess('发送成功');
      
      // 清空输入框
      this.setData({
        inputContent: '',
        submitting: false
      });

      // 刷新留言列表
      this.loadBlessings();
    }).catch(err => {
      util.hideLoading();
      console.error('发送失败，完整错误信息:', err);
      console.error('错误代码:', err.errCode);
      console.error('错误消息:', err.errMsg);
      
      // 根据错误类型显示不同的提示
      let errorMsg = '发送失败，请稍后重试';
      if (err.errMsg && err.errMsg.includes('collection')) {
        errorMsg = '数据库集合不存在，请先创建 blessings 集合';
      } else if (err.errMsg && err.errMsg.includes('permission')) {
        errorMsg = '权限不足，请检查数据库权限设置';
      } else if (err.errMsg && err.errMsg.includes('env')) {
        errorMsg = '云开发环境配置错误，请检查环境ID';
      }
      
      util.showError(errorMsg);
      this.setData({ submitting: false });
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadBlessings();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});

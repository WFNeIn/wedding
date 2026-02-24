// pages/rsvp/rsvp.js
const util = require('../../utils/util.js');

Page({
  data: {
    // 表单数据
    formData: {
      name: '',
      phone: '',
      attendees: 1,
      hasChildren: false,
      dietaryRestrictions: ''
    },
    // 到场人数选择器数据
    attendeesRange: ['1人', '2人', '3人', '4人'],
    attendeesIndex: 0,
    // 彩蛋文字
    easterEggText: '* 本回执仅供娱乐参考'
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 初始化表单默认值
    this.setData({
      'formData.attendees': 1,
      'formData.hasChildren': false
    });
  },

  /**
   * 姓名输入
   */
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  /**
   * 电话输入
   */
  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    });
  },

  /**
   * 到场人数选择
   */
  onAttendeesChange(e) {
    console.log('到场人数选择器触发，选择的索引:', e.detail.value);
    const index = e.detail.value;
    const attendees = parseInt(index) + 1;
    console.log('设置到场人数为:', attendees);
    
    this.setData({
      attendeesIndex: index,
      'formData.attendees': attendees
    });
    
    console.log('当前表单数据:', this.data.formData);
  },

  /**
   * 是否有儿童开关
   */
  onChildrenSwitch(e) {
    this.setData({
      'formData.hasChildren': e.detail.value
    });
  },

  /**
   * 饮食禁忌输入
   */
  onDietaryInput(e) {
    this.setData({
      'formData.dietaryRestrictions': e.detail.value
    });
  },

  /**
   * 验证表单数据
   */
  validateForm() {
    const { name, phone, attendees } = this.data.formData;

    // 验证姓名
    if (!name || name.trim().length < 2) {
      util.showError('请输入有效姓名（至少2个字符）');
      return false;
    }

    if (name.trim().length > 20) {
      util.showError('姓名长度不能超过20个字符');
      return false;
    }

    // 验证电话
    if (!util.validatePhone(phone)) {
      util.showError('请输入有效的手机号');
      return false;
    }

    // 验证到场人数
    if (attendees < 1 || attendees > 4) {
      util.showError('到场人数应为1-4人');
      return false;
    }

    return true;
  },

  /**
   * 提交回执
   */
  submitRSVP() {
    // 验证表单
    if (!this.validateForm()) {
      return;
    }

    const { formData } = this.data;

    // 显示加载提示
    util.showLoading('提交中...');

    // 获取云数据库引用
    const db = wx.cloud.database();

    // 保存到云数据库
    db.collection('rsvp').add({
      data: {
        name: formData.name.trim(),
        phone: formData.phone,
        attendees: formData.attendees,
        hasChildren: formData.hasChildren,
        dietaryRestrictions: formData.dietaryRestrictions.trim(),
        createTime: db.serverDate() // 使用服务端时间
      }
    }).then(res => {
      util.hideLoading();
      util.showSuccess('提交成功');
      
      // 清空表单
      this.resetForm();
    }).catch(err => {
      util.hideLoading();
      console.error('提交失败:', err);
      util.showError('提交失败，请稍后重试');
    });
  },

  /**
   * 重置表单
   */
  resetForm() {
    this.setData({
      formData: {
        name: '',
        phone: '',
        attendees: 1,
        hasChildren: false,
        dietaryRestrictions: ''
      },
      attendeesIndex: 0
    });
  },

  /**
   * 显示彩蛋提示
   */
  showEasterEgg() {
    wx.showModal({
      title: '🎈 小提示',
      content: '此回执功能仅作为娱乐互动使用，实际参会情况请以电话或微信确认为准哦~',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#87CEEB'
    });
  }
});

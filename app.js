// app.js
App({
  onLaunch() {
    console.log('小程序启动');
    
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      console.error('当前基础库版本过低，不支持云开发');
    } else {
      console.log('开始初始化云开发...');
      try {
        wx.cloud.init({
          // 此处请填写你的云开发环境ID
          env: 'cloud1-1ggbfv6gc7c31070',
          traceUser: true
        });
        console.log('云开发初始化成功');
        console.log('环境ID: app-env-wf-invitation-3a8672c704');
      } catch (error) {
        console.error('云开发初始化失败:', error);
      }
    }
  },

  globalData: {
    // 婚礼信息配置
    weddingInfo: {
      couple: {
        groom: '王峰',
        bride: '杨丽琴'
      },
      date: '2026-05-04',
      time: '12:00',
      venue: {
        name: '新城宴(新城华府店)',
        address: '武汉市新洲区邾城街龙腾大道新城华府A4号楼',
        latitude: 30.826285,
        longitude: 114.811298
      },
      schedule: [
        { time: '11:00', event: '迎宾' },
        { time: '12:00', event: '仪式' },
        { time: '12:30', event: '午宴' }
      ],
      contact: {
        name: '新郎',
        phone: '13098812825'
      }
    }
  }
});

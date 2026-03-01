# 天气功能说明

## 当前状态

小程序使用模拟天气数据显示在婚礼日期卡片上。

**模拟数据：** 多云 23℃ 东南风2级

这是根据武汉5月初（春末夏初）的典型天气设置的参考数据。

## 为什么使用模拟数据？

尝试集成和风天气API时遇到了403权限错误。这是因为：

1. 免费版API Key有访问限制
2. 需要在和风天气开发者平台配置访问权限
3. 或者需要升级到付费版API

对于婚礼邀请小程序来说，天气信息是参考性的，使用模拟数据完全可以满足需求。

## 如何修改天气数据

如果需要修改显示的天气信息，可以编辑 `pages/index/index.js` 文件中的 `setMockWeather` 方法：

```javascript
setMockWeather() {
  const mockWeather = {
    weather: '多云',      // 天气状况：晴、多云、阴、小雨等
    temp: '23',          // 当前温度
    tempRange: '18~26',  // 温度范围
    windDir: '东南风',    // 风向
    windScale: '2级',    // 风力等级
    humidity: '60',      // 湿度
    text: '多云转晴'      // 天气描述
  };
  
  this.setData({ weatherData: mockWeather });
}
```

## 如果需要真实天气数据

### 方案1：使用其他天气API

可以考虑使用其他天气API服务，例如：
- 心知天气
- 彩云天气
- OpenWeatherMap

### 方案2：配置和风天气API权限

1. 登录和风天气开发者平台：https://dev.qweather.com/
2. 进入控制台，找到你的API Key
3. 配置访问权限和域名白名单
4. 或者升级到付费版本

### 方案3：手动更新

在婚礼前几天，查看天气预报，手动更新 `setMockWeather` 方法中的数据。

## 显示位置

天气信息显示在首页的"婚礼日期"卡片下方，格式为：
```
多云 23℃ 东南风2级
```

## 技术说明

- 天气数据存储在 `pages/index/index.js` 的 `weatherData` 变量中
- 在页面加载时调用 `loadWeather()` 方法
- 通过 `setMockWeather()` 设置模拟数据
- 在 `pages/index/index.wxml` 中显示


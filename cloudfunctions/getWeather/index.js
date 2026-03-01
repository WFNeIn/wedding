// 云函数：获取天气信息
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 获取指定经纬度的天气信息
 * 使用和风天气免费API
 * 添加缓存机制：每天只请求一次API
 */
exports.main = async (event) => {
  const { latitude, longitude } = event;
  
  // 参数校验
  if (!latitude || !longitude) {
    return {
      success: false,
      message: '缺少必要参数：latitude 或 longitude'
    };
  }
  
  try {
    // 生成缓存key（基于经纬度，保留4位小数）
    const lat = parseFloat(latitude).toFixed(4);
    const lng = parseFloat(longitude).toFixed(4);
    const cacheKey = `weather_${lat}_${lng}`;
    const today = new Date().toISOString().split('T')[0]; // 格式：2024-01-01
    
    // 1. 先查询缓存
    try {
      const cacheResult = await db.collection('weather_cache')
        .where({
          cacheKey: cacheKey,
          date: today
        })
        .limit(1)
        .get();
      
      // 如果有今天的缓存，直接返回
      if (cacheResult.data && cacheResult.data.length > 0) {
        console.log('使用缓存数据');
        return {
          success: true,
          data: cacheResult.data[0].weatherData,
          message: '缓存数据',
          cached: true
        };
      }
    } catch (cacheError) {
      console.warn('查询缓存失败，继续获取天气:', cacheError);
      // 缓存查询失败不影响主流程
    }
    
    // 2. 没有缓存，调用API获取天气
    console.log('缓存未命中，调用API获取天气');
    
    // 和风天气API配置
    const apiKey = 'd80be5e5b09534542f6dcf327989109e'; // 请替换为实际的API key
    
    // 如果没有配置API key，返回模拟数据
    if (apiKey === 'YOUR_API_KEY_HERE') {
      console.log('未配置天气API key，返回模拟数据');
      const mockData = getMockWeatherData();
      
      // 保存模拟数据到缓存
      await saveCache(cacheKey, today, mockData);
      
      return {
        success: true,
        data: mockData,
        message: '模拟数据',
        cached: false
      };
    }
    
    // 调用和风天气API
    const weatherData = await fetchWeatherFromAPI(longitude, latitude, apiKey);
    
    // 3. 保存到缓存
    await saveCache(cacheKey, today, weatherData);
    
    return {
      success: true,
      data: weatherData,
      message: 'API数据',
      cached: false
    };
    
  } catch (error) {
    console.error('获取天气失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // 尝试返回昨天的缓存数据
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const lat = parseFloat(latitude).toFixed(4);
      const lng = parseFloat(longitude).toFixed(4);
      const cacheKey = `weather_${lat}_${lng}`;
      
      const oldCacheResult = await db.collection('weather_cache')
        .where({
          cacheKey: cacheKey,
          date: yesterdayStr
        })
        .limit(1)
        .get();
      
      if (oldCacheResult.data && oldCacheResult.data.length > 0) {
        console.log('使用昨天的缓存数据');
        return {
          success: true,
          data: oldCacheResult.data[0].weatherData,
          message: '昨天的缓存数据',
          cached: true
        };
      }
    } catch (oldCacheError) {
      console.warn('查询旧缓存失败:', oldCacheError);
    }
    
    // 返回模拟数据作为最终降级方案
    return {
      success: true,
      data: getMockWeatherData(),
      message: '使用模拟数据（API调用失败）',
      cached: false
    };
  }
};

/**
 * 从和风天气API获取天气数据
 * 直接使用经纬度查询，不需要先获取城市ID
 */
async function fetchWeatherFromAPI(longitude, latitude, apiKey) {
  // 使用 Node.js 内置的 https 模块
  const https = require('https');
  
  try {
    console.log('=== 开始获取天气数据 ===');
    console.log('经纬度:', { longitude, latitude });
    console.log('API Key:', apiKey);
    
    // 直接使用经纬度查询天气（格式：经度,纬度）
    const location = `${longitude},${latitude}`;
    
    console.log('=== 开始获取天气详情 ===');
    
    const weatherUrl = `https://devapi.qweather.com/v7/weather/now?location=${location}&key=${apiKey}`;
    const forecastUrl = `https://devapi.qweather.com/v7/weather/3d?location=${location}&key=${apiKey}`;
    
    console.log('实时天气 URL:', weatherUrl);
    console.log('预报天气 URL:', forecastUrl);
    
    // 并行获取实时天气和未来天气
    const [weatherData, forecastData] = await Promise.all([
      httpGet(weatherUrl),
      httpGet(forecastUrl)
    ]);
    
    console.log('实时天气返回完整数据:', JSON.stringify(weatherData, null, 2));
    console.log('预报天气返回完整数据:', JSON.stringify(forecastData, null, 2));
    
    if (weatherData.code !== '200') {
      console.error('实时天气API返回错误码:', weatherData.code);
      throw new Error(`获取实时天气失败: code=${weatherData.code}, message=${weatherData.message || '未知错误'}`);
    }
    
    if (!weatherData.now) {
      console.error('实时天气数据为空');
      throw new Error('实时天气数据为空');
    }
    
    const now = weatherData.now;
    console.log('实时天气数据:', now);
    
    // 获取温度范围
    let tempRange = now.temp;
    if (forecastData.code === '200' && forecastData.daily && forecastData.daily.length > 0) {
      const today = forecastData.daily[0];
      tempRange = `${today.tempMin}~${today.tempMax}`;
      console.log('温度范围:', tempRange);
    } else {
      console.warn('预报天气获取失败，使用实时温度');
    }
    
    const result = {
      weather: now.text,
      temp: now.temp,
      tempRange: tempRange,
      windDir: now.windDir,
      windScale: now.windScale + '级',
      humidity: now.humidity,
      text: now.text,
      updateTime: now.obsTime
    };
    
    console.log('=== 天气数据获取成功 ===');
    console.log('最终返回数据:', result);
    
    return result;
  } catch (error) {
    console.error('=== fetchWeatherFromAPI 错误 ===');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 使用 https 模块发送 GET 请求
 */
function httpGet(url) {
  const https = require('https');
  const zlib = require('zlib');
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      console.log('HTTP响应状态码:', res.statusCode);
      console.log('HTTP响应头:', res.headers);
      
      const chunks = [];
      
      // 检查是否是 gzip 压缩
      const encoding = res.headers['content-encoding'];
      console.log('内容编码:', encoding);
      
      let stream = res;
      
      if (encoding === 'gzip') {
        console.log('检测到 gzip 压缩，开始解压');
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        console.log('检测到 deflate 压缩，开始解压');
        stream = res.pipe(zlib.createInflate());
      }
      
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      stream.on('end', () => {
        try {
          const data = Buffer.concat(chunks).toString('utf8');
          console.log('接收到的原始数据:', data.substring(0, 200)); // 只打印前200个字符
          const jsonData = JSON.parse(data);
          console.log('解析后的JSON数据:', JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (error) {
          console.error('解析失败，原始数据前100字节:', Buffer.concat(chunks).slice(0, 100));
          reject(new Error('解析JSON失败: ' + error.message));
        }
      });
      
      stream.on('error', (error) => {
        console.error('流错误:', error);
        reject(error);
      });
    }).on('error', (error) => {
      console.error('HTTP请求错误:', error);
      reject(error);
    });
  });
}

/**
 * 获取模拟天气数据
 */
function getMockWeatherData() {
  return {
    weather: '晴',
    temp: '25',
    tempRange: '18~28',
    windDir: '东南风',
    windScale: '3级',
    humidity: '65',
    text: '晴朗',
    updateTime: new Date().toISOString()
  };
}

/**
 * 保存天气数据到缓存
 */
async function saveCache(cacheKey, date, weatherData) {
  try {
    // 使用 upsert 模式：如果存在则更新，不存在则插入
    const existingCache = await db.collection('weather_cache')
      .where({
        cacheKey: cacheKey,
        date: date
      })
      .get();
    
    if (existingCache.data && existingCache.data.length > 0) {
      // 更新现有缓存
      await db.collection('weather_cache')
        .doc(existingCache.data[0]._id)
        .update({
          data: {
            weatherData: weatherData,
            updateTime: db.serverDate()
          }
        });
      console.log('天气缓存已更新');
    } else {
      // 添加新缓存
      await db.collection('weather_cache').add({
        data: {
          cacheKey: cacheKey,
          date: date,
          weatherData: weatherData,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
      console.log('天气缓存已创建');
    }
    
    // 清理7天前的旧缓存
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    await db.collection('weather_cache')
      .where({
        date: db.command.lt(sevenDaysAgoStr)
      })
      .remove();
    
  } catch (error) {
    console.error('保存缓存失败:', error);
    // 缓存失败不影响主流程
  }
}

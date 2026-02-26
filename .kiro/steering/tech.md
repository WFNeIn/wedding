# Technology Stack

## Platform
WeChat Mini Program (微信小程序) - Native framework

## Backend
WeChat Cloud Development (微信云开发)
- Cloud Database (云数据库)
- Cloud Functions (云函数)
- Cloud Storage (云存储)

## Language & Runtime
- JavaScript (ES6+)
- WeChat Mini Program API
- Node.js (for cloud functions)

## Key Libraries
- wx-server-sdk: WeChat cloud development SDK for server-side

## Development Tools
- WeChat DevTools (微信开发者工具)
- Minimum base library version: 2.2.3

## Project Configuration
- Base library version: 3.14.2
- ES6 to ES5 compilation enabled
- Code minification enabled for production
- Lazy loading enabled for components

## Common Commands

### Development
No build commands needed - use WeChat DevTools directly:
1. Open project in WeChat DevTools
2. Click "Compile" (编译) to preview
3. Use simulator or scan QR code for real device testing

### Cloud Functions Deployment
Right-click cloud function folder in WeChat DevTools:
- Select "Upload and Deploy: Install Dependencies" (上传并部署：云端安装依赖)
- Wait for deployment to complete

### Testing
- Use WeChat DevTools Console for debugging
- Check cloud logs in Cloud Development Console
- Real device testing via QR code scan

## Code Style
- Indentation: 2 spaces
- Comments: Chinese (中文注释)
- File encoding: UTF-8
- Line endings: LF

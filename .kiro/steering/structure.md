# Project Structure

## Directory Layout

```
wedding-invitation-miniapp/
├── pages/              # 页面目录 (Page components)
│   ├── index/         # 首页 (Homepage with carousel & countdown)
│   ├── details/       # 详情页 (Wedding details & timeline)
│   ├── rsvp/          # 回执页 (RSVP form)
│   ├── blessings/     # 祝福留言板 (Blessing messages)
│   ├── lottery/       # 抽奖页 (Lottery page)
│   ├── seat/          # 选座页 (Seat selection)
│   └── seat-admin/    # 座位管理页 (Admin seat view)
├── utils/             # 工具函数 (Utility functions)
│   ├── util.js        # 通用工具 (Time formatting, validation, etc.)
│   └── seatService.js # 座位服务 (Seat management logic)
├── images/            # 图片资源 (Image assets)
│   └── tabbar/        # 底部导航图标 (Tab bar icons)
├── cloudfunctions/    # 云函数 (Cloud functions)
│   ├── submitRSVP/    # 提交回执
│   ├── addBlessing/   # 添加祝福
│   ├── selectSeat/    # 选择座位
│   ├── getSeats/      # 获取座位状态
│   ├── getMySeat/     # 获取我的座位
│   └── getAllSeats/   # 管理员查看所有座位
├── lottery-screen/    # 大屏抽奖页面 (Lottery display screen)
├── specs/             # 功能规格文档 (Feature specifications)
├── app.js             # 小程序入口 (App entry point)
├── app.json           # 小程序配置 (App configuration)
├── app.wxss           # 全局样式 (Global styles)
└── project.config.json # 项目配置 (Project settings)
```

## Page Structure Convention

Each page follows WeChat Mini Program structure with 4 files:
- `*.wxml` - Template markup (类似 HTML)
- `*.wxss` - Styles (类似 CSS)
- `*.js` - Page logic and data
- `*.json` - Page configuration

## Cloud Function Structure

Each cloud function is a separate directory with:
- `index.js` - Function entry point
- `package.json` - Dependencies

## Key Files

### Configuration
- `app.json` - Pages, tabBar, window settings, navigation
- `project.config.json` - AppID, compile settings, cloud function root
- `app.js` - Global data (weddingInfo), cloud init

### Global Data (app.js)
Wedding information stored in `app.globalData.weddingInfo`:
- couple (groom/bride names)
- date, time
- venue (name, address, coordinates)
- schedule, contact info

## Database Collections

- `rsvp` - Guest RSVP responses
- `blessings` - Guest blessing messages
- `lottery_numbers` - Lottery ticket numbers
- `lottery_prizes` - Prize winners
- `seats` - Seat assignments (requires seatId unique index)

## Naming Conventions

- Files: kebab-case or camelCase
- Functions: camelCase
- Cloud functions: camelCase directory names
- Comments: Chinese (中文)
- Variables: English with Chinese comments

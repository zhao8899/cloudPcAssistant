# Material Design 3 全页面重设计规范

**日期:** 2026-03-30  
**项目:** cloudPcAssistant（天翼云电脑桌面助手）  
**范围:** 全部 26 个功能页面 + Design Token 体系 + 乱码修复

---

## 1. 背景与目标

当前项目存在两套并行的视觉体系：
- **新风格（14 页）**：蓝色渐变导航栏、大圆角卡片、rpx 单位、硬编码色值
- **旧风格（12 页）**：Tailwind 工具类、系统原生导航、乱码标题

目标：统一为 **Material Design 3 深蓝方案**，建立完整 Design Token 体系，修复所有乱码。

---

## 2. 设计决策汇总

| 维度 | 决策 |
|------|------|
| 设计规范 | Material Design 3 |
| 主色（Primary）| #1976D2（Blue 700）|
| 顶栏风格 | 白底 + 主色文字（MD3 Top App Bar）|
| 卡片系统 | MD3 三种卡片：Filled / Elevated / Outlined |
| 底部导航 | MD3 Navigation Bar（pill indicator 选中态）|
| 字体 | 系统默认字体（不引入 Roboto，避免中文渲染问题）|
| 背景色 | #F3F6FD（Surface Variant）|
| 单位 | px（H5/Electron 目标，rpx 仅保留必要间距）|

---

## 3. MD3 Color Token 系统

以下色值写入 `src/styles/var.css` 作为 CSS 自定义属性：

### 3.1 Primary 色组
```css
--md-primary: #1976D2;          /* 主色：按钮、激活态、重要文字 */
--md-on-primary: #FFFFFF;       /* 主色上的文字/图标 */
--md-primary-container: #D1E4FF; /* 主色容器：Filled Card 背景 */
--md-on-primary-container: #001D36; /* 容器内文字 */
```

### 3.2 Secondary 色组（系统自动推导）
```css
--md-secondary: #535F70;
--md-on-secondary: #FFFFFF;
--md-secondary-container: #D7E3F7;
--md-on-secondary-container: #101C2B;
```

### 3.3 Surface / Background
```css
--md-background: #F3F6FD;       /* 页面背景 */
--md-surface: #FFFFFF;          /* 卡片白底 */
--md-surface-variant: #DFE2EB;  /* 分割线、输入框背景 */
--md-on-surface: #1A1C1E;       /* 主要文字 */
--md-on-surface-variant: #43474E; /* 次要文字、标签 */
--md-outline: #73777F;          /* 边框 */
--md-outline-variant: #C3C7CF;  /* 浅色分割线 */
```

### 3.4 语义色
```css
--md-error: #B3261E;
--md-on-error: #FFFFFF;
--md-error-container: #F9DEDC;

/* 业务状态色（非 MD3 标准，项目专用）*/
--status-running: #1976D2;      /* 运行中 */
--status-stopped: #535F70;      /* 已停止 */
--status-expired: #B3261E;      /* 已到期 */
--status-warning: #F59E0B;      /* 即将到期 */
```

### 3.5 海拔阴影
```css
--md-elevation-1: 0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.08); /* Elevated Card */
--md-elevation-2: 0 2px 6px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.08);
--md-elevation-3: 0 4px 12px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08);
```

---

## 4. 排版系统

MD3 Type Scale 映射（均使用 `px`，不使用 `rpx`）：

| Token | 大小 | 字重 | 用途 |
|-------|------|------|------|
| `--md-display-small` | 36px / 44px | 400 | 大数字展示 |
| `--md-headline-large` | 32px / 40px | 400 | 页面主标题 |
| `--md-headline-medium` | 28px / 36px | 400 | 卡片主标题 |
| `--md-headline-small` | 24px / 32px | 400 | 区块标题 |
| `--md-title-large` | 22px / 28px | 400 | 对话框标题 |
| `--md-title-medium` | 16px / 24px | 500 | 列表项标题、导航文字 |
| `--md-title-small` | 14px / 20px | 500 | 标签页标题 |
| `--md-body-large` | 16px / 24px | 400 | 正文 |
| `--md-body-medium` | 14px / 20px | 400 | 辅助文字 |
| `--md-body-small` | 12px / 16px | 400 | 说明文字、时间戳 |
| `--md-label-large` | 14px / 20px | 500 | 按钮文字 |
| `--md-label-medium` | 12px / 16px | 500 | 芯片文字、标签 |
| `--md-label-small` | 11px / 16px | 500 | 底部导航标签 |

---

## 5. 组件规范

### 5.1 Top App Bar
- 背景：`--md-surface`（#FFFFFF）
- 标题：`--md-primary`，font-size 20px，font-weight 500
- 底部边框：1px solid `--md-outline-variant`
- 高度：56px
- 图标区域：40×40px 圆形，点击态 `--md-primary-container`
- **所有使用 `navigationStyle: custom` 的页面**应统一使用 `<w-nav-bar>` 组件

### 5.2 Navigation Bar（底部导航）
- 背景：`--md-surface`
- 顶部边框：1px solid `--md-outline-variant`
- 高度：72px（含安全区域）
- 每项：64×32px pill，选中态背景 `--md-primary-container`
- 选中文字：`--md-primary`，font-weight 700
- 未选中文字：`--md-on-surface-variant`
- 图标区域：pill 内 16px 图标（使用 uni-icon 或 SVG）

### 5.3 卡片系统

**Filled Card（高信息密度，如状态汇总）**
- 背景：`--md-primary-container`（#D1E4FF）
- 圆角：12px
- 无阴影
- 内边距：16px

**Elevated Card（通用内容卡片）**
- 背景：`--md-surface`
- 圆角：12px
- 阴影：`--md-elevation-1`
- 内边距：16px

**Outlined Card（列表项、表单区块）**
- 背景：`--md-surface`
- 圆角：12px
- 边框：1px solid `--md-outline-variant`
- 无阴影
- 内边距：16px

### 5.4 按钮

**Filled Button（主要操作）**
- 背景：`--md-primary`，文字：`--md-on-primary`
- 圆角：20px（全圆角 pill）
- 高度：40px，padding：0 24px
- 字号：14px / 500

**Outlined Button（次要操作）**
- 背景：透明，边框：`--md-outline`，文字：`--md-primary`
- 其余同上

**Text Button（轻量操作，如"查看全部"）**
- 无背景无边框，文字：`--md-primary`

### 5.5 输入框（TextField）
- 下划线风格（Filled）：背景 `--md-surface-variant`，圆角 4px 4px 0 0，底部激活线 `--md-primary`
- 高度：56px
- Label 浮动动画

### 5.6 状态芯片（Chip）
- 运行中：背景 `rgba(25,118,210,.12)`，文字 `--md-primary`
- 已停止：背景 `rgba(83,95,112,.12)`，文字 `--md-secondary`
- 已到期：背景 `rgba(179,38,30,.12)`，文字 `--md-error`
- 圆角：20px，padding：4px 12px，font-size 12px

---

## 6. 乱码修复清单

`src/pages.json` 中所有 `navigationBarTitleText` 的 GBK 乱码需修复为正确 UTF-8：

| 当前乱码 | 正确标题 |
|---------|---------|
| `鐧诲綍` | 登录 |
| `娉ㄥ唽` | 注册 |
| `蹇樿瀵嗙爜` | 忘记密码 |
| `鑱旂郴瀹㈡湇` | 联系客服 |
| `璇︽儏` | 详情 |
| `涓汉璁剧疆` | 个人设置 |
| `褰掑洜璁剧疆` | 归因设置 |
| `鎴戠殑鏀惰棌` | 我的收藏 |
| `鍏充簬鎴戜滑` | 关于我们 |
| `鍗忚` | 协议 |
| `淇敼瀵嗙爜` | 修改密码 |
| `涓汉璧勬枡` | 个人资料 |
| `鎼滅储` | 搜索 |
| `缁戝畾鎵嬫満鍙?` | 绑定手机号 |
| `鏀粯缁撴灉` | 支付结果 |
| `澶村儚瑁佸壀` | 头像裁剪 |
| `鎴戠殑閽卞寘` | 我的钱包 |
| `鍏呭€?` | 充值 |
| `鍏呭€艰褰?` | 充值记录 |
| `鍟嗗煄`（globalStyle）| 天翼云电脑 |

同时将 `globalStyle.navigationBarTitleText` 从"商城"改为"天翼云电脑"（品牌名）。

---

## 7. 页面分组与迁移策略

### 第一组：底部导航 4 个主页面（优先级最高）
已有 custom nav，改为 MD3 风格：

| 页面 | 标题 | 主要变化 |
|------|------|---------|
| `pages/desktop/home` | 工作台 | Filled Card 统计 + Elevated Card 列表 + MD3 Navigation Bar |
| `pages/cloud/resources` | 云资源 | 列表项改为 Outlined Card，状态芯片 |
| `pages/news/news` | 资讯 | 卡片 + 缩略图布局 |
| `pages/user/user` | 我的 | 头像区 + 菜单列表 Outlined Card |

### 第二组：云资源子页面（6 页）
| 页面 | 标题 | 主要变化 |
|------|------|---------|
| `pages/cloud/detail` | 云电脑详情 | Top App Bar + Elevated Card 信息区 + Filled Button 操作 |
| `pages/cloud/orders` | 我的订单 | 列表 Outlined Card |
| `pages/cloud/order-detail` | 订单详情 | 信息表格 Outlined Card |
| `pages/cloud/purchase` | 购买云电脑 | 表单 + 价格 Filled Card |
| `pages/cloud/renew` | 续费 | 同购买风格 |
| `pages/cloud/rename` | 重命名 | TextField 输入框 |
| `pages/cloud/notifications` | 通知 | 列表 |

### 第三组：账号相关（8 页，原旧风格）
| 页面 | 标题 | 主要变化 |
|------|------|---------|
| `pages/login/login` | 登录 | MD3 TextField + Filled Button + Top App Bar |
| `pages/register/register` | 注册 | 同登录 |
| `pages/forget_pwd/forget_pwd` | 忘记密码 | 步骤式表单 |
| `pages/change_password/change_password` | 修改密码 | TextField x2 |
| `pages/user_data/user_data` | 个人资料 | 头像 + 表单 Outlined Card |
| `pages/user_set/user_set` | 个人设置 | 菜单列表 |
| `pages/bind_mobile/bind_mobile` | 绑定手机号 | TextField + 验证码 |
| `pages/customer_service/customer_service` | 联系客服 | 简单信息页 |

### 第四组：钱包与支付（4 页，原旧风格）
| 页面 | 标题 | 主要变化 |
|------|------|---------|
| `packages/pages/user_wallet/user_wallet` | 我的钱包 | 余额 Filled Card + 记录列表 |
| `packages/pages/recharge/recharge` | 充值 | 金额选择芯片 + 支付按钮 |
| `packages/pages/recharge_record/recharge_record` | 充值记录 | 时间线列表 |
| `pages/payment_result/payment_result` | 支付结果 | 成功/失败状态页 |

### 第五组：内容与辅助页面（7 页）
| 页面 | 标题 | 主要变化 |
|------|------|---------|
| `pages/agreement/agreement` | 协议 | 纯文本，Top App Bar |
| `pages/as_us/as_us` | 关于我们 | 品牌页 |
| `pages/news_detail/news_detail` | 资讯详情 | WebView 容器 |
| `packages/pages/404/404` | 404 | 空状态页 |
| `pages/search/search` | 搜索 | 搜索框 + 结果列表 |
| `pages/collection/collection` | 我的收藏 | 列表 Outlined Card |
| `pages/attribution/attribution` | 归因设置 | 表单设置页 |

---

## 8. 共享组件清单

需创建或升级以下共享组件（`src/components/`）：

| 组件 | 路径 | 说明 |
|------|------|------|
| `w-nav-bar` | `components/widgets/nav-bar/nav-bar.vue` | MD3 Top App Bar，已存在，需改造 |
| `w-tab-bar` | `components/widgets/tab-bar/tab-bar.vue` | MD3 Navigation Bar，需新建 |
| `w-card` | `components/widgets/card/card.vue` | 统一卡片容器，type: filled/elevated/outlined |
| `w-button` | `components/widgets/button/button.vue` | MD3 按钮，variant: filled/outlined/text |
| `w-chip` | `components/widgets/chip/chip.vue` | 状态芯片 |
| `w-text-field` | `components/widgets/text-field/text-field.vue` | MD3 输入框 |

---

## 9. Design Token 文件结构

```
src/styles/
├── var.css          # 所有 CSS 自定义属性（颜色、间距、圆角、阴影）
├── typography.css   # 排版 class（.md-title-large 等）
└── reset.css        # 保持不变
```

`var.css` 将被 `App.vue` 中 `@import` 引入，全局生效。

---

## 10. 实施顺序

1. **修复乱码** — `pages.json` 所有 `navigationBarTitleText`（阻塞项，影响所有页面）
2. **建立 Design Token** — `src/styles/var.css` + `typography.css`
3. **升级共享组件** — `w-nav-bar`、新建 `w-tab-bar`、`w-card`、`w-button`、`w-chip`、`w-text-field`
4. **第一组主页面** — `desktop/home`、`cloud/resources`、`news/news`、`user/user`
5. **第二组云资源子页** — detail、orders、order-detail、purchase、renew、rename、notifications
6. **第三组账号页** — login、register、forget_pwd 等 8 页
7. **第四组钱包支付** — wallet、recharge、recharge_record、payment_result
8. **第五组内容辅助** — agreement、as_us、news_detail、404

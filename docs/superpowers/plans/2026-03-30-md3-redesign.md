# MD3 全页面重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将天翼云电脑桌面助手的全部功能页面统一为 Material Design 3 深蓝方案，修复 20 处乱码标题，建立完整 Design Token 体系。

**Architecture:** 先建立 CSS 自定义属性层（var.css / typography.css），再逐页用 CSS 变量替换硬编码值、将旧式 Tailwind 页面重写为 MD3 风格。Tab Bar 提取为共享组件 `w-tab-bar`；各页顶栏保持内联（统一 `.md3-nav` 类名）。

**Tech Stack:** UniApp Vue 3, SCSS, CSS Custom Properties, 原生 HTML/CSS（H5/Electron 目标）

---

## Phase 0 — 乱码修复（阻塞项）

### Task 1: 修复 pages.json 所有乱码标题

**Files:**
- Modify: `src/pages.json`

- [ ] **Step 1: 修复所有 navigationBarTitleText 乱码**

替换 `src/pages.json` 中以下所有值（完整替换，不只改部分）：

```json
// 第 38 行: "鐧诲綍" → "登录"
// 第 46 行: "娉ㄥ唽" → "注册"
// 第 54 行: "蹇樿瀵嗙爜" → "忘记密码"
// 第 63 行: "鑱旂郴瀹㈡湇" → "联系客服"
// 第 72 行: "璇︽儏" → "详情"
// 第 80 行: "涓汉璁剧疆" → "个人设置"
// 第 88 行: "褰掑洜璁剧疆" → "归因设置"
// 第 96 行: "鎴戠殑鏀惰棌" → "我的收藏"
// 第 106 行: "鍏充簬鎴戜滑" → "关于我们"
// 第 112 行: "鍗忚" → "协议"
// 第 118 行: "淇敼瀵嗙爜" → "修改密码"
// 第 127 行: "涓汉璧勬枡" → "个人资料"
// 第 136 行: "鎼滅储" → "搜索"
// 第 145 行: "缁戝畾鎵嬫満鍙?" → "绑定手机号"
// 第 229 行: "鏀粯缁撴灉" → "支付结果"
// 第 237 行: "澶村儚瑁佸壀" → "头像裁剪"
// 第 260 行: "鎴戠殑閽卞寘" → "我的钱包"
// 第 268 行: "鍏呭€?" → "充值"
// 第 278 行: "鍏呭€艰褰?" → "充值记录"
// 第 289 行 globalStyle: "鍟嗗煄" → "天翼云电脑"
```

最终相关行应为：

```json
{ "path": "pages/login/login", "style": { "navigationBarTitleText": "登录" }, "meta": { "white": true } },
{ "path": "pages/register/register", "style": { "navigationBarTitleText": "注册" }, "meta": { "white": true } },
{ "path": "pages/forget_pwd/forget_pwd", "style": { "navigationBarTitleText": "忘记密码" }, "meta": { "white": true } },
{ "path": "pages/customer_service/customer_service", "style": { "navigationBarTitleText": "联系客服" }, "meta": { "white": true } },
{ "path": "pages/news_detail/news_detail", "style": { "navigationBarTitleText": "详情" } },
{ "path": "pages/user_set/user_set", "style": { "navigationBarTitleText": "个人设置" }, "meta": { "auth": true } },
{ "path": "pages/attribution/attribution", "style": { "navigationBarTitleText": "归因设置" }, "meta": { "auth": true } },
{ "path": "pages/collection/collection", "style": { "navigationBarTitleText": "我的收藏" }, "meta": { "auth": true } },
{ "path": "pages/as_us/as_us", "style": { "navigationBarTitleText": "关于我们" } },
{ "path": "pages/agreement/agreement", "style": { "navigationBarTitleText": "协议" } },
{ "path": "pages/change_password/change_password", "style": { "navigationBarTitleText": "修改密码" }, "meta": { "auth": true } },
{ "path": "pages/user_data/user_data", "style": { "navigationBarTitleText": "个人资料" }, "meta": { "auth": true } },
{ "path": "pages/search/search", "style": { "navigationBarTitleText": "搜索" } },
{ "path": "pages/bind_mobile/bind_mobile", "style": { "navigationBarTitleText": "绑定手机号" } },
{ "path": "pages/payment_result/payment_result", "style": { "navigationBarTitleText": "支付结果" }, "meta": { "auth": true } },
{ "path": "uni_modules/vk-uview-ui/components/u-avatar-cropper/u-avatar-cropper", "style": { "navigationBarTitleText": "头像裁剪", "navigationBarBackgroundColor": "#000000" } },
```

子包：
```json
{ "path": "pages/user_wallet/user_wallet", "style": { "navigationBarTitleText": "我的钱包" }, "meta": { "auth": true } },
{ "path": "pages/recharge/recharge", "style": { "navigationBarTitleText": "充值" }, "meta": { "auth": true } },
{ "path": "pages/recharge_record/recharge_record", "style": { "navigationBarTitleText": "充值记录" }, "meta": { "auth": true } },
```

globalStyle：
```json
"globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "天翼云电脑",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F3F6FD"
}
```

注意：`backgroundColor` 同步改为 `#F3F6FD`（MD3 Surface 背景）。

- [ ] **Step 2: 验证 JSON 合法性**

```bash
cd src && node -e "JSON.parse(require('fs').readFileSync('pages.json','utf8')); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add src/pages.json
git commit -m "fix: repair 20 garbled navigationBarTitleText entries in pages.json"
```

---

## Phase 1 — Design Token 体系

### Task 2: 创建 src/styles/var.css

**Files:**
- Modify: `src/styles/var.css`（当前为空）

- [ ] **Step 1: 写入完整 CSS 变量**

```css
/* src/styles/var.css — MD3 Deep Blue Design Token */
:root {
  /* Primary */
  --md-primary: #1976D2;
  --md-on-primary: #FFFFFF;
  --md-primary-container: #D1E4FF;
  --md-on-primary-container: #001D36;

  /* Secondary */
  --md-secondary: #535F70;
  --md-on-secondary: #FFFFFF;
  --md-secondary-container: #D7E3F7;
  --md-on-secondary-container: #101C2B;

  /* Surface */
  --md-background: #F3F6FD;
  --md-surface: #FFFFFF;
  --md-surface-variant: #DFE2EB;
  --md-on-surface: #1A1C1E;
  --md-on-surface-variant: #43474E;
  --md-outline: #73777F;
  --md-outline-variant: #C3C7CF;

  /* Error */
  --md-error: #B3261E;
  --md-on-error: #FFFFFF;
  --md-error-container: #F9DEDC;

  /* Business status */
  --status-running-bg: rgba(25, 118, 210, 0.12);
  --status-running-fg: #1976D2;
  --status-stopped-bg: rgba(83, 95, 112, 0.12);
  --status-stopped-fg: #535F70;
  --status-expired-bg: rgba(179, 38, 30, 0.12);
  --status-expired-fg: #B3261E;
  --status-warning-bg: rgba(245, 158, 11, 0.12);
  --status-warning-fg: #B45309;

  /* Elevation */
  --md-elevation-1: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  --md-elevation-2: 0 2px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
  --md-elevation-3: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);

  /* Radius */
  --md-radius-xs: 4px;
  --md-radius-sm: 8px;
  --md-radius-md: 12px;
  --md-radius-lg: 16px;
  --md-radius-xl: 20px;
  --md-radius-full: 9999px;

  /* Spacing */
  --md-space-xs: 4px;
  --md-space-sm: 8px;
  --md-space-md: 12px;
  --md-space-lg: 16px;
  --md-space-xl: 24px;
  --md-space-2xl: 32px;
}
```

- [ ] **Step 2: 创建 src/styles/typography.css**

```css
/* src/styles/typography.css — MD3 Type Scale */
.md-display-small  { font-size: 36px; line-height: 44px; font-weight: 400; }
.md-headline-large { font-size: 32px; line-height: 40px; font-weight: 400; }
.md-headline-medium{ font-size: 28px; line-height: 36px; font-weight: 400; }
.md-headline-small { font-size: 24px; line-height: 32px; font-weight: 400; }
.md-title-large    { font-size: 22px; line-height: 28px; font-weight: 400; }
.md-title-medium   { font-size: 16px; line-height: 24px; font-weight: 500; }
.md-title-small    { font-size: 14px; line-height: 20px; font-weight: 500; }
.md-body-large     { font-size: 16px; line-height: 24px; font-weight: 400; }
.md-body-medium    { font-size: 14px; line-height: 20px; font-weight: 400; }
.md-body-small     { font-size: 12px; line-height: 16px; font-weight: 400; }
.md-label-large    { font-size: 14px; line-height: 20px; font-weight: 500; }
.md-label-medium   { font-size: 12px; line-height: 16px; font-weight: 500; }
.md-label-small    { font-size: 11px; line-height: 16px; font-weight: 500; }
```

- [ ] **Step 3: 在 App.vue 中引入两个样式文件**

在 `src/App.vue` 的 `<style>` 块中添加 import：

```vue
<style lang="scss">
@import './styles/var.css';
@import './styles/typography.css';
</style>
```

- [ ] **Step 4: 验证**

```bash
npm run dev:desktop:web
```

打开 http://localhost:5173，打开浏览器 DevTools，在 `:root` 样式中确认 `--md-primary: #1976D2` 存在。

- [ ] **Step 5: Commit**

```bash
git add src/styles/var.css src/styles/typography.css src/App.vue
git commit -m "feat: add MD3 design token system (var.css + typography.css)"
```

---

## Phase 2 — 共享组件

### Task 3: 创建 w-tab-bar（MD3 Navigation Bar）

**Files:**
- Create: `src/components/widgets/tab-bar/tab-bar.vue`

该组件被底部 4 个主标签页（home、resources、news、user）使用。

- [ ] **Step 1: 创建组件文件**

```vue
<!-- src/components/widgets/tab-bar/tab-bar.vue -->
<template>
    <view class="md3-tab-bar">
        <view
            v-for="item in tabs"
            :key="item.path"
            class="md3-tab-bar__item"
            :class="{ 'is-active': currentPath === item.path }"
            @click="navigate(item.path)"
        >
            <view class="md3-tab-bar__pill">
                <text class="md3-tab-bar__icon">{{ item.icon }}</text>
            </view>
            <text class="md3-tab-bar__label">{{ item.label }}</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { useRouter } from 'uniapp-router-next'

const props = defineProps<{
    currentPath: string
}>()

const router = useRouter()

const tabs = [
    { path: '/pages/desktop/home',      icon: '🏠', label: '工作台' },
    { path: '/pages/cloud/resources',   icon: '🖥',  label: '云资源' },
    { path: '/pages/news/news',         icon: '📰', label: '资讯' },
    { path: '/pages/user/user',         icon: '👤', label: '我的' },
]

const navigate = (path: string) => {
    if (path === props.currentPath) return
    router.switchTab ? router.switchTab(path) : router.reLaunch(path)
}
</script>

<style lang="scss">
.md3-tab-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: var(--md-surface);
    border-top: 1px solid var(--md-outline-variant);
    padding: 8px 0 12px;
    height: 60px;
    box-sizing: content-box;
}

.md3-tab-bar__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
}

.md3-tab-bar__pill {
    width: 64px;
    height: 28px;
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}

.md3-tab-bar__icon {
    font-size: 16px;
}

.md3-tab-bar__label {
    font-size: 11px;
    font-weight: 500;
    color: var(--md-on-surface-variant);
    line-height: 1;
}

.md3-tab-bar__item.is-active {
    .md3-tab-bar__pill {
        background: var(--md-primary-container);
    }
    .md3-tab-bar__label {
        color: var(--md-primary);
        font-weight: 700;
    }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/widgets/tab-bar/tab-bar.vue
git commit -m "feat: add w-tab-bar MD3 Navigation Bar component"
```

---

### Task 4: 创建 MD3 通用样式类（_md3-common.scss）

这些 SCSS 混入/类将被各页面 `@use` 使用，避免在每个 `.vue` 文件重复相同 CSS。

**Files:**
- Create: `src/styles/_md3-common.scss`

- [ ] **Step 1: 创建文件**

```scss
// src/styles/_md3-common.scss
// 在各页面 <style lang="scss"> 中 @use '@/styles/md3-common' as *; 使用

// MD3 页面容器
%md3-page {
    min-height: 100%;
    background: var(--md-background);
    display: flex;
    flex-direction: column;
}

// MD3 Top App Bar（56px 高，白底，主色标题）
%md3-nav {
    height: 56px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
    flex-shrink: 0;
    box-sizing: border-box;
}

// MD3 Elevated Card（白底 + 阴影）
%md3-card-elevated {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-lg);
}

// MD3 Filled Card（Primary Container 背景）
%md3-card-filled {
    background: var(--md-primary-container);
    border-radius: var(--md-radius-md);
    padding: var(--md-space-lg);
}

// MD3 Outlined Card
%md3-card-outlined {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    border: 1px solid var(--md-outline-variant);
    padding: var(--md-space-lg);
}

// MD3 Filled Button
%md3-btn-filled {
    height: 40px;
    padding: 0 24px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
}

// MD3 Outlined Button
%md3-btn-outlined {
    @extend %md3-btn-filled;
    background: transparent;
    color: var(--md-primary);
    border: 1px solid var(--md-outline);
}

// 状态芯片
%md3-chip-base {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: var(--md-radius-full);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/_md3-common.scss
git commit -m "feat: add MD3 shared SCSS placeholder classes"
```

---

## Phase 3 — 底部导航 4 个主页面

### Task 5: 重写 desktop/home.vue 顶栏和底栏样式

**Files:**
- Modify: `src/pages/desktop/home.vue`

desktop/home 是最复杂的页面，包含大量 UI。仅修改：①顶部渐变栏 → MD3 Top App Bar；②如有底部 tab bar，替换为 `<w-tab-bar>`。

- [ ] **Step 1: 找到顶栏样式并替换**

在 `home.vue` 的 `<style>` 中找到控制顶栏背景的样式（通常是含 `background: linear-gradient` 的 `.home-header` 或 `.desktop-header`），替换为：

```scss
.home-header {
    height: 56px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
    flex-shrink: 0;

    .home-header__title {
        font-size: 20px;
        font-weight: 500;
        color: var(--md-primary);
        flex: 1;
    }

    .home-header__action {
        width: 40px;
        height: 40px;
        border-radius: var(--md-radius-full);
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;

        &:active {
            background: var(--md-primary-container);
        }
    }
}
```

- [ ] **Step 2: 替换卡片阴影色值**

在 home.vue `<style>` 中，将所有：
- `box-shadow: 0 4px 16px rgba(15,23,42,.06)` → `box-shadow: var(--md-elevation-1)`
- `border-radius: 16px` on cards → `border-radius: var(--md-radius-md)`
- `background: #f4f7fb` (page bg) → `background: var(--md-background)`
- `background: #fff` on cards → `background: var(--md-surface)`

- [ ] **Step 3: 替换状态 badge 色值**

将硬编码状态色替换：
- 运行中: `background: #eff6ff; color: #2563eb` → `background: var(--status-running-bg); color: var(--status-running-fg)`
- 已停止: → `background: var(--status-stopped-bg); color: var(--status-stopped-fg)`
- 已到期: → `background: var(--status-expired-bg); color: var(--status-expired-fg)`
- 即将到期: → `background: var(--status-warning-bg); color: var(--status-warning-fg)`

- [ ] **Step 4: 替换底部 tab bar**

如果 home.vue 模板底部有手写的 tab bar HTML（4个 tab 按钮），将其整个替换为：

```html
<w-tab-bar current-path="/pages/desktop/home" />
```

如果没有手写 tab bar，跳过此步。

- [ ] **Step 5: 验证**

```bash
npm run dev:desktop:web
```

打开 http://localhost:5173，导航到工作台页，确认：顶栏白底蓝字、卡片阴影轻、底部导航 pill 样式。

- [ ] **Step 6: Commit**

```bash
git add src/pages/desktop/home.vue
git commit -m "style: apply MD3 tokens to desktop/home.vue"
```

---

### Task 6: 重写 cloud/resources.vue 样式

**Files:**
- Modify: `src/pages/cloud/resources.vue`

当前 resources.vue 有自定义 `.nav` 顶栏和 `.resource-card` 列表，需迁移到 MD3 tokens。

- [ ] **Step 1: 替换顶栏样式**

找到 `.nav` 样式块（当前约为白底 + 小箭头），替换为：

```scss
.nav {
    height: 56px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;

    &__back {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: var(--md-on-surface);
        border-radius: var(--md-radius-full);
        cursor: pointer;
        &:active { background: var(--md-surface-variant); }
    }

    &__title {
        font-size: 20px;
        font-weight: 500;
        color: var(--md-primary);
        flex: 1;
    }
}
```

- [ ] **Step 2: 替换 resource-card 样式**

找到 `.resource-card` 样式，替换为：

```scss
.resource-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    border: 1px solid var(--md-outline-variant);
    padding: var(--md-space-lg);
    margin-bottom: var(--md-space-md);
    cursor: pointer;
    transition: box-shadow 0.15s;

    &:active {
        box-shadow: var(--md-elevation-1);
    }

    &__name {
        font-size: 16px;
        font-weight: 500;
        color: var(--md-on-surface);
    }

    &__ids {
        margin-top: 4px;
        font-size: 12px;
        color: var(--md-on-surface-variant);
        display: flex;
        gap: 12px;
    }

    &__spec-main {
        font-size: 14px;
        color: var(--md-on-surface);
        margin-top: 8px;
    }

    &__spec-sub {
        font-size: 12px;
        color: var(--md-on-surface-variant);
        margin-top: 2px;
    }

    &__foot {
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--md-on-surface-variant);
    }

    &__foot-text.is-expired {
        color: var(--md-error);
    }
}
```

- [ ] **Step 3: 替换 status-pill**

找到 `.status-pill` 样式，替换为：

```scss
.status-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: var(--md-radius-full);
    font-size: 11px;
    font-weight: 500;

    &--running  { background: var(--status-running-bg);  color: var(--status-running-fg); }
    &--stopped  { background: var(--status-stopped-bg);  color: var(--status-stopped-fg); }
    &--expired  { background: var(--status-expired-bg);  color: var(--status-expired-fg); }
    &--expiring { background: var(--status-warning-bg);  color: var(--status-warning-fg); }
}
```

- [ ] **Step 4: 替换页面背景和芯片过滤栏**

```scss
.page {
    min-height: 100%;
    background: var(--md-background);
    display: flex;
    flex-direction: column;
}

.body {
    flex: 1;
    padding: var(--md-space-lg);
    overflow-y: auto;
}

.chips {
    display: flex;
    gap: var(--md-space-sm);
    margin-bottom: var(--md-space-md);
    flex-wrap: wrap;
}

.chips__item {
    padding: 6px 16px;
    border-radius: var(--md-radius-full);
    font-size: 13px;
    font-weight: 500;
    background: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    color: var(--md-on-surface-variant);
    cursor: pointer;

    &.is-active {
        background: var(--md-primary-container);
        border-color: transparent;
        color: var(--md-on-primary-container);
    }
}
```

- [ ] **Step 5: 验证 + Commit**

```bash
npm run dev:desktop:web
# 导航到云资源页，确认卡片边框、状态芯片颜色
git add src/pages/cloud/resources.vue
git commit -m "style: apply MD3 tokens to cloud/resources.vue"
```

---

### Task 7: 重写 news/news.vue 样式

**Files:**
- Modify: `src/pages/news/news.vue`

- [ ] **Step 1: 读取当前文件结构**

先读取文件了解顶栏和列表卡片的 class 名，再替换样式。以下 SCSS 覆盖规则适用于任意命名结构：

```scss
// 顶栏
.news-header, .page-header, .nav {
    height: 56px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    padding: 0 16px;
}

// 顶栏标题
.news-header__title, .nav__title, .page-header__title {
    font-size: 20px;
    font-weight: 500;
    color: var(--md-primary);
    flex: 1;
}

// 页面背景
page, .news-page {
    background: var(--md-background) !important;
}

// 新闻卡片
.news-item, .news-card, .article-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    border: 1px solid var(--md-outline-variant);
    margin-bottom: var(--md-space-md);
    overflow: hidden;
}

.news-item__title, .article-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--md-on-surface);
    line-height: 1.5;
}

.news-item__meta, .article-meta {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-top: 4px;
}
```

读取文件后，仅替换有实际匹配的样式块，跳过不存在的 class。

- [ ] **Step 2: 添加 Tab Bar（若无底部 tab）**

在 template 底部（`</view>` 前）插入：

```html
<w-tab-bar current-path="/pages/news/news" />
```

若已有手写 tab bar HTML，替换为上面这一行。

- [ ] **Step 3: Commit**

```bash
git add src/pages/news/news.vue
git commit -m "style: apply MD3 tokens to news/news.vue"
```

---

### Task 8: 重写 user/user.vue 样式

**Files:**
- Modify: `src/pages/user/user.vue`

- [ ] **Step 1: 读取文件，确认结构**

找到顶栏（用户信息区）和菜单列表区的 class 名。

- [ ] **Step 2: 替换用户信息区样式**

将头部用户区（渐变背景或蓝色背景）改为 Filled Card 风格：

```scss
// 用户信息卡（顶部蓝色区域）
.user-banner, .user-header, .profile-header {
    background: var(--md-primary-container);
    border-radius: 0 0 var(--md-radius-lg) var(--md-radius-lg);
    padding: 24px 20px;
}

// 用户名
.user-banner__name, .profile-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--md-on-primary-container);
}

// 用户 ID / 账号
.user-banner__account, .profile-account {
    font-size: 13px;
    color: var(--md-secondary);
    margin-top: 4px;
}
```

- [ ] **Step 3: 替换菜单列表样式**

```scss
// 菜单组卡片
.menu-group, .menu-card, .user-menu {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    overflow: hidden;
    margin: var(--md-space-md) var(--md-space-lg);
}

// 单行菜单
.menu-item {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--md-outline-variant);
    font-size: 15px;
    color: var(--md-on-surface);
    cursor: pointer;

    &:last-child { border-bottom: none; }
    &:active { background: var(--md-surface-variant); }

    .menu-item__label { flex: 1; }
    .menu-item__value { font-size: 13px; color: var(--md-on-surface-variant); margin-right: 8px; }
    .menu-item__arrow { color: var(--md-on-surface-variant); font-size: 14px; }
}
```

- [ ] **Step 4: 替换页面背景**

```scss
page, .user-page { background: var(--md-background) !important; }
```

- [ ] **Step 5: 添加 Tab Bar**

在 template 底部（`</view>` 关闭整个页面容器前）插入：

```html
<w-tab-bar current-path="/pages/user/user" />
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/user/user.vue
git commit -m "style: apply MD3 tokens to user/user.vue"
```

---

## Phase 4 — 云资源子页面（7 页）

### Task 9: cloud/detail.vue

**Files:**
- Modify: `src/pages/cloud/detail.vue`

- [ ] **Step 1: 顶栏统一**

找到 `.nav` 或自定义顶栏样式，替换为：

```scss
.nav {
    height: 56px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
    flex-shrink: 0;

    .nav__back {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: var(--md-on-surface);
        border-radius: var(--md-radius-full);
        cursor: pointer;
        &:active { background: var(--md-surface-variant); }
    }

    .nav__title {
        font-size: 20px;
        font-weight: 500;
        color: var(--md-primary);
        flex: 1;
    }
}
```

- [ ] **Step 2: 信息卡片 → Elevated Card**

```scss
.detail-card, .info-card, .spec-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-lg);
    margin-bottom: var(--md-space-md);
}
```

- [ ] **Step 3: 操作按钮 → MD3 Filled/Outlined**

找到主操作按钮（开机/关机/重启）样式，替换为：

```scss
.action-btn--primary {
    height: 40px;
    padding: 0 20px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 14px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:disabled { opacity: 0.38; }
    &:active:not(:disabled) { opacity: 0.88; }
}

.action-btn--secondary {
    @extend .action-btn--primary;
    background: transparent;
    color: var(--md-primary);
    border: 1px solid var(--md-outline);
}
```

- [ ] **Step 4: 页面背景 + 状态芯片**

```scss
.page, page { background: var(--md-background) !important; }

.status-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: var(--md-radius-full);
    font-size: 12px;
    font-weight: 500;

    &--running  { background: var(--status-running-bg);  color: var(--status-running-fg); }
    &--stopped  { background: var(--status-stopped-bg);  color: var(--status-stopped-fg); }
    &--expired  { background: var(--status-expired-bg);  color: var(--status-expired-fg); }
    &--expiring { background: var(--status-warning-bg);  color: var(--status-warning-fg); }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/cloud/detail.vue
git commit -m "style: apply MD3 tokens to cloud/detail.vue"
```

---

### Task 10: cloud/orders.vue + cloud/order-detail.vue

**Files:**
- Modify: `src/pages/cloud/orders.vue`
- Modify: `src/pages/cloud/order-detail.vue`

- [ ] **Step 1: orders.vue — 顶栏**

同 Task 9 Step 1，找到顶栏样式替换为 MD3 Top App Bar（height:56px, white bg, primary title）。

- [ ] **Step 2: orders.vue — 订单卡片**

```scss
.order-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    border: 1px solid var(--md-outline-variant);
    padding: var(--md-space-lg);
    margin-bottom: var(--md-space-md);
    cursor: pointer;
    &:active { box-shadow: var(--md-elevation-1); }
}

.order-card__id {
    font-size: 13px;
    color: var(--md-on-surface-variant);
    margin-bottom: 4px;
}

.order-card__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--md-on-surface);
}

.order-card__amount {
    font-size: 16px;
    font-weight: 600;
    color: var(--md-primary);
}

.order-card__status {
    display: inline-flex;
    padding: 3px 10px;
    border-radius: var(--md-radius-full);
    font-size: 11px;
    font-weight: 500;
    background: var(--md-secondary-container);
    color: var(--md-on-secondary-container);
}
```

- [ ] **Step 3: order-detail.vue — 顶栏 + 信息表格**

```scss
// 顶栏同 Task 9 Step 1

// 详情信息表格
.detail-section {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-lg);
    margin-bottom: var(--md-space-md);
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--md-outline-variant);
    font-size: 14px;

    &:last-child { border-bottom: none; }
}

.detail-row__label { color: var(--md-on-surface-variant); }
.detail-row__value { color: var(--md-on-surface); font-weight: 500; }
```

- [ ] **Step 4: page 背景**

在两个文件的 `<style>` 中均添加：

```scss
page, .page { background: var(--md-background) !important; }
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/cloud/orders.vue src/pages/cloud/order-detail.vue
git commit -m "style: apply MD3 tokens to cloud orders pages"
```

---

### Task 11: cloud/purchase.vue + cloud/renew.vue

**Files:**
- Modify: `src/pages/cloud/purchase.vue`
- Modify: `src/pages/cloud/renew.vue`

- [ ] **Step 1: 顶栏（两文件相同）**

同 Task 9 Step 1（56px 高，白底，主色标题）。

- [ ] **Step 2: 价格展示区 → Filled Card**

```scss
.price-card, .summary-card {
    background: var(--md-primary-container);
    border-radius: var(--md-radius-md);
    padding: var(--md-space-lg);
    margin-bottom: var(--md-space-md);
}

.price-card__label {
    font-size: 13px;
    color: var(--md-on-primary-container);
    opacity: 0.72;
}

.price-card__amount {
    font-size: 28px;
    font-weight: 700;
    color: var(--md-on-primary-container);
    margin-top: 4px;
}
```

- [ ] **Step 3: 选项卡片 → Outlined Card，选中态 Filled**

```scss
.option-card {
    background: var(--md-surface);
    border: 1.5px solid var(--md-outline-variant);
    border-radius: var(--md-radius-md);
    padding: 12px var(--md-space-lg);
    margin-bottom: var(--md-space-sm);
    cursor: pointer;
    transition: all 0.15s;

    &.is-selected {
        border-color: var(--md-primary);
        background: var(--md-primary-container);
    }
}

.option-card__name {
    font-size: 15px;
    font-weight: 500;
    color: var(--md-on-surface);
}

.option-card__price {
    font-size: 13px;
    color: var(--md-primary);
    margin-top: 2px;
}
```

- [ ] **Step 4: 提交按钮**

找到底部 Confirm / 立即购买 按钮，设置为：

```scss
.confirm-btn {
    height: 48px;
    width: 100%;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled { opacity: 0.38; }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/cloud/purchase.vue src/pages/cloud/renew.vue
git commit -m "style: apply MD3 tokens to cloud/purchase and renew pages"
```

---

### Task 12: cloud/rename.vue + cloud/notifications.vue

**Files:**
- Modify: `src/pages/cloud/rename.vue`
- Modify: `src/pages/cloud/notifications.vue`

- [ ] **Step 1: 两文件顶栏**

同 Task 9 Step 1。

- [ ] **Step 2: rename.vue — 输入框样式**

```scss
.rename-input-wrap {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-lg);
    margin: var(--md-space-lg);
}

.rename-input {
    width: 100%;
    height: 56px;
    padding: 0 16px;
    border-radius: var(--md-radius-xs) var(--md-radius-xs) 0 0;
    background: var(--md-surface-variant);
    border: none;
    border-bottom: 2px solid var(--md-outline);
    font-size: 16px;
    color: var(--md-on-surface);
    box-sizing: border-box;

    &:focus {
        border-bottom-color: var(--md-primary);
        outline: none;
    }
}
```

- [ ] **Step 3: notifications.vue — 通知列表**

```scss
.notification-item {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    border: 1px solid var(--md-outline-variant);
    padding: var(--md-space-lg);
    margin-bottom: var(--md-space-md);
}

.notification-item__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--md-on-surface);
}

.notification-item__time {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-top: 4px;
}

.notification-item__body {
    font-size: 14px;
    color: var(--md-on-surface);
    margin-top: 8px;
    line-height: 1.5;
}
```

- [ ] **Step 4: page 背景 + Commit**

```scss
page, .page { background: var(--md-background) !important; }
```

```bash
git add src/pages/cloud/rename.vue src/pages/cloud/notifications.vue
git commit -m "style: apply MD3 tokens to rename and notifications pages"
```

---

## Phase 5 — 账号相关页面（旧 Tailwind 风格重写）

以下页面使用 Tailwind 工具类，需要重写 template + style。逻辑层（`<script setup>`）**保持不变**，仅改 template 结构和 style。

### Task 13: register/register.vue

**Files:**
- Modify: `src/pages/register/register.vue`

- [ ] **Step 1: 替换 template**

将 `<template>` 内容替换为：

```html
<template>
    <view class="reg-page">
        <view class="reg-nav">
            <view class="reg-nav__back" @click="$router.navigateBack()">‹</view>
            <text class="reg-nav__title">注册账号</text>
        </view>

        <view class="reg-body">
            <view class="reg-card">
                <view class="reg-field">
                    <u-input
                        v-model="formData.account"
                        :border="false"
                        placeholder="请输入账号"
                        class="reg-field__input"
                    />
                </view>

                <view class="reg-field reg-field--mt">
                    <u-input
                        type="password"
                        v-model="formData.password"
                        placeholder="请输入密码"
                        :border="false"
                        class="reg-field__input"
                    />
                </view>

                <view class="reg-field reg-field--mt">
                    <u-input
                        type="password"
                        v-model="formData.password_confirm"
                        placeholder="请再次输入密码"
                        :border="false"
                        class="reg-field__input"
                    />
                </view>

                <view v-if="isOpenAgreement" class="reg-agreement">
                    <u-checkbox v-model="isCheckAgreement" shape="circle">
                        <view class="reg-agreement__text">
                            已阅读并同意
                            <view @click.stop>
                                <router-navigate class="reg-link" hover-class="none" to="/pages/agreement/agreement?type=service">《服务协议》</router-navigate>
                            </view>
                            和
                            <view @click.stop>
                                <router-navigate class="reg-link" hover-class="none" to="/pages/agreement/agreement?type=privacy">《隐私协议》</router-navigate>
                            </view>
                        </view>
                    </u-checkbox>
                </view>

                <view class="reg-actions">
                    <view
                        class="reg-btn"
                        :class="{ 'reg-btn--disabled': !canSubmit }"
                        @click="accountRegister"
                    >
                        注册
                    </view>
                    <view class="reg-footer-row">
                        <text class="reg-footer-text">已有账号？</text>
                        <router-navigate class="reg-link" to="/pages/login/login">去登录</router-navigate>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>
```

- [ ] **Step 2: 替换 `<style>` 块**

```scss
<style lang="scss">
page { background: var(--md-background); }

.reg-page {
    min-height: 100%;
    display: flex;
    flex-direction: column;
}

.reg-nav {
    height: 56px;
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;

    &__back {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: var(--md-on-surface);
        border-radius: var(--md-radius-full);
        cursor: pointer;
        &:active { background: var(--md-surface-variant); }
    }

    &__title {
        font-size: 20px;
        font-weight: 500;
        color: var(--md-primary);
        flex: 1;
    }
}

.reg-body {
    flex: 1;
    padding: var(--md-space-lg);
}

.reg-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--md-space-sm);
}

.reg-field {
    height: 50px;
    padding: 0 14px;
    border-radius: var(--md-radius-sm);
    display: flex;
    align-items: center;
    background: var(--md-surface-variant);
    border: 1px solid transparent;

    &:focus-within {
        border-color: var(--md-primary);
        background: rgba(25, 118, 210, 0.04);
    }

    &__input { flex: 1; }
    &--mt { margin-top: 4px; }
}

.reg-agreement {
    margin-top: 4px;

    &__text {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        font-size: 12px;
        color: var(--md-on-surface-variant);
    }
}

.reg-link {
    color: var(--md-primary);
    font-size: 12px;
    text-decoration: none;
}

.reg-actions {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: var(--md-space-md);
}

.reg-btn {
    height: 48px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &--disabled { opacity: 0.38; }
    &:not(&--disabled):active { opacity: 0.88; }
}

.reg-footer-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    font-size: 13px;
}

.reg-footer-text { color: var(--md-on-surface-variant); }
</style>
```

- [ ] **Step 3: 确认 script 中 `canSubmit` computed 存在**

读取 script 部分，找到控制按钮状态的 computed。如果原来是 `disableStyle`，在 template 中将 `reg-btn--disabled` 的条件改为 `!disableStyle`（或原变量名取反）。

- [ ] **Step 4: Commit**

```bash
git add src/pages/register/register.vue
git commit -m "style: rewrite register.vue with MD3 tokens (remove Tailwind)"
```

---

### Task 14: forget_pwd/forget_pwd.vue

**Files:**
- Modify: `src/pages/forget_pwd/forget_pwd.vue`

- [ ] **Step 1: 读取文件，确认步骤流程**

```bash
# 查看文件结构（不要运行，用 Read 工具读取）
```

- [ ] **Step 2: 替换 `<style>` 块（保持 template 不变，仅改样式）**

```scss
<style lang="scss">
page { background: var(--md-background); }

.forget-page {
    min-height: 100%;
    display: flex;
    flex-direction: column;
}

// 如无自定义顶栏，系统顶栏已在 pages.json 修复为正确标题，无需额外处理

.forget-body {
    flex: 1;
    padding: var(--md-space-lg);
}

.forget-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-lg);
}

.forget-field {
    background: var(--md-surface-variant);
    border-radius: var(--md-radius-sm);
    height: 50px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    margin-bottom: var(--md-space-md);

    &:focus-within {
        outline: 2px solid var(--md-primary);
        outline-offset: -1px;
        background: rgba(25, 118, 210, 0.04);
    }
}

.forget-btn {
    height: 48px;
    width: 100%;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-top: var(--md-space-lg);
    border: none;
}

// 如果 template 使用 Tailwind class (border-lightc, rounded-[10rpx] 等)
// 在 template 中找到对应 view 并替换 class 为 forget-field
</style>
```

- [ ] **Step 3: 若文件使用 Tailwind class，替换 template 中的输入框结构**

将每个输入框 `<view class="px-[18rpx] border border-solid border-lightc ...">` 替换为 `<view class="forget-field">`。

- [ ] **Step 4: Commit**

```bash
git add src/pages/forget_pwd/forget_pwd.vue
git commit -m "style: apply MD3 tokens to forget_pwd.vue (remove Tailwind)"
```

---

### Task 15: user_set/user_set.vue

**Files:**
- Modify: `src/pages/user_set/user_set.vue`

user_set 使用系统 navigationBar（已在 Task 1 修复标题），页面内容需要 MD3 化。

- [ ] **Step 1: 替换 `<style>` 块**

```scss
<style lang="scss">
page { background: var(--md-background); }

.user-set {
    min-height: 100%;
    padding: var(--md-space-lg) var(--md-space-lg) 0;
    display: flex;
    flex-direction: column;
    gap: var(--md-space-md);
}

.menu-section {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    overflow: hidden;
}

// 兼容原来的 .item class（保留不改 template）
.item {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--md-outline-variant);
    font-size: 15px;
    color: var(--md-on-surface);
    cursor: pointer;
    background: var(--md-surface);

    &:last-child { border-bottom: none; }
    &:active { background: var(--md-surface-variant); }
}

.btn-border {
    border-bottom: 1px solid var(--md-outline-variant);
}

.text-muted { color: var(--md-on-surface-variant); }
.text-content { color: var(--md-on-surface-variant); }

// 退出登录按钮区
.logout-area {
    padding: 0 var(--md-space-lg) var(--md-space-xl);
    margin-top: auto;
}
</style>
```

- [ ] **Step 2: 在 template 中将相邻的 `<navigator>/<view class="item">` 包裹进 `<view class="menu-section">`**

原结构（多个独立 .item）：
```html
<navigator url="..."><view class="item ...">...</view></navigator>
<view class="item ...">...</view>
```

改为：
```html
<view class="menu-section">
    <navigator url="..."><view class="item ...">...</view></navigator>
    <view class="item ...">...</view>
    <!-- ... -->
</view>
```

按逻辑分组：账号信息一组、设置选项一组、协议/关于一组、退出按钮单独。

- [ ] **Step 3: Commit**

```bash
git add src/pages/user_set/user_set.vue
git commit -m "style: apply MD3 tokens to user_set.vue (remove Tailwind)"
```

---

### Task 16: change_password.vue + user_data.vue

**Files:**
- Modify: `src/pages/change_password/change_password.vue`
- Modify: `src/pages/user_data/user_data.vue`

- [ ] **Step 1: 两文件均使用系统顶栏，只改 page body 样式**

对每个文件，在 `<style>` 中添加：

```scss
page { background: var(--md-background); }

// 主体卡片
.page-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-lg);
    margin: var(--md-space-lg);
}

// 输入项
.form-field {
    background: var(--md-surface-variant);
    border-radius: var(--md-radius-sm);
    height: 50px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    margin-bottom: var(--md-space-md);

    &:focus-within { outline: 2px solid var(--md-primary); outline-offset: -1px; }
}

// 替换 Tailwind 输入框 class（若存在）
// 用以上 .form-field 替换 "px-[18rpx] border border-solid border-lightc ..."
```

- [ ] **Step 2: 将原 Tailwind 输入框 `<view class="px-... border ...">` 改为 `<view class="form-field">`**

- [ ] **Step 3: Commit**

```bash
git add src/pages/change_password/change_password.vue src/pages/user_data/user_data.vue
git commit -m "style: apply MD3 tokens to change_password and user_data pages"
```

---

### Task 17: bind_mobile.vue + customer_service.vue

**Files:**
- Modify: `src/pages/bind_mobile/bind_mobile.vue`
- Modify: `src/pages/customer_service/customer_service.vue`

- [ ] **Step 1: bind_mobile — 替换输入/验证码区域样式**

读取文件确认 class 名。将所有 Tailwind 输入框 `<view class="... border ...">` 替换为：

```scss
// 验证码输入区
.bind-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-lg);
    margin: var(--md-space-lg);
}

.bind-field {
    background: var(--md-surface-variant);
    border-radius: var(--md-radius-sm);
    height: 50px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--md-space-md);
}

.bind-code-btn {
    color: var(--md-primary);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
}

.bind-submit {
    height: 48px;
    width: 100%;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    margin-top: var(--md-space-lg);
}
```

- [ ] **Step 2: customer_service — 简单信息页**

```scss
page { background: var(--md-background); }

.cs-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    padding: var(--md-space-xl);
    margin: var(--md-space-lg);
    text-align: center;
}

.cs-card__title {
    font-size: 18px;
    font-weight: 500;
    color: var(--md-on-surface);
    margin-bottom: var(--md-space-md);
}

.cs-card__value {
    font-size: 16px;
    color: var(--md-primary);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/bind_mobile/bind_mobile.vue src/pages/customer_service/customer_service.vue
git commit -m "style: apply MD3 tokens to bind_mobile and customer_service pages"
```

---

## Phase 6 — 钱包与支付页面（4 页）

### Task 18: user_wallet.vue + recharge.vue + recharge_record.vue

**Files:**
- Modify: `src/packages/pages/user_wallet/user_wallet.vue`
- Modify: `src/packages/pages/recharge/recharge.vue`
- Modify: `src/packages/pages/recharge_record/recharge_record.vue`

- [ ] **Step 1: 三文件均使用系统顶栏，page 背景统一**

在每个文件 `<style>` 添加：

```scss
page { background: var(--md-background); }
```

- [ ] **Step 2: user_wallet — 余额卡**

```scss
.wallet-balance {
    background: var(--md-primary-container);
    border-radius: var(--md-radius-md);
    padding: var(--md-space-xl);
    margin: var(--md-space-lg);
    text-align: center;
}

.wallet-balance__label {
    font-size: 13px;
    color: var(--md-on-primary-container);
    opacity: 0.72;
}

.wallet-balance__amount {
    font-size: 36px;
    font-weight: 700;
    color: var(--md-on-primary-container);
    margin-top: 8px;
}

.wallet-menu {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    overflow: hidden;
    margin: 0 var(--md-space-lg);
}

.wallet-menu__item {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--md-outline-variant);
    font-size: 15px;
    color: var(--md-on-surface);
    cursor: pointer;
    &:last-child { border-bottom: none; }
    &:active { background: var(--md-surface-variant); }
}
```

- [ ] **Step 3: recharge — 金额选择**

```scss
.recharge-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--md-space-sm);
    padding: var(--md-space-lg);
}

.recharge-option {
    border: 1.5px solid var(--md-outline-variant);
    border-radius: var(--md-radius-md);
    padding: 12px 8px;
    text-align: center;
    cursor: pointer;
    background: var(--md-surface);
    transition: all 0.15s;

    &.is-selected {
        border-color: var(--md-primary);
        background: var(--md-primary-container);
    }
}

.recharge-option__amount {
    font-size: 18px;
    font-weight: 600;
    color: var(--md-on-surface);
}

.recharge-option__label {
    font-size: 11px;
    color: var(--md-on-surface-variant);
    margin-top: 2px;
}

.recharge-submit {
    height: 48px;
    width: calc(100% - 32px);
    margin: 0 var(--md-space-lg) var(--md-space-xl);
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
}
```

- [ ] **Step 4: recharge_record — 记录列表**

```scss
.record-item {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    border: 1px solid var(--md-outline-variant);
    padding: var(--md-space-lg);
    margin-bottom: var(--md-space-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.record-item__main {
    flex: 1;
}

.record-item__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--md-on-surface);
}

.record-item__time {
    font-size: 12px;
    color: var(--md-on-surface-variant);
    margin-top: 4px;
}

.record-item__amount {
    font-size: 16px;
    font-weight: 600;
    color: var(--md-primary);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/packages/pages/user_wallet/user_wallet.vue \
        src/packages/pages/recharge/recharge.vue \
        src/packages/pages/recharge_record/recharge_record.vue
git commit -m "style: apply MD3 tokens to wallet and recharge pages"
```

---

### Task 19: payment_result.vue

**Files:**
- Modify: `src/pages/payment_result/payment_result.vue`

- [ ] **Step 1: 替换状态页样式**

```scss
<style lang="scss">
page { background: var(--md-background); }

.result-page {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--md-space-xl);
}

.result-card {
    background: var(--md-surface);
    border-radius: var(--md-radius-lg);
    box-shadow: var(--md-elevation-2);
    padding: var(--md-space-2xl);
    width: 100%;
    max-width: 360px;
    text-align: center;
}

.result-icon {
    font-size: 56px;
    line-height: 1;
    margin-bottom: var(--md-space-lg);
}

.result-title {
    font-size: 22px;
    font-weight: 500;
    color: var(--md-on-surface);
    margin-bottom: var(--md-space-sm);
}

.result-desc {
    font-size: 14px;
    color: var(--md-on-surface-variant);
    margin-bottom: var(--md-space-xl);
    line-height: 1.6;
}

.result-actions {
    display: flex;
    flex-direction: column;
    gap: var(--md-space-sm);
}

.result-btn--primary {
    height: 48px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
}

.result-btn--secondary {
    height: 48px;
    border-radius: var(--md-radius-full);
    background: transparent;
    color: var(--md-primary);
    border: 1px solid var(--md-outline);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/payment_result/payment_result.vue
git commit -m "style: apply MD3 tokens to payment_result.vue"
```

---

## Phase 7 — 内容与辅助页面

### Task 20: agreement.vue + as_us.vue

**Files:**
- Modify: `src/pages/agreement/agreement.vue`
- Modify: `src/pages/as_us/as_us.vue`

- [ ] **Step 1: 两文件共同处理**

在各自 `<style>` 中添加（保持 template 不变）：

```scss
// agreement.vue
page { background: var(--md-background); }

.agreement-body, .content-body {
    padding: var(--md-space-lg);
    font-size: 14px;
    line-height: 1.8;
    color: var(--md-on-surface);
}

.agreement-section, .content-section {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    padding: var(--md-space-lg);
    box-shadow: var(--md-elevation-1);
    margin-bottom: var(--md-space-md);
}

.agreement-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--md-on-surface);
    margin-bottom: var(--md-space-sm);
}
```

```scss
// as_us.vue  
page { background: var(--md-background); }

.about-header {
    background: var(--md-primary-container);
    padding: var(--md-space-2xl) var(--md-space-lg);
    text-align: center;
    border-radius: 0 0 var(--md-radius-lg) var(--md-radius-lg);
}

.about-logo {
    width: 72px;
    height: 72px;
    border-radius: var(--md-radius-lg);
    margin: 0 auto var(--md-space-md);
}

.about-name {
    font-size: 20px;
    font-weight: 600;
    color: var(--md-on-primary-container);
}

.about-version {
    font-size: 13px;
    color: var(--md-on-primary-container);
    opacity: 0.72;
    margin-top: 4px;
}

.about-info {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    box-shadow: var(--md-elevation-1);
    overflow: hidden;
    margin: var(--md-space-lg);
}

.about-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--md-outline-variant);
    font-size: 15px;
    &:last-child { border-bottom: none; }
}

.about-row__label { color: var(--md-on-surface-variant); }
.about-row__value { color: var(--md-on-surface); font-weight: 500; }
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/agreement/agreement.vue src/pages/as_us/as_us.vue
git commit -m "style: apply MD3 tokens to agreement and as_us pages"
```

---

### Task 21: search.vue + collection.vue

**Files:**
- Modify: `src/pages/search/search.vue`
- Modify: `src/pages/collection/collection.vue`

- [ ] **Step 1: search.vue — 搜索框和结果列表**

读取 `search.vue` 确认 class 名，然后在 `<style>` 中添加/替换：

```scss
page { background: var(--md-background); }

.search-bar {
    background: var(--md-surface);
    border-bottom: 1px solid var(--md-outline-variant);
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-bar__input-wrap {
    flex: 1;
    height: 40px;
    background: var(--md-surface-variant);
    border-radius: var(--md-radius-full);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
}

.search-bar__placeholder {
    font-size: 14px;
    color: var(--md-on-surface-variant);
}

.search-result-item {
    padding: 14px 16px;
    border-bottom: 1px solid var(--md-outline-variant);
    font-size: 15px;
    color: var(--md-on-surface);
    background: var(--md-surface);
    cursor: pointer;
    &:active { background: var(--md-surface-variant); }
}
```

- [ ] **Step 2: collection.vue — 收藏列表**

```scss
page { background: var(--md-background); }

.collection-item {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    border: 1px solid var(--md-outline-variant);
    padding: var(--md-space-lg);
    margin: 0 var(--md-space-lg) var(--md-space-md);
    cursor: pointer;
    &:active { box-shadow: var(--md-elevation-1); }
}

.collection-item__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--md-on-surface);
}

.collection-item__desc {
    font-size: 13px;
    color: var(--md-on-surface-variant);
    margin-top: 4px;
    line-height: 1.5;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/search/search.vue src/pages/collection/collection.vue
git commit -m "style: apply MD3 tokens to search and collection pages"
```

---

### Task 22: login.vue — 更新为 MD3 tokens（当前色值为 #2563eb）

login.vue 已有良好的自定义 CSS 结构，仅需将硬编码色值替换为 CSS 变量。

**Files:**
- Modify: `src/pages/login/login.vue`

- [ ] **Step 1: 替换 `<style>` 中所有硬编码色值**

查找并替换（全局替换 replace_all）：

| 旧值 | 新值 |
|------|------|
| `#2563eb` | `var(--md-primary)` |
| `#4b86ff` | `var(--md-primary)` |
| `#0f6adf` | `var(--md-primary)` |
| `rgba(37, 99, 235, ...)` | 对应 `rgba(25, 118, 210, ...)` |
| `background: linear-gradient(135deg, #0f6adf 0%, #4b86ff 100%)` | `background: var(--md-primary-container)` |
| `color: #ffffff` on brand → | `color: var(--md-on-primary-container)` |
| `#eef2ff` (switch bg) | `var(--md-surface-variant)` |
| `#475569` (switch text) | `var(--md-on-surface-variant)` |
| `#f8fafc` (field bg) | `var(--md-surface-variant)` |
| `#dbe3f0` (field border) | `var(--md-outline-variant)` |
| `border-radius: 22px` on panel → | `border-radius: var(--md-radius-lg)` |
| `border-radius: 24px` on brand → | `border-radius: var(--md-radius-lg)` |
| `border-radius: 16px` on switch → | `border-radius: var(--md-radius-md)` |
| `border-radius: 14px` on field → | `border-radius: var(--md-radius-sm)` |
| `background: linear-gradient(180deg, #edf3fb 0%, #f8fbff 100%)` | `background: var(--md-background)` |

- [ ] **Step 2: 验证外观**

```bash
npm run dev:desktop:web
```

导航到登录页，确认品牌区域用 Primary Container 蓝色浅色背景，字段清晰。

- [ ] **Step 3: Commit**

```bash
git add src/pages/login/login.vue
git commit -m "style: update login.vue hardcoded colors to MD3 token references"
```

---

### Task 23: news_detail.vue + 404.vue + desktop/reminder.vue

**Files:**
- Modify: `src/pages/news_detail/news_detail.vue`
- Modify: `src/packages/pages/404/404.vue`
- Modify: `src/pages/desktop/reminder.vue`（仅更新 accent 色）

- [ ] **Step 1: news_detail — 页面背景 + 内容区**

```scss
page { background: var(--md-background); }

.article-body { padding: var(--md-space-lg); }

.article-content {
    background: var(--md-surface);
    border-radius: var(--md-radius-md);
    padding: var(--md-space-lg);
    box-shadow: var(--md-elevation-1);
    font-size: 15px;
    line-height: 1.8;
    color: var(--md-on-surface);
}
```

- [ ] **Step 2: 404 — 空状态页**

```scss
page { background: var(--md-background); }

.empty-state {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--md-space-xl);
    text-align: center;
}

.empty-state__icon { font-size: 64px; margin-bottom: var(--md-space-lg); }
.empty-state__title { font-size: 22px; font-weight: 500; color: var(--md-on-surface); }
.empty-state__desc { font-size: 14px; color: var(--md-on-surface-variant); margin-top: var(--md-space-sm); line-height: 1.6; }

.empty-state__btn {
    margin-top: var(--md-space-xl);
    height: 40px;
    padding: 0 24px;
    border-radius: var(--md-radius-full);
    background: var(--md-primary);
    color: var(--md-on-primary);
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
}
```

- [ ] **Step 3: reminder.vue — 更新 accent 色**

找到 reminder.vue `<style>` 中所有 `#2563eb` / `#dbeafe` / `#eff6ff`，替换为：
- `#2563eb` → `var(--md-primary)`
- `#dbeafe` → `var(--md-primary-container)`
- `#eff6ff` → `var(--md-primary-container)`

- [ ] **Step 4: Commit**

```bash
git add src/pages/news_detail/news_detail.vue \
        src/packages/pages/404/404.vue \
        src/pages/desktop/reminder.vue
git commit -m "style: apply MD3 tokens to news_detail, 404, and reminder pages"
```

---

## 最终验证

- [ ] **完整启动验证**

```bash
npm run dev:desktop:web
```

逐一打开所有页面，检查：
1. 无乱码标题
2. 顶栏白底主色标题（custom nav 页面）
3. 系统顶栏页面标题正确（非 custom nav）
4. 页面背景 #F3F6FD
5. 卡片阴影统一
6. 状态芯片颜色正确

- [ ] **最终 Commit**

```bash
git add -A
git commit -m "chore: MD3 redesign complete — all 25 pages migrated to design token system"
```

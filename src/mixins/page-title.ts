const PAGE_TITLES: Record<string, string> = {
    'pages/desktop/home': '工作台',
    'pages/desktop/reminder': '到期提醒',
    'pages/cloud/resources': '云资源',
    'pages/cloud/detail': '云电脑详情',
    'pages/cloud/orders': '订单列表',
    'pages/cloud/order-detail': '订单详情',
    'pages/cloud/purchase': '新增云电脑',
    'pages/cloud/notifications': '消息通知',
    'pages/cloud/renew': '续费',
    'pages/cloud/rename': '重命名',
    'pages/news/news': '资讯',
    'pages/news_detail/news_detail': '资讯详情',
    'pages/user/user': '我的',
    'pages/user_set/user_set': '个人设置',
    'pages/user_data/user_data': '个人资料',
    'pages/customer_service/customer_service': '联系客服',
    'pages/login/login': '登录',
    'pages/register/register': '注册',
    'pages/forget_pwd/forget_pwd': '忘记密码',
    'pages/change_password/change_password': '修改密码',
    'pages/collection/collection': '我的收藏',
    'pages/search/search': '搜索',
    'pages/as_us/as_us': '关于我们',
    'pages/agreement/agreement': '协议',
    'pages/bind_mobile/bind_mobile': '绑定手机号',
    'pages/payment_result/payment_result': '支付结果',
    'packages/pages/user_wallet/user_wallet': '我的钱包',
    'packages/pages/recharge/recharge': '充值',
    'packages/pages/recharge_record/recharge_record': '充值记录',
}

export default {
    onShow() {
        const pages = getCurrentPages()
        const current = pages[pages.length - 1]
        if (!current) return
        const route = String(current.route || '')
        const title = PAGE_TITLES[route] || '天翼云电脑'
        document.title = title
    }
}

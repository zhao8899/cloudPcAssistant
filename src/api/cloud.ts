import request from '@/utils/request'

export function getCloudHomeData() {
    return request.get({ url: '/cloud.resource/home' }, { isAuth: true })
}

export function getCloudPurchasePackOptions() {
    return request.get({ url: '/cloud.resource/purchasePackOptions' }, { isAuth: true })
}

export function getCloudResourcePackLists(data: any) {
    return request.get({ url: '/cloud.resource/packLists', data }, { isAuth: true })
}

export function getCloudInstanceDetail(data: any) {
    return request.get({ url: '/cloud.instance/detail', data }, { isAuth: true })
}

export function startCloudInstance(data: any) {
    return request.post({ url: '/cloud.instance/start', data }, { isAuth: true })
}

export function stopCloudInstance(data: any) {
    return request.post({ url: '/cloud.instance/stop', data }, { isAuth: true })
}

export function rebootCloudInstance(data: any) {
    return request.post({ url: '/cloud.instance/reboot', data }, { isAuth: true })
}

export function deleteCloudInstance(data: any) {
    return request.post({ url: '/cloud.instance/delete', data }, { isAuth: true })
}

export function renameCloudInstance(data: any) {
    return request.post({ url: '/cloud.instance/rename', data }, { isAuth: true })
}

export function getCloudSpecLists(data: any) {
    return request.get({ url: '/cloud.spec/lists', data }, { isAuth: true })
}

export function getCloudSpecImages(data: any) {
    return request.get({ url: '/cloud.spec/images', data }, { isAuth: true })
}

export function submitCloudOrder(data: any) {
    return request.post({ url: '/cloud.order/submit', data }, { isAuth: true })
}

export function getCloudOrderWorkbench(data: any) {
    return request.get({ url: '/cloud.order/workbench', data }, { isAuth: true })
}

export function getCloudOrderWorkbenchDetail(data: any) {
    return request.get({ url: '/cloud.order/workbenchDetail', data }, { isAuth: true })
}

export function auditCloudOrderWorkbench(data: any) {
    return request.post({ url: '/cloud.order/workbenchAudit', data }, { isAuth: true })
}

export function cancelCloudOrderWorkbench(data: any) {
    return request.post({ url: '/cloud.order/workbenchCancel', data }, { isAuth: true })
}

export function createCloudOrder(data: any) {
    return request.post({ url: '/cloud.order/create', data }, { isAuth: true })
}

export function getCloudOrderRenewPreview(data: any) {
    return request.post({ url: '/cloud.order/renewPreview', data }, { isAuth: true })
}

export function renewCloudOrder(data: any) {
    return request.post({ url: '/cloud.order/renew', data }, { isAuth: true })
}

export function applyRenewCloudOrder(data: any) {
    return request.post({ url: '/cloud.order/renewApply', data }, { isAuth: true })
}

export function getCloudNotificationLists(data: any) {
    return request.get({ url: '/cloud.notification/lists', data }, { isAuth: true })
}

export function readCloudNotification(data: any) {
    return request.post({ url: '/cloud.notification/read', data }, { isAuth: true })
}

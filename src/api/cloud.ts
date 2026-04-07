import type { CloudResourceItem, CloudHomeData } from '@/types/cloud'
import request from '@/utils/request'

export interface CloudPackOption {
    id: number | string
    region_id?: string
    region_name?: string
    [key: string]: any
}

export interface CloudSpec {
    id: number | string
    name?: string
    cpu?: number
    memory?: number
    [key: string]: any
}

export interface CloudImage {
    id: number | string
    name?: string
    os_type?: string
    [key: string]: any
}

export interface CloudOrderSubmitParams {
    spec_id: number | string
    image_id: number | string
    pack_id: number | string
    duration?: number
    [key: string]: any
}

export interface CloudNotification {
    id: number | string
    title?: string
    content?: string
    is_read?: number
    create_time?: string
    [key: string]: any
}

export function getCloudHomeData() {
    return request.get<CloudHomeData>({ url: '/cloud.resource/home' }, { isAuth: true })
}

export function getCloudPurchasePackOptions() {
    return request.get<CloudPackOption[]>({ url: '/cloud.resource/purchasePackOptions' }, { isAuth: true })
}

export function getCloudResourcePackLists(data: { pack_id: number | string; page?: number; [key: string]: any }) {
    return request.get<{ lists: CloudResourceItem[]; count: number }>({ url: '/cloud.resource/packLists', data }, { isAuth: true })
}

export function getCloudInstanceDetail(data: { id: number | string }) {
    return request.get<CloudResourceItem>({ url: '/cloud.instance/detail', data }, { isAuth: true })
}

export function startCloudInstance(data: { id: number | string }) {
    return request.post({ url: '/cloud.instance/start', data }, { isAuth: true })
}

export function stopCloudInstance(data: { id: number | string }) {
    return request.post({ url: '/cloud.instance/stop', data }, { isAuth: true })
}

export function rebootCloudInstance(data: { id: number | string }) {
    return request.post({ url: '/cloud.instance/reboot', data }, { isAuth: true })
}

export function deleteCloudInstance(data: { id: number | string }) {
    return request.post({ url: '/cloud.instance/delete', data }, { isAuth: true })
}

export function renameCloudInstance(data: { id: number | string; name: string }) {
    return request.post({ url: '/cloud.instance/rename', data }, { isAuth: true })
}

export function getCloudSpecLists(data: { pack_id: number | string; os_type?: string }) {
    return request.get<CloudSpec[]>({ url: '/cloud.spec/lists', data }, { isAuth: true })
}

export function getCloudSpecImages(data: { spec_id: number | string }) {
    return request.get<CloudImage[]>({ url: '/cloud.spec/images', data }, { isAuth: true })
}

export function submitCloudOrder(data: CloudOrderSubmitParams) {
    return request.post({ url: '/cloud.order/submit', data }, { isAuth: true })
}

export function getCloudOrderWorkbench(data: { page?: number; [key: string]: any }) {
    return request.get({ url: '/cloud.order/workbench', data }, { isAuth: true })
}

export function getCloudOrderWorkbenchDetail(data: { id: number | string }) {
    return request.get({ url: '/cloud.order/workbenchDetail', data }, { isAuth: true })
}

export function auditCloudOrderWorkbench(data: { id: number | string; status: number }) {
    return request.post({ url: '/cloud.order/workbenchAudit', data }, { isAuth: true })
}

export function cancelCloudOrderWorkbench(data: { id: number | string }) {
    return request.post({ url: '/cloud.order/workbenchCancel', data }, { isAuth: true })
}

export function createCloudOrder(data: Record<string, any>) {
    return request.post({ url: '/cloud.order/create', data }, { isAuth: true })
}

export function getCloudOrderRenewPreview(data: { id: number | string; duration?: number }) {
    return request.post({ url: '/cloud.order/renewPreview', data }, { isAuth: true })
}

export function renewCloudOrder(data: { id: number | string; duration?: number }) {
    return request.post({ url: '/cloud.order/renew', data }, { isAuth: true })
}

export function applyRenewCloudOrder(data: { id: number | string; duration?: number }) {
    return request.post({ url: '/cloud.order/renewApply', data }, { isAuth: true })
}

export function getCloudNotificationLists(data: { page?: number; [key: string]: any }) {
    return request.get<{ lists: CloudNotification[]; count: number }>({ url: '/cloud.notification/lists', data }, { isAuth: true })
}

export function readCloudNotification(data: { id: number | string }) {
    return request.post({ url: '/cloud.notification/read', data }, { isAuth: true })
}

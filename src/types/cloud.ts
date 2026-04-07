export interface CloudResourceItem {
    id?: number | string
    name?: string
    resource_name?: string
    desktop_oid?: string
    cloud_resource_id?: string
    status?: number | string
    status_text?: string
    status_class?: string
    expired_at?: number | string
    expired_at_text?: string
    flavor_name?: string
    os_type?: string
    bandwidth_mbps?: number | string
    can_renew?: boolean
}

export interface CloudHomeData {
    latest_resources: CloudResourceItem[]
    [key: string]: any
}

export interface SupportContent {
    title?: string
    mobile?: string
    time?: string
}

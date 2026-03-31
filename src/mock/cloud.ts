export interface CloudPc {
    id: string
    name: string
    specs: string[]
    status: 'running' | 'stopped'
    remainingTime?: string
    expiryDate?: string
    os: string
    gpu?: string
    disk: string
    bandwidth: string
}

export interface CloudOrder {
    id: string
    product: string
    status: 'pending' | 'approved' | 'rejected'
    date: string
    duration?: string
    os?: string
    spec?: string
    bandwidth?: string
    desktopId?: string
    email?: string
    phone?: string
    remark?: string
}

export const mockPcs: CloudPc[] = [
    {
        id: 'i-cty-88923456',
        name: '设计工作机',
        specs: ['16 核', '32G', 'RTX 4060', '1T SSD'],
        status: 'running',
        remainingTime: '25 小时 30 分钟',
        expiryDate: '2026-03-19 14:30',
        os: 'Windows 11 专业版',
        gpu: 'RTX 4060',
        disk: '1T SSD',
        bandwidth: '5M'
    },
    {
        id: 'i-cty-66542108',
        name: '开发环境',
        specs: ['8 核', '16G', '集成显卡', '512G SSD'],
        status: 'stopped',
        expiryDate: '2026-04-10 00:00',
        os: 'Ubuntu 22.04',
        disk: '512G SSD',
        bandwidth: '5M'
    }
]

export const mockOrders: CloudOrder[] = [
    {
        id: 'ORD20260317001',
        product: 'Windows - 16核 32GB',
        status: 'approved',
        date: '2026-03-17 10:00',
        duration: '6个月',
        os: 'Windows 11',
        spec: '16核 32GB',
        bandwidth: '5M',
        desktopId: 'i-cty-88923456',
        email: 'test@example.com',
        phone: '13800138000',
        remark: '正式环境使用'
    },
    {
        id: 'ORD20260315022',
        product: 'Linux - 8核 16GB',
        status: 'pending',
        date: '2026-03-15 14:20',
        duration: '1个月',
        os: 'Ubuntu 22.04',
        spec: '8核 16GB',
        bandwidth: '5M',
        email: 'dev@example.com',
        phone: '13900139000'
    },
    {
        id: 'ORD20260310045',
        product: '设计工作机 - 延期',
        status: 'rejected',
        date: '2026-03-10 09:15',
        duration: '1个月',
        os: 'Windows 11',
        spec: '32核 64GB',
        bandwidth: '10M',
        email: 'design@example.com',
        phone: '13700137000'
    }
]

export const mockSpecs = [
    { cpu: '2核', ram: '4GB', gpu: '-', name: '2核 4GB' },
    { cpu: '4核', ram: '8GB', gpu: '-', name: '4核 8GB' },
    { cpu: '8核', ram: '16GB', gpu: '-', name: '8核 16GB' },
    { cpu: '16核', ram: '32GB', gpu: '-', name: '16核 32GB' },
    { cpu: '32核', ram: '64GB', gpu: '-', name: '32核 64GB' }
]

export const mockNotifications = [
    {
        id: 1,
        title: '系统通知',
        content: '您的云电脑已成功开通，请前往控制台查看。',
        date: '2026-03-17 10:05',
        unread: true
    },
    {
        id: 2,
        title: '安全提醒',
        content: '检测到您的账号在新的设备上登录，如非本人操作请及时修改密码。',
        date: '2026-03-16 14:20',
        unread: true
    },
    {
        id: 3,
        title: '续费提醒',
        content: '您的云电脑将于 3 天后到期，请及时续费。',
        date: '2026-03-15 09:00',
        unread: false
    }
]

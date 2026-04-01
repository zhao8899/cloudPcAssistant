import { PayStatusEnum } from '@/enums/appEnums'

export class Wechat {
    init(name: string, pay: any) {
        pay[name] = this
    }

    async run(options: any) {
        return new Promise<PayStatusEnum>((resolve) => {
            window.open(options, '_self')
            resolve(PayStatusEnum.PENDING)
        })
    }
}

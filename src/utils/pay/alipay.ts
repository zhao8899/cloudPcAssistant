import { PayStatusEnum } from '@/enums/appEnums'

export class Alipay {
    init(name: string, pay: any) {
        pay[name] = this
    }

    openNewPage(options: any) {
        uni.navigateBack()
        const alipayPage = window.open('', '_self')!
        alipayPage.document.body.innerHTML = options
        alipayPage.document.forms[0].submit()
    }

    async run(options: any) {
        this.openNewPage(options)
        return PayStatusEnum.PENDING
    }
}

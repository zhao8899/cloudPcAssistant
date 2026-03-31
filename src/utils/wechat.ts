import wx from 'weixin-js-sdk'
import { getWxCodeUrl } from '@/api/account'
import { isAndroid } from './client'
import { wxJsConfig } from '@/api/app'
import { objectToQuery } from './util'
export enum UrlScene {
    LOGIN = 'login',
    PC_LOGIN = 'pcLogin',
    BIND_WX = 'bindWx',
    BASE = 'base'
}
const wechatOa = {
    _authData: {
        code: '',
        scene: ''
    },
    _configStatus: 'idle',
    setAuthData(data: any = {}) {
        this._authData = data
    },
    getAuthData() {
        return this._authData
    },
    canConfig() {
        return this._configStatus !== 'disabled'
    },
    getSignLink() {
        if (typeof window.signLink === 'undefined' || window.signLink === '') {
            window.signLink = location.href.split('#')[0]
        }
        return isAndroid() ? location.href.split('#')[0] : window.signLink
    },
    getUrl(
        scene: UrlScene,
        scope = 'snsapi_userinfo',
        extra = {}
    ): Promise<void> {
        const currentUrl = `${location.href}${
            location.search ? '&' : '?'
        }scene=${scene || ''}&${objectToQuery(extra)}`
        return new Promise((resolve, reject) => {
            getWxCodeUrl({
                url: currentUrl,
                scope
            }).then((res) => {
                location.href = res.url
                resolve()
            }, reject)
        })
    },
    config() {
        if (this._configStatus === 'disabled') {
            return Promise.resolve(false)
        }
        if (this._configStatus === 'ready') {
            return Promise.resolve(true)
        }

        return new Promise((resolve) => {
            wxJsConfig({
                url: this.getSignLink()
            }).then((res) => {
                wx.config({
                    ...res,
                    success: () => {
                        this._configStatus = 'ready'
                        resolve(true)
                    },
                    fail: () => {
                        this._configStatus = 'disabled'
                        resolve(false)
                    }
                })
            }).catch(() => {
                this._configStatus = 'disabled'
                resolve(false)
            })
        })
    },
    miniProgram: wx.miniProgram,
    ready(): Promise<void> {
        return new Promise((resolve, reject) => {
            wx.ready(() => {
                resolve()
            })
            wx.error(() => {
                reject()
            })
        })
    },
    pay(options: Record<any, any>) {
        return new Promise((resolve, reject) => {
            this.ready()
                .then(() => {
                    wx.chooseWXPay({
                        timestamp: options.timeStamp,
                        nonceStr: options.nonceStr,
                        package: options.package,
                        signType: options.signType,
                        paySign: options.paySign,
                        success: (res: any) => {
                            if (res.errMsg === 'chooseWXPay:ok') {
                                resolve(res)
                            } else {
                                reject(res.errMsg)
                            }
                        },
                        cancel: (res: any) => {
                            reject(res)
                        },
                        fail: (res: any) => {
                            reject(res)
                        }
                    })
                })
                .catch((err) => {
                    reject(err)
                })
        })
    },
    async share(options: Record<any, any>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ready()
                .then(() => {
                    const { title, link, imgUrl, desc } = options
                    const shareApi = [
                        'updateTimelineShareData',
                        'updateAppMessageShareData'
                    ]
                    for (const api of shareApi) {
                        wx[api]({
                            title: title,
                            link: link,
                            imgUrl: imgUrl,
                            desc: desc,
                            success() {
                                resolve()
                            },
                            fail() {
                                reject()
                            }
                        })
                    }
                })
                .catch(reject)
        })
    },
    getAddress() {
        return new Promise((reslove, reject) => {
            this.ready().then(() => {
                ;(wx as any).openAddress({
                    success: (res: any) => {
                        reslove(res)
                    },
                    fail: (res: any) => {
                        reject(res)
                    }
                })
            })
        })
    },
    getLocation() {
        return new Promise((resolve, reject) => {
            this.ready().then(() => {
                wx.getLocation({
                    type: 'gcj02',
                    success: (res: any) => {
                        resolve(res)
                    },
                    fail: (res: any) => {
                        reject(res)
                    }
                })
            })
        })
    },
    hideMenuItems(menuList: string[]) {
        return new Promise((resolve, reject) => {
            this.ready().then(() => {
                wx.hideMenuItems({
                    menuList: menuList as any,
                    success: (res: any) => {
                        resolve(res)
                    },
                    fail: (res: any) => {
                        reject(res)
                    }
                })
            })
        })
    },
    showMenuItems(menuList: string[]) {
        return new Promise((resolve, reject) => {
            this.ready().then(() => {
                wx.showMenuItems({
                    menuList: menuList as any,
                    success: (res: any) => {
                        resolve(res)
                    },
                    fail: (res: any) => {
                        reject(res)
                    }
                })
            })
        })
    }
}

export default wechatOa


export const openType = {
  bindGetUserInfo(event: Partial<Weapp.Event>) {
    // @ts-ignore
    this.triggerEvent('getuserinfo', event.detail)
  },

  bindContact(event: Partial<Weapp.Event>) {
    // @ts-ignore
    this.triggerEvent('contact', event.detail)
  },

  bindGetPhoneNumber(event: Partial<Weapp.Event>) {
    // @ts-ignore
    this.triggerEvent('getphonenumber', event.detail)
  },

  bindError(event: Partial<Weapp.Event>) {
    // @ts-ignore
    this.triggerEvent('error', event.detail)
  },

  bindLaunchApp(event: Partial<Weapp.Event>) {
    // @ts-ignore
    this.triggerEvent('launchapp', event.detail)
  },

  bindOpenSetting(event: Partial<Weapp.Event>) {
    // @ts-ignore
    this.triggerEvent('opensetting', event.detail)
  }
}
/*********************************************
 * 不要再src中修改该文件
 * 请在config中修改对应的文件
 ********************************************/

export const config = {
  /** app版本号（根据min.config.json自动设置） */ 
  appVersion: '1.0.0',

  
  ///////////////////////////
  // 自定义区
  ///////////////////////////
  
  /** 不是发布版本 发布前改为false !import*/ 
  isdev: false,
  /** false为正式环境 true为测试环境并自动打开调试*/ 
  debug: true,
  /** Http服务器地址 DEBUG*/ 
  httpUrlDebug: 'https://test.api.order.iduoliao.cn',
  /** Http服务器地址*/ 
  httpUrl: 'https://test.api.order.iduoliao.cn',
  /** 上传地址 */ 
  uploadUrl: function (path: string) {
    let ext = getFileExtesion(path);
    let baseUrl = this.debug ? this.httpUrlDebug : this.httpUrl;
    return baseUrl + "/comm/upload?type=" + ext;
  }
}

function getFileExtesion(path: string) {
  let index = path.lastIndexOf('.');
  return path.substring(index+1);
}
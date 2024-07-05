import { isFunction, isString, toInteger, toNumber } from '../base';
import { config } from '../config';
import { showNotify, clearNotify } from "./notify";

/**
 * 生成UUID
 * @param len   长度。未指定len，生成GUID
 * @param radix 基数（2、10、16等）
 */
function uuid(len?: number, radix?: number): string {
  let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  let uuid = [];

  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (let i = 0; i < len; i++) {
      uuid[i] = chars[0 | (Math.random() * radix)];
    }
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data. At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join("");
}

function bufferViewToArray(buffer: Uint8Array): number[] {
  let array: number[] = [];
  for (let i = 0; i < buffer.length; ++i) {
    array.push(buffer[i]);
  }
  return array;
}

function arrayBufferToArray(arrayBuffer: ArrayBuffer) {
  return bufferViewToArray(new Uint8Array(arrayBuffer));
}

function arrayToArrayBuffer(array: number[]): ArrayBuffer {
  let length = array.length;
  let ab = new ArrayBuffer(length);
  let view = new Uint8Array(ab);
  for (let i = 0; i < length; ++i) {
    view[i] = array[i];
  }
  return ab;
}

/**
 * 获取整数部分长度
 * @param num 
 */
function strNumSize(num: number): number {
  return num.toFixed(0).length;
}

/**
 * 将大数字转为单位
 * 
 * - 例如: 11000 => 1.10万
 * @param num 数字
 * @param fix 保留小数位数，缺省是2位
 */
function unitConvert(num?: number, fix: number = 2): string {
  if (!num && num !== 0) return "";

  let moneyUnits = ["", "万", "亿", "万亿"];
  let dividend = 10000;
  let curentNum = num;

  //转换数字
  let curentUnit = moneyUnits[0]; //转换单位
  for (let i = 0; i < 4; i++) {
    curentUnit = moneyUnits[i];
    if (strNumSize(curentNum) < 5) {
      break;
    }
    curentNum = curentNum / dividend;
  }
  return curentNum.toFixed(fix) + curentUnit;
}

/**
 * 生成价格字符串
 * @param price 价格数字
 * @param fix 保留小数位数。缺省：2
 * @param isFen 价格是否是已"分"为单位。缺省：true
 * @returns 
 */
function getMoney(price: any, fix: number = 2, isFen: boolean = true): string {
  let num = toNumber(price);
  num = isFen ? num / 100 : num;
  return num.toFixed(fix);
}


/**
 * 比较版本号
 * 
 * @param current 当前版本号
 * @param other 需要比较的版本号
 * 
 * @returns 1: current > other 0: current == other -1: current < other
 */
function compareVersion(current: string, other: string): number {
  let ver1 = current.split(".");
  let ver2 = other.split(".");

  let len = Math.max(ver1.length, ver2.length);

  while (ver1.length < len) {
    ver1.push("0");
  }

  while (ver2.length < len) {
    ver2.push("0");
  }

  for (let i = 0; i < len; i++) {
    let num1 = parseInt(ver1[i], 0);
    let num2 = parseInt(ver2[i], 0);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

/**
 * 格式化字符串
 * @param url   示例：'/pages/common/videoplay/videoplay?asfrom={asfrom}&asscene={asscene}'
 * @param data {asfrom: this.asfrom, asscene: this.asscene}
 */
function formatText(url: string, data: AnyObject): string {
  let u: string, val;

  for (let key in data) {
    val = data[key];
    u = url.replace("{" + key + "}", val);
    if (u !== url) {
      url = u;
      // delete data[key];
    }
  }

  return url;
}

/**
 * 获取当前页面的path
 */
function getCurrentPagePath() {
  let pages = getCurrentPages()    //获取加载的页面
  let currentPage = pages[pages.length - 1]    //获取当前页面的对象
  let url = currentPage.route    //当前页面url
  return url
}

/**
 * 获取当前页面带参数的url
 */
function getCurrentPageUrl() {
  let pages = getCurrentPages()    // 获取加载的页面
  let currentPage = pages[pages.length - 1]    // 获取当前页面的对象
  let url = currentPage.route    // 当前页面url
  let options = currentPage.options    // 如果要获取url中所带的参数可以查看options
  // 拼接url的参数
  let urlWithArgs = url + '?'
  for (let key in options) {
    let value = options[key]
    urlWithArgs += key + '=' + value + '&'
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
  return urlWithArgs
}

/**
 * 获取当前页的参数
 */
function getCurrentPageParams() {
  let pages = getCurrentPages();
  let currentPage = pages[pages.length - 1]    // 获取当前页面的对象
  let options = currentPage.options || {};
  return options;
}

/**
 * 翻转对象中的boolean值
 * @param obj 
 */
function reverseState(obj: AnyObject): AnyObject {
  let newObj: AnyObject = {};
  for (let key in obj) {
    if (typeof obj[key] === 'boolean') {
      newObj[key] = !obj[key];
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}


/**
 * 获取字符串的字节数
 * @param {*} str 字符串
 */
function getByteLen(str: string): number {
  let totalLength = 0
  let charCode
  for (let i = 0; i < str.length; i++) {
    charCode = str.charCodeAt(i)
    if (charCode < 0x007f) {
      totalLength++
    } else if (0x0080 <= charCode && charCode <= 0x07ff) {
      totalLength += 2
    } else if (0x0800 <= charCode && charCode <= 0xffff) {
      totalLength += 3
    } else {
      totalLength += 4
    }
  }
  return totalLength
}

/**
 * 按长度分割字符串为字符数组
 * @param text 
 * @param len 缺省1000
 * @returns 
 */
function splitText(text: string, len: number = 1000) {
  const tempArray: string[] = [];
  const count = text.length / len;
  for (let i = 0; i < count; i++) {
    tempArray.push(text.slice(i*len, len * (i+1)));
  }
  return tempArray;
}

/**
 * 去掉文本中的空白符
 * @param text 
 * @returns 
 */
function trim(text: string) {
  return (text+'').replace(/\s*/gm, "")
}

function getUserDefaultNick(userId: string): string {
  let reg = /([1-9][0-9]*)$/g;
  let rest = userId.match(reg);
  let id = rest && rest[0];
  return `宝宝${id}`;
}

const NAME_COLORS = ['#93C0CF', '#D295CC', '#F0DBB0', '#93C0CF', '#63A997']
function getRandomColor(userId: string) {
  const hashCode = genHashCode(userId);
  let index = Math.floor(Math.abs(hashCode % NAME_COLORS.length))
  return NAME_COLORS[index];
}

function genHashCode(userId: string): number {
  if (!userId) {
    return 0;
  }

  let arraySize = 11113;
  let hashCode = 0;
  for (let index = 0; index < userId.length; index++) {
    let letterValue = userId.charCodeAt(index) - 96;
    hashCode = ((hashCode << 5) + letterValue) % arraySize;
  }

  return hashCode;
}

function getRandomAvatar(userId: number | string) {
  userId = String(userId);
  const code = genHashCode(userId);
  const index = Math.floor(Math.abs(code % 13));
  return getThumb(`https://ali.img.cdn.iduoliao.cn/outdoor/res/avatar/${index}.png`, ThumbType['60x60']);
}

/**
 * 通过身份证获取性别
 * @param card 身份证号
 * @param def 身份证号错误时返回值。缺省为：MALE
 * @returns 
 */
function getSex(card: string, def: Sex = Sex.MALE) {
  if (checkIdcard(card)) {
    return toInteger(card[16]) % 2 === 1 ? Sex.MALE : Sex.FEMALE;
  }

  return def;
}

function toLonglink(link: string): string {
  if (link && !link.startsWith('http')) {
    return `${isFunction(config.httpUrl) ? config.httpUrl() : config.httpUrl}/${link}`;
  }
  
  return link;
}

/**
 * 提示消息
 * @param title 文本信息
 * @param icon 图标 或者 error（error.msg）作为附加显示信息
 */
function showToast(title: string, icon: 'success' | 'loading' | 'none' | IAnyObject = 'none') {
  if (icon && typeof icon !== 'string' && icon.msg) {
    title = `${title}: ${icon.msg}`;
  }

  wx.showToast({
    title,
    icon: typeof icon === 'string' ? icon : 'none'
  })
}

function showLoading(title: string, mask: boolean = false) {
  wx.showLoading({
    title,
    mask
  })
}

/////////////////////////////
// 表单校验

/**
 * 校验手机号
 * @param value 
 */
function checkMobile(value: string) {
  return typeof value === 'string' && /^1[3456789]\d{9}$/.test(value);
}

/**
 * 校验身份证
 * @param value 
 */
function checkIdcard(value: string) {
  return typeof value === 'string' 
    && /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
}

/**
 * 校验URL
 * @param url 
 */
function checkUrl(url: string) {
  return typeof url === 'string' && /^https?:\/\/.+/.test(url);
}

/**
 * 校验名字
 * @param name 
 */
function checkName(name: string) {
  return typeof name === 'string' && /(^[a-zA-Z0-9]+$)|(^[\u4e00-\u9fa50-9]+$)/.test(name);
}

const systemInfo = wx.getSystemInfoSync();
/**
 * 获取选择图片类型（原图、压缩图）
 * - ios 选择原图容易导致crash
 * @returns 
 */
function getChooseImageType() {
  return systemInfo.platform === 'ios' ? ["compressed"] : ['original', 'compressed']
}

/**
 * 获取图片缩略图 
 */
function getThumb(url: string, type: ThumbType) {
  if (!isString(url) || url.includes('?x-oss-process=style')) {
    return url;
  }

  if (url.startsWith('https://jiuban-live') || url.startsWith('https://ali.img')) {
    return `${url}${type}`;
  }

  return url;
}

export default {
  reverseState,
  getCurrentPageUrl,
  getCurrentPagePath,
  getCurrentPageParams,
  formatText,
  unitConvert,
  uuid,
  bufferViewToArray,
  arrayToArrayBuffer,
  arrayBufferToArray,
  compareVersion,
  getByteLen,
  splitText,
  trim,

  getMoney,
  getUserDefaultNick,
  getRandomAvatar,
  getRandomColor,
  getSex,
  toLonglink,

  showToast,
  showLoading,
  showNotify, 
  clearNotify,

  checkMobile,
  checkIdcard,
  checkUrl,
  checkName,

  getChooseImageType,
  getThumb
};
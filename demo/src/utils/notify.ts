import { isString } from "@we-app/core";

const systemInfo = wx.getSystemInfoSync();

const defaultOptions = {
  selector: '#default-notify',
  type: 'danger',
  message: '',
  background: '',
  duration: 2000,
  zIndex: 110,
  top: 0,
  color: "#fff",
  safeAreaInsetTop: systemInfo.platform !== PlatFormType.windows
};

function parseOptions(message: any) {
  if (message == null) {
    return {};
  }
  return typeof message === 'string' ? { message } : message;
}

function getContext() {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
}

export function showNotify(option: NOTIFY_IPTIONS | string, error?: AnyObject) {
  wx.hideLoading();

  let options: NOTIFY_IPTIONS = Object.assign(
    Object.assign({}, defaultOptions),
    parseOptions(option)
  );
  
  if (error && isString(error.msg)) {
    options.message = `${options.message}: ${error.msg}`;
  }

  const context = options.context || getContext();
  const notify = context.selectComponent(options.selector);
  delete options.context;
  delete options.selector;
  if (notify) {
    notify.setData(options);
    notify.show();
    return notify;
  }
  console.warn('未找到 wxc-notify 节点，请确认 selector 及 context 是否正确');
}

export function clearNotify(option?: NOTIFY_IPTIONS | undefined) {
  let options: NOTIFY_IPTIONS = Object.assign(
    Object.assign({}, defaultOptions),
    parseOptions(option)
  );
  const context = options.context || getContext();
  const notify = context.selectComponent(options.selector);
  if (notify) {
    notify.hide();
  }
};
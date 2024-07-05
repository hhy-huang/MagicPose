
/**
 * [ActionSheet组件]
 */

declare interface ActionSheetItem {
  /** 文字 */
  text: string;
  /** 颜色 */
  color?: string;
}

declare interface HTML_NODE {
  name?: string;
  attrs?: Record<string,string | undefined | string[]>;
  type?: string;
  text?: string;
  lazyLoad?: number;
  c?: number;
  pre?: boolean;
  children?: HTML_NODE[];
  flag?: number;
  
}

declare interface HTML_PARSE_OPTIONS {
  tagStyle: IAnyObject;
  domain: string;
  protocol: string;
}

declare interface NOTIFY_IPTIONS {
  message: string;
  selector?: string;
  type?: 'info' | 'success' | 'danger' | 'warning';
  background?: string;
  duration?: number;
  zIndex?: number;
  top?: number;
  color?: string;
  safeAreaInsetTop?: boolean;
  context?: any;
}

//////////////////////////////////////
// croper
/////////////////////////////////////

declare interface Point {
  x: number;
  y: number;
}

declare interface Size {
  width: number;
  height: number;
}

declare interface Rect {
  width: number;
  height: number;
  top?: number;
  left?: number;
}

declare type RectPoint = [Point, Point, Point, Point];

declare type ImageInfo  = WechatMiniprogram.GetImageInfoSuccessCallbackResult;

declare interface TransformFunctionItem {
  name: "scale" | "translate" | "skewDEG" | "rotateDEG"
  params: any[]
}


//////////////////////
// 框架相关（不要删除）
//////////////////////
declare const enum ThumbType {
  '120x120' = '?x-oss-process=style/120x120',
  '375x0' = '?x-oss-process=style/375x0',
  '0x300' = '?x-oss-process=style/0x300',
  '60x60' = '?x-oss-process=style/60x60',
  '300x300' = '?x-oss-process=style/300x300'
}

/**
 * systemInfo platform
 */
 declare const enum PlatFormType {
  ios = 'ios',
  android = 'android',
  mac = 'mac',
  windows = 'windows',
  devtools = 'devtools',
  unknown = 'unknown'
}

/**
 * cropper 方向枚举
 */
 declare const enum OrientType {
  UP = 1,
  UP_MIRRORED,
  DOWN,
  DOWN_MIRRORED,
  LEFT_MIRRORED,
  RIGHT,
  RIGHT_MIRRORED,
  LEFT
}



//////////////////////
// 业务相关
//////////////////////

/**
 * 分享类型
 */
declare const enum ShareType {
  FRIEND,
  CIRCLE
}

/**
 * 用户性别
 */
declare const enum Sex {
  /** 男 */
  MALE = 0,
  /** 女 */
  FEMALE= 1 
}
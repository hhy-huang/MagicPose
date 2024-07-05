import { MobxApp, Url } from '@we-app/core'
import { BaseServiceCore } from './base_service_core';
import { BaseStore } from './base_store'

export class BaseApp<S extends BaseStore = BaseStore, V extends BaseServiceCore = BaseServiceCore> extends MobxApp<S, V> {
  /*
    注意：
      1. INJECT_START 到 INJECT_END 之间的文件是自动注入的，请不要随意修改
      2. 触发条件是：npm run build构建时
  */

  /*# INJECT_START {"key": "pagesMap"} #*/
  // @ts-ignore
  $url: {
    index: Url; 
    userDemo: Url;
  };
  
  /** 自动生成方法, 不要覆盖 */
  protected __initHomeUrl() {
    // @ts-ignore
    this.$home = new Url("/pages/index/index", false);
  
    // @ts-ignore
    this.$url = {};
    this.$url["index"] = new Url("/pages/index/index", false);
    this.$url["userDemo"] = new Url("/subpackages/user/pages/demo/demo", false);
  }
  /*# INJECT_END #*/
}

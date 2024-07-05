import { MobxService } from '@we-app/core'
import { BaseStore } from './base_store'
import { BaseApp } from './base_app'
import { BaseServiceCore } from './base_service_core'


export class BaseService<S extends BaseStore = BaseStore, V extends BaseServiceCore = BaseServiceCore> extends MobxService<S, BaseApp<S, V>, V> {

}
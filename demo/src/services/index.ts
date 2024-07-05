// @ts-nocheck
import { wxapi } from "./wxapi";
import { login } from "./login";
import { http } from "./http";
import { user } from './user';
import { log } from './log';
import { BaseServiceCore } from '../base/base_service_core';
import { BaseService } from "../base";

export class ServiceCore extends BaseServiceCore {
  public wxapi = wxapi;
  public login = login;
  public http = http;
  public user = user;
  public log = log;
  
  public startService(app: any) {
    log.start(app);
    wxapi.start(app);
    http.start(app);
    login.start(app);
    user.start(app);
  }
}

export const service = new ServiceCore();

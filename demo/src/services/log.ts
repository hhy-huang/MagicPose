/*****************************************************************************
文件名: log
作者: wowbox
日期: 2019-01-21
描述: 日志记录和上报
******************************************************************************/

import { serify, BaseService, getService, formatTime } from "../base/index";
import { EVENT } from '../common/const/eventList';
import { ServiceCore } from './index';
import { HttpApi } from '../common/http/httpApi';
import { StoreCenter } from '../store/index';
import util from '../utils/util';
import { config } from "../config";


interface LogInfo {
  len: number;
  start: number;
}

interface WaitInfo {
  content: string;
  len: number;
}

const UTF8 = 'utf-8';
const INDEX_KEY = 'log_index_list'
// @ts-ignore
const FILE_PATH = `${wx.env.USER_DATA_PATH}/${config.appId}-logs.log`;

const MAX_LINE = 2000;
const FIX_LINE = 800;


@serify('log')
class LogService extends BaseService<StoreCenter, ServiceCore> {
  private fs = wx.getFileSystemManager();
  
  private indexList: LogInfo[] = []
  private waitList: WaitInfo[] = [];
  private isLoading = false;

  /**
   * 服务初始化事件
   */
  onStart() {
    // this.initLog();
    // this.onEvent(EVENT.ADD_LOG, this.addLog);
    // this.addLog(`INFO ${formatTime(new Date(), {second: true, year: true})} APP::VERSION: ${config.appVersion}`);
  }

  /**
   * 上传日志文件
   */
  public async postLogFile() {
    try {
      let file = await this.$service.http.uploadFile(FILE_PATH);
      await this.$service.http.post(HttpApi.UploadLog, {
        type: 1, // 表示小程序 0 表示 app
        file
      });
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 添加日志
   * @param content 日志内容
   */
  public addLog(content: string) {
    content += '\n';
    const len = util.getByteLen(content);

    if (this.isLoading) {
      this.addToWaitList(content, len);
      return;
    }

    this.isLoading = true;

    this.fs.getFileInfo({
      filePath: FILE_PATH,
      success: (res) => {
        this.addToIndexList(res.size, len);
        this.fs.appendFileSync(FILE_PATH, content, UTF8);

        this.fixLogSize();
        this.isLoading = false;
        this.writeWaitList();
        this.saveIndex();
      }
    })
  }

  /**
   * 清空日志
   */
  public clearLog() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.indexList = [];
    this.saveIndex()
    this.fs.writeFileSync(FILE_PATH, '\n', UTF8);
    this.isLoading = false;
  }


  private initLog() {
    this.isLoading = true;

    try {
      this.fs.accessSync(FILE_PATH);
    } catch (error) {
      this.fs.writeFileSync(FILE_PATH, '\n', UTF8);
    }

    const list = wx.getStorageSync(INDEX_KEY);
    if (!list) {
      wx.setStorageSync(INDEX_KEY, this.indexList);
    } else {
      this.indexList = list as LogInfo[];
    }

    this.isLoading = false;
  }

  
  private addToIndexList(start: number, len: number) {
    this.indexList.unshift({
      start,
      len
    });
  }

  private saveIndex() {
    wx.setStorage({
      key: INDEX_KEY,
      data: this.indexList
    })
  }

  private addToWaitList(content: string, len: number) {
    this.waitList.push({
      content,
      len
    })
  }

  private writeWaitList() {
    if (this.waitList.length === 0 || this.isLoading) {
      return;
    }

    this.isLoading = true;

    const data = this.waitList.shift();
    if (!data) return;

    this.fs.getFileInfo({
      filePath: FILE_PATH,
      success: (res) => {
        this.addToIndexList(res.size, data.len);
        this.fs.appendFileSync(FILE_PATH, data.content, UTF8);
        this.isLoading = false;
        this.writeWaitList();
      }
    })
  }

  private fixLogSize() {
    if (this.indexList.length < MAX_LINE) {
      return;
    }

    this.indexList.length = FIX_LINE;
    const data = this.indexList[this.indexList.length-1];
    // @ts-ignore
    const res = this.fs.readFileSync(FILE_PATH, UTF8, data.start);
    this.fs.writeFileSync(FILE_PATH, res, UTF8);
    this.indexList.forEach(item => {
      item.start -= data.start;
    });
  }
}

export const log = getService('log') as LogService

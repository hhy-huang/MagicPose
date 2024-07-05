
const fs = wx.getFileSystemManager && wx.getFileSystemManager();

export class ImageList {
  private data: string[] = [];

  public get length() {
    return this.data.length;
  }

  public set length(val) {
    this.data.length = val;
  }

  public get urls() {
    return this.data;
  }

  public setItem(index: number, src: string) {
    if (!index || !src) return;

    // 去重
    if (src.indexOf('http') === 0 && this.data.includes(src)) {
      let i, c;
      let newSrc = '';
      for (i = 0; c = src[i]; i++) {
        if (c === '/' && src[i - 1] !== '/' && src[i + 1] !== '/') break;
        newSrc += Math.random() > 0.5 ? c.toUpperCase() : c;
      }
      
      newSrc += src.substr(i);
      this.data[index] = newSrc;
      return;
    }

    this.data[index] = src;

    // 暂存 data src
    if (src.includes('data:image')) {
      console.warn(src)
      let info = src.match(/data:image\/(\S+?);(\S+?),(.+)/);
      if (!info) return;
      let filePath = `${wx.env.USER_DATA_PATH}/${Date.now()}.${info[1]}`;
      fs && fs.writeFile({
        filePath,
        data: info[3],
        // @ts-ignore
        encoding: info[2],
        success: () => {
          this.data[index] = filePath
        }
      })
    }
  }

  public clear() {
    for (const item of this.data) {
      if (item && item.includes(wx.env.USER_DATA_PATH) && fs) {
        fs.unlink({ filePath: item });
      }
    }

    this.data.length = 0;
  }

  public each(f: Function) {
    for (let i = 0; i < this.data.length; i++) {
      this.setItem(i, f(this.data[i], i, this));
    }
  }
} 
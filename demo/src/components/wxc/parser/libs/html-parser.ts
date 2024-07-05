/******************************************
 * html 解析器
 * @tutorial https://github.com/jin-yufeng/Parser
 * @author JinYufeng
 * @listens MIT
 ******************************************/
/* eslint-disable no-case-declarations */
/* eslint-disable no-return-assign */
/* eslint-disable complexity */
import { config } from "./config";
import { CssHandler } from "./css-handler";

const blankChar = config.blankChar;
const windowWidth = wx.getSystemInfoSync().windowWidth;

export class HtmlParser {
  private attrs: IAnyObject = {};
  private cssHanlder: CssHandler;
  private data: string;
  private domain: string;
  private DOM = [];
  private i = 0;
  private start = 0;
  private imgNum = 0;
  private audioNum = 0;
  private videoNum = 0;
  private options: HTML_PARSE_OPTIONS;
  private state: Function;
  private STACK: HTML_NODE[] = []
  private pre?: boolean;
  private _tagName: string = '';
  private _attrName: string = '';
  private _attrValue: string = '';

  constructor(data: string, options: HTML_PARSE_OPTIONS) {
    this.cssHanlder = new CssHandler(options.tagStyle);
    this.data = data;
    this.options = options;
    this.domain = options.domain;
    options.protocol = (this.domain || '').includes('://') ? this.domain.split('://')[0] : 'http';
    this.state = this.text;
  }

  public bubble() {
    for (let i = this.STACK.length, item; item = this.STACK[--i];) {
      // @ts-ignore
      if (config.richOnlyTags[item.name]) {
        return false;
      }
      item.c = 1;
    }

    return true;
  }

  public decode(val: string, amp?: string) {
    let i = -1;
    let j, en;

    while (true) {
      if ((i = val.indexOf('&', i+1)) === -1) break;
      if ((j = val.indexOf(';', i+2)) === -1) break;

      if (val[i+1] === '#') {
        en = parseInt((val[i+2] === 'x' ? '0' : '') + val.substring(i+2, j));
        if (!isNaN(en)) {
          val = val.substring(0, i) + String.fromCharCode(en) + val.substr(j+1);
        }
      } else {
        en = val.substring(i+1, j);
        // @ts-ignore
        if (config.entities[en] || en === amp) {
          // @ts-ignore
          val = val.substr(0, i) + (config.entities[en] || '&') + val.substr(j+1);
        }
      }
    }

    return val;
  }

  public getUrl(url: string) {
    if (url[0] === '/') {
      if (url[1] === '/') {
        url = this.options.protocol + ':' + url;
      } else if (this.domain) {
        url = this.domain + url;
      }
    } else if (this.domain && url.indexOf('data:') !== 0 && !url.includes('://')) {
      url = this.domain + '/' + url;
    }

    return url;
  }

  public isClose() {
    return this.data[this.i] === '>' || (this.data[this.i] === '/' && this.data[this.i+1] === '>');
  }

  public section() {
    return this.data.substring(this.start, this.i);
  }

  public parent() {
    return this.STACK[this.STACK.length-1];
  }

  public siblings() {
    return this.STACK.length ? this.parent().children : this.DOM;
  }


  public parse() {
    for (let c; c = this.data[this.i]; this.i++) {
      this.state(c);
    }

    if (this.state === this.text) {
      this.setText();
    }

    while (this.STACK.length) {
      this.popNode(this.STACK.pop()!);
    }

    return this.DOM;
  }

  /**
   * 设置属性
   */
  private setAttr() {
    let name = this._attrName.toLowerCase();
    let val = this._attrValue;
    if (config.boolAttrs[name]) {
      this.attrs[name] = 'T';
    } else if (val) {
      if (name === 'src' || (name === 'data-src' && !this.attrs.src)) {
        this.attrs.src = this.getUrl(this.decode(val, 'amp'));
      } else if (name === 'href' || name === 'style') {
        this.attrs[name] = this.decode(val, 'amp');
      } else if (name.substr(0, 5) !== 'data-') {
        this.attrs[name] = val;
      }
    }

    this._attrValue = '';
    while (blankChar[this.data[this.i]]) {
      this.i++;
    }

    if (this.isClose()) {
      this.setNode();
    } else {
      this.start = this.i;
      this.state = this.attrName;
    }
  }

  /**
   * 设置文本节点
   */
  private setText() {
    let back;
    let text = this.section();
    if (!text) return;

    // @ts-ignore
    text = (config.onText && config.onText(text, () => { back = true; })) || text;

    if (back) {
      this.data = this.data.substr(0, this.start) + text + this.data.substr(this.i);
      let j = this.start + text.length;
      for (this.i = this.start; this.i < j; this.i++) {
        this.state(this.data[this.i]);
      }
      return;
    }

    if (!this.pre) {
      let flag;
      let tmp = [];

      for (let i = text.length, c; c = text[--i];) {
        if (!blankChar[c]) {
          tmp.unshift(c);
          if (!flag) {
            flag = 1;
          }
        } else {
          if (tmp[0] !== ' ') {
            tmp.unshift(' ');
          }

          if (c === '\n' && flag === undefined) {
            flag = 0;
          }
        }
      }

      if (flag === 0) return;
      text = tmp.join('');
    }

    this.siblings()!.push({
      type: 'text',
      text: this.decode(text)
    })
  }

  private setNode() {
    let node: HTML_NODE = {
      name: this._tagName.toLowerCase(),
      attrs: this.attrs
    }
    let close = config.selfClosingTags[node.name!];

    this.attrs = {};
    if (!config.ignoreTags[node.name!]) {
      let attrs = node.attrs!;
      let style = this.cssHanlder.match(node.name!, attrs) + (attrs.style || '');
      let styleObj: IAnyObject = {};

      if (attrs.id) {
        // @ts-ignore
        if (this.options.compress & 1) {
          attrs.id = undefined;
          // @ts-ignore
        } else if (this.options.useAnchor) {
          this.bubble();
        }
      }

      // @ts-ignore
      if ((this.options.compress & 2) && attrs.class) {
        attrs.class = undefined;
      }

      switch (node.name) {
        case 'a':
        case 'ad':
          this.bubble();
          break;
        case 'font':
          if (attrs.color) {
            styleObj['color'] = attrs.color;
            attrs.color = undefined;
          }
          if (attrs.face) {
            styleObj['font-family'] = attrs.face;
            attrs.face = undefined;
          }
          if (attrs.size) {
            // @ts-ignore
            let size = parseInt(attrs.size);
            if (size < 1) {
              size = 1;
            } else if (size > 7) {
              size = 7;
            }
            let map = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
            styleObj['font-size'] = map[size - 1];
            attrs.size = undefined;
          }
          break;
        case 'embed':
        case 'video':
        case 'audio':
          if (node.name === 'embed') {
            let src = node.attrs?.src || '';
            let type = node.attrs?.type || '';

            if (type.includes('video') || src.includes('.mp4') || src.includes('.3gp') || src.includes('.m3u8')) {
              node.name = 'video';
            } else if (type.includes('audio') || src.includes('.m4a') || src.includes('.wav') || src.includes('.mp3') || src.includes('.aac')) {
              node.name = 'audio';
            } else {
              break;
            }
            
            if (node.attrs?.autostart) {
              node.attrs!.autoplay = 'T';
            }

            node.attrs!.controls = 'T';
          }
        
          if (!attrs.id) {
            // @ts-ignore
            attrs.id = node.name + (++this[`${node.name}Num`]);
          } else {
            // @ts-ignore
            this[`${node.name}Num`]++;
          }

          if (node.name === 'video') {
            if (this.videoNum > 3) {
              node.lazyLoad = 1;
            }

            if (attrs?.width) {
              // @ts-ignore
              styleObj.width = parseFloat(attrs.width) + (attrs.width.includes('%') ? '%' : 'px');
              attrs.width = undefined;
            }
            if (attrs?.height) {
              // @ts-ignore
              styleObj.height = parseFloat(attrs.height) + (attrs.height.includes('%') ? '%' : 'px');
              attrs.height = undefined;
            }
          }
          if (!attrs.controls && !attrs.autoplay) {
            attrs.controls = 'T';
          }

          attrs.source = [];
          if (attrs.src) {
            // @ts-ignore
            attrs.source.push(attrs.src);
            attrs.src = undefined;
          }
          this.bubble();
          break;
        case 'td':
        case 'th':
          if (attrs.colspan || attrs.rowspan) {
            for (let k = this.STACK.length, item; item = this.STACK[--k];) {
              if (item.name === 'table') {
                item.flag = 1;
                break;
              }
            }
          }
      }

      if (attrs.align) {
        if (node.name === 'table') {
          if (attrs.align === 'center') { 
            styleObj['margin-inline-start'] = styleObj['margin-inline-end'] = 'auto';
          } else {
            styleObj['float'] = attrs.align;
          }
        } else {
          styleObj['text-align'] = attrs.align;
        }
        attrs.align = undefined;
      }
      // 压缩 style
      let styles = style.split(';');
      style = '';
      for (let i = 0, len = styles.length; i < len; i++) {
        let info = styles[i].split(':');
        if (info.length < 2) continue;
        let key = info[0].trim().toLowerCase();
        let value = info.slice(1).join(':').trim();
        if (value[0] === '-' || value.includes('safe')) {
          style += `;${key}:${value}`;
        } else if (!styleObj[key] || value.includes('import') || !styleObj[key].includes('import')) {
          styleObj[key] = value;
        }
      }

      if (node.name === 'img') {
        if (attrs.src && !attrs.ignore) {
          if (this.bubble()) {
            attrs.i = (this.imgNum++).toString();
          } else {
            attrs.ignore = 'T';
          }
        }
        if (attrs.ignore) {
          style += ';-webkit-touch-callout:none';
          styleObj['max-width'] = '100%';
        }
        let width;
        if (styleObj.width) {
          width = styleObj.width;
        } else if (attrs.width) {
          // @ts-ignore
          width = attrs.width.includes('%') ? attrs.width : parseFloat(attrs.width) + 'px';
        }
        if (width) {
          styleObj.width = width;
          attrs.width = '100%';
          if (parseInt(width) > windowWidth) {
            styleObj.height = '';
            if (attrs.height) {
              attrs.height = undefined;
            }
          }
        }
        if (styleObj.height) {
          attrs.height = styleObj.height;
          styleObj.height = '';
        } else if (attrs.height && !attrs.height.includes('%')) {
          // @ts-ignore
          attrs.height = parseFloat(attrs.height) + 'px';
        }
      }

      for (let key in styleObj) {
        let value = styleObj[key];
        if (!value) continue;

        if (key.includes('flex') || key === 'order' || key === 'self-align') {
          node.c = 1;
        }

        // 填充链接
        if (value.includes('url')) {
          let j = value.indexOf('(');
          if (j++ !== -1) {
            while (value[j] === '"' || value[j] === "'" || blankChar[value[j]]) j++;
            value = value.substr(0, j) + this.getUrl(value.substr(j));
          }
        // 转换rpx
        } else if (value.includes('rpx')) {
          value = value.replace(/[0-9.]+\s*rpx/g, ($: string) => parseFloat($) * windowWidth / 750 + 'px');
        } else if (key === 'white-space' && value.includes('pre') && !close) {
          this.pre = node.pre = true;
        }
        style += `;${key}:${value}`;
      }
      style = style.substr(1);
      if (style) {
        attrs.style = style;
      }

      if (!close) {
        node.children = [];
        if (node.name === 'pre' && config.highlight) {
          this.remove(node);
          this.pre = node.pre = true;
        }
        this.siblings()?.push(node);
        this.STACK.push(node);
      } else if (!config.filter || config.filter(node, this) !== false) {
        this.siblings()?.push(node);
      }
    } else {
      if (!close) {
        this.remove(node);
      } else if (node.name === 'source') {
        let parent = this.parent();
        // @ts-ignore
        if (parent && (parent.name === 'video' || parent.name === 'audio') && node.attrs.src) {
          // @ts-ignore
          parent.attrs.source.push(node.attrs!.src);
        }
      } else if (node.name === 'base' && !this.domain) {
        // @ts-ignore
        this.domain = node.attrs.href;
      }
    }

    if (this.data[this.i] === '/') {
      this.i++;
    }
    this.start = this.i + 1;
    this.state = this.text;
  }

  // 移除标签
  private remove(node: HTML_NODE) {
    let name = node.name;
    let j = this.i;

    let handleSvg = () => {
      let src = this.data.substring(j, this.i+1);
      node.attrs!.xmlns = 'http://www.w3.org/2000/svg';
      for (let key in node.attrs) {
        if (key === 'viewbox') {
          src = ` viewBox="${node.attrs.viewbox}"` + src;
        } else if (key !== 'style') {
          src = ` ${key}="${node.attrs[key]}"` + src;
        }
      }

      src = '<svg' + src;
      let parent = this.parent();
      if (node.attrs?.width === '100%' && parent && (parent.attrs?.style || '').includes('inline')) {
        parent.attrs!.style = 'width:300px;max-width:100%;' + parent.attrs?.style;
      }

      this.siblings()!.push({
        name: 'img',
        attrs: {
          src: 'data:image/svg+xml;utf8,' + src.replace(/#/g, '%23'),
          style: node.attrs?.style,
          ignore: 'T'
        }
      })
    }

    if (node.name === 'svg' && this.data[j] === '/') {
      this.i++;
      handleSvg();
      return;
    }

    while (true) {
      if ((this.i = this.data.indexOf('</', this.i+1)) === -1) {
        if (name === 'pre' || name === 'svg') {
          this.i = j;
        } else {
          this.i = this.data.length;
        }
        return;
      }

      this.start = (this.i += 2);
      while (!blankChar[this.data[this.i]] && !this.isClose()) {
        this.i++;
      }

      if (this.section().toLowerCase() === name) {
        // 代码款高亮
        if (name === 'pre') {
          // @ts-ignore
          this.data = this.data.substr(0, j + 1) + config.highlight(this.data.substring(j + 1, this.i - 5), node.attrs) + this.data.substr(this.i - 5);
          return this.i = j;
        } else if (name === 'style') {
          this.cssHanlder.getStyle(this.data.substring(j + 1, this.i - 7));
        } else if (name === 'title') {
          // @ts-ignore
          this.DOM.title = this.data.substring(j + 1, this.i - 7);
        }
        if ((this.i = this.data.indexOf('>', this.i)) === -1) {
          this.i = this.data.length;
        }
        if (name === 'svg') {
          handleSvg();
        }

        return;
      }
    }
  }

  // 节点出栈处理
  private popNode(node: HTML_NODE) {
    // 空白符处理
    if (node.pre) {
      node.pre = this.pre = undefined;
      for (let i = this.STACK.length; i--;) {
        if (this.STACK[i].pre) {
          this.pre = true;
        }
      }
    }

    let siblings = this.siblings()!;
    let len = siblings.length;
    let childs = node.children!;

    if (node.name === 'head' || (config.filter && config.filter(node, this) === false)) {
      return siblings.pop()!;
    }

    let attrs = node.attrs!;
    // 替换一些签名
    if (config.blockTags[node.name!]) {
      node.name = 'div';
    } else if (!config.trustTags[node.name!]) {
      node.name = 'span';
    }

    // 处理列表
    if (node.c && (node.name === 'ul' || node.name === 'ol')) {
      if ((node.attrs?.style || '').includes('list-style:none')) {
        for (let i = 0, child; child = childs[i++];) {
          if (child.name === 'li') {
            child.name = 'div';
          }
        }
      } else if (node.name === 'ul') {
        let floor = 1;
        for (let i = this.STACK.length; i--;) {
          if (this.STACK[i].name === 'ul') {
            floor++;
          }
        } 

        if (floor !== 1) {
          for (let i = childs.length; i--;) {
            // @ts-ignore
            childs[i].floor = floor;
          }
        }
      } else {
        for (let i = 0, num = 1, child; child = childs[i++];) {
          if (child.name === 'li') {
            child.type = 'ol';
            // @ts-ignore
            child.num = ((num, type) => {
              if (type === 'a') {
                return String.fromCharCode(97 + (num-1)%26);
              }
              if (type === 'A') {
                return String.fromCharCode(65+(num-1)%26);
              }
              if (type === 'i' || type === 'I') {
                num = (num - 1) % 99 + 1;
                let one = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
                let ten = ['X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'];
                let res = (ten[Math.floor(num / 10) - 1] || '') + (one[num % 10 - 1] || '');

                if (type === 'i') {
                  return res.toLowerCase();
                }
                return res;
              }

              return num;
            })(num++, attrs.type) + '.';
          }
        }
      }
    }

    // 处理表格
    if (node.name === 'table') {
      // @ts-ignore
      let padding = parseFloat(attrs.cellPadding);
      // @ts-ignore
      let spacing = parseFloat(attrs.cellSpacing);
      // @ts-ignore
      let border = parseFloat(attrs.border);

      if (node.c) {
        if (isNaN(padding)) {
          padding = 2;
        }

        if (isNaN(spacing)) {
          spacing = 2;
        }
      }

      if (border) {
        attrs.style = `border:${border}px solid gray;${attrs.style || ''}`;
      }

      if (node.flag && node.c) {
        // 有colspan 或 rowspan 且含有链接的表格转为grid布局实现
        node.flag = undefined;
        attrs.style = `${attrs.style || ''};display:grid${spacing ? `;grid-gap:${spacing}px;padding:${spacing}px` : ';border-left:0;border-top:0'}`;
        let row = 1;
        let col = 1;
        let colNum: number = 0;
        let trs = [];
        let children = [];
        let map: IAnyObject = {};

        (function f(ns: HTML_NODE[]) {
          for (let i=0; i<ns.length; i++) {
            if (ns[i].name === 'tr') {
              trs.push(ns[i]);
            } else {
              f(ns[i].children || []);
            }
          }
        })(node.children!);

        for (let i = 0; i < trs.length; i++) {
          for (let j = 0, td; td = trs[i].children![j]; j++) {
            if (td.name === 'td' || td.name === 'th') {
              while (map[row + '.' + col]) {
                col++;
              }

              let cell = {
                name: 'div',
                c: 1,
                attrs: {
                  style: (td.attrs?.style || '') + (border ? `;border:${border}px solid gray` + (spacing ? '' : ';border-right:0;border-bottom:0') : '') + (padding ? `;padding:${padding}px` : '')
                },
                children: td.children
              }

              if (td.attrs?.colspan) {
                // @ts-ignore
                cell.attrs.style += ';grid-column-start:' + col + ';grid-column-end:' + (col + parseInt(td.attrs.colspan));
                if (!td.attrs?.rowspan) {
                  cell.attrs.style += ';grid-row-start:' + row + ';grid-row-end:' + (row + 1);
                }

                // @ts-ignore
                col += parseInt(td.attrs.colspan) - 1;
              }

              if (td.attrs?.rowspan) {
                // @ts-ignore
                cell.attrs.style += ';grid-row-start:' + row + ';grid-row-end:' + (row + parseInt(td.attrs.rowspan));
                if (!td.attrs?.colspan) {
                  cell.attrs.style += ';grid-column-start:' + col + ';grid-column-end:' + (col + 1);
                }
                // @ts-ignore
                for (let k = 1; k < td.attrs.rowspan; k++) {
                  map[(row + k) + '.' + col] = 1;
                }
              }

              children.push(cell);
              col++;
            }
          }

          if (!colNum) {
            colNum = col - 1;
            attrs.style += `;grid-template-columns:repeat(${colNum},auto)`;
          }

          col = 1;
          row++;
        }
        node.children = children;
      } else {
        if (node.c) {
          attrs.style = (attrs.style || '') + ';display:table';
        }

        attrs.style = `border-spacing:${spacing}px;${attrs.style || ''}`;
        if (border || padding || node.c) {
          (function f(ns: HTML_NODE[]) {
            for (let i = 0, n; n = ns[i]; i++) {
              if (n.type === 'text') {
                continue;
              }
              
              let style = n.attrs?.style || '';
              if (node.c && n.name![0] === 't') {
                n.c = 1;
                style += ';display:table-' + (n.name === 'th' || n.name === 'td' ? 'cell' : (n.name === 'tr' ? 'row' : 'row-group'));
              }

              if (n.name === 'th' || n.name === 'td') {
                if (border) {
                  style = `border:${border}px solid gray;${style}`;
                }
                if (padding) {
                  style = `padding:${padding}px;${style}`;
                }
              } else {
                f(n.children || []);
              }

              if (style) {
                n.attrs!.style = style;
              }
            }
          })(childs);
        }
      }

      // @ts-ignore
      if (this.options.autoscroll) {
        let table = Object.assign({}, node);
        node.name = 'div';
        node.attrs = {
          style: 'overflow:scroll'
        }
        node.children = [table];
      }
    }
    
    // @ts-ignore
    this.cssHanlder.pop && this.cssHanlder.pop(node);

    // 自动压缩
    if (node.name === 'div' && !Object.keys(attrs).length && childs.length === 1 && childs[0].name === 'div') {
      siblings[len-1] = childs[0];
    }

    return null;
  }

  private text(c: string) {
    if (c === '<') {
      let next = this.data[this.i+1];
      let isLetter = (char: string) => (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');

      if (isLetter(next)) {
        this.setText();
        this.start = this.i+1;
        this.state = this.tagName;
      } else if (next === '/') {
        this.setText();
        if (isLetter(this.data[++this.i+1])) {
          this.start = this.i+1;
          this.state = this.endTag;
        } else {
          this.comment();
        }
      } else if (next === '!' || next === '?') {
        this.setText();
        this.comment();
      }
    }
  }

  private comment() {
    let key;
    if (this.data.substring(this.i+2, this.i+4) === '--') {
      key = '-->';
    } else if (this.data.substring(this.i+2, this.i+9) === '[CDATA[') {
      key = ']]>';
    } else {
      key = '>';
    }

    if ((this.i = this.data.indexOf(key, this.i+2)) === -1) {
      this.i = this.data.length;
    } else {
      this.i += key.length - 1;
    }

    this.start = this.i + 1;
    this.state = this.text;
  }

  private tagName(c: string) {
    if (blankChar[c]) {
      this._tagName = this.section();
      while (blankChar[this.data[this.i]]) {
        this.i++;
      }

      if (this.isClose()) {
        this.setNode();
      } else {
        this.start = this.i;
        this.state = this.attrName;
      }
    } else if (this.isClose()) {
      this._tagName = this.section();
      this.setNode();
    }
  }

  private attrName(c: string) {
    if (c === '=' || blankChar[c] || this.isClose()) {
      this._attrName = this.section();
      if (blankChar[c]) {
        while (blankChar[this.data[++this.i]]);
      }

      if (this.data[this.i] === '=') {
        while (blankChar[this.data[++this.i]]);
        this.start = this.i--;
        this.state = this.attrValue;
      } else {
        this.setAttr();
      }
    }
  }

  private attrValue(c: string) {
    if (c === '"' || c === "'") {
      this.start++;
      if ((this.i = this.data.indexOf(c, this.i+1)) === -1) {
        this.i = this.data.length;
        return;
      }

      this._attrValue = this.section();
      this.i++;
    } else {
      for (; !blankChar[this.data[this.i]] && !this.isClose(); this.i++);
      this._attrValue = this.section();
    }

    this.setAttr();
  }

  private endTag(c: string) {
    if (blankChar[c] || c === '>' || c === '/') {
      let name = this.section().toLowerCase();

      let i: number;
      for (i = this.STACK.length; i--;) {
        if (this.STACK[i].name === name) break;
      }

      if (i !== -1) {
        let node: HTML_NODE;
        while ((node = this.STACK.pop()!).name !== name) {
          this.popNode(node);
        }
        this.popNode(node);
      } else if (name === 'p' || name === 'br') {
        this.siblings()!.push({
          name,
          attrs: {}
        })
      }

      this.i = this.data.indexOf('>', this.i);
      this.start = this.i + 1;
      if (this.i === -1) {
        this.i = this.data.length;
      } else {
        this.state = this.text;
      }
    }
  }
}


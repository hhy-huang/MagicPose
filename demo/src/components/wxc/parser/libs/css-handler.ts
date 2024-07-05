/****************************************************************
 * css 解析
 * 原作者：jin-yufeng
 * 
 * FIX:
 * - comma 解析由name改为space 
 ****************************************************************/
import { config } from "./config";

function isLetter(c: any) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

export class CssHandler {
  private styles: IAnyObject;

  constructor(tagStyle: IAnyObject) {
    let styles = Object.assign(Object.create(null), config.userAgentStyles);

    for (const item in tagStyle) {
      styles[item] = (styles[item] ? `${styles[item]};` : '') + tagStyle[item];
    }

    this.styles = styles;
  }

  public getStyle(data: string) {
    this.styles = new Parser(data, this.styles).parse();
  }

  public print() {
    console.log(this.styles);
  }

  public match(name: string, attrs: IAnyObject) {
    let tmp = this.styles[name];
    let matched = tmp ? `${tmp};` : '';

    // class 选择器
    if (attrs.class) {
      let items = attrs.class.split(' ');
      for (const item of items) {
        tmp = this.styles['.'+item];
        if (tmp) {
          matched += `${tmp};`;
        }
      }
    }

    // id 选择器
    tmp = this.styles[`#${attrs.id}`];
    if (tmp) {
      matched += `${tmp};`;
    }

    return matched;
  }
}

class Parser {
  private data: string;
  private res: IAnyObject;
  /** 状态机 */
  private state: Function;
  private floor = 0;
  private start = 0;
  private i = 0;
  private list: string[] = [];

  constructor(data: string, init: IAnyObject) {
    this.data = data;
    this.res = init;
    this.state = this.space;
  }

  public parse() {
    let c = this.data[this.i];
    while (c) {
      this.state(c);

      this.i++;
      c = this.data[this.i]
    }

    return this.res;
  }

  public section() {
    return this.data.substring(this.start, this.i);
  }

  public space(c: string) {
    if (c === '.' || c === '#' || isLetter(c)) {
      this.start = this.i;
      this.state = this.name;
    } else if (c === '/' && this.data[this.i + 1] === '*') {
      this.comment();
    } else if (!config.blankChar[c] && c !== ';') {
      this.state = this.ignore;
    }
  }

  /**
   * 注释
   */
  public comment() {
    this.i = this.data.indexOf('*/', this.i) + 1;
    if (!this.i) {
      this.i = this.data.length;
    }
    this.state = this.space;
  }

  public ignore(c: string) {
    if (c === '{') {
      this.floor++;
    } else if (c === '}' && !--this.floor) {
      this.list = [];
      this.state = this.space;
    }
  }

  /** 样式名 */
  public name(c: string) {
    if (config.blankChar[c]) {
      this.list.push(this.section());
      this.state = this.nameSpace;
    } else if (c === '{') {
      this.list.push(this.section());
      this.content();
    } else if (c === ',') {
      this.list.push(this.section());
      this.comma();
    } else if (!isLetter(c) && (c < '0' || c > '9') && c !== '-' && c !== '_') {
      this.state = this.ignore;
    }
  }

  public nameSpace(c: string) {
    if (c === '{') {
      this.content();
    } else if (c === ',') {
      this.comma();
    } else if (!config.blankChar[c]) {
      this.state = this.ignore;
    }
  }

  /**
   * 逗号
   */
  public comma() {
    while (config.blankChar[this.data[++this.i]]);

    if (this.data[this.i] === '{') {
      this.content();
    } else {
      this.start = this.i--;
      this.state = this.space;
    }
  }

  /**
   * 样式内容
   */
  public content() {
    this.start = ++this.i;
    if ((this.i = this.data.indexOf('}', this.i)) === -1) {
      this.i = this.data.length;
    }

    let content = this.section();
    content = content.replace(/\n|^\s+|\s+$/gm, '');

    for (const item of this.list) {
      if (this.res[item]) {
        this.res[item] += `;${content}`;
      } else {
        this.res[item] = content;
      }
    }

    this.list = [];
    this.state = this.space;
  }
}
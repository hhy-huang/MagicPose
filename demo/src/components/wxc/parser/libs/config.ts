/* 配置文件 */

// 高基础库标识，用于兼容
const canIUse = wx.canIUse('editor'); 

export const config = {
  // 出错占位图
  errorImg: null,
  // 过滤器函数
  filter: function(node: IAnyObject, cxt: Context): boolean {
    // 使得 pre 不被 rich-text 包含（为实现长按复制）
    if (node.name === 'pre') {
      cxt.bubble();
    }

    // 处理属性
    if (node.name === 'img-grid') {
      cxt.bubble();

      console.info('img-grid', JSON.stringify(node))

      let urls = (node.attrs['imgs'] as string || '').split(',').map(val => cxt.getUrl(cxt.decode(val, 'amp')));
      node.attrs.source = urls;
      node.attrs.start = cxt.imgNum;
      cxt.imgNum += urls.length;
    }

    // markdown 表格间隔背景色
    if (node.name === 'table' && (cxt.options.tagStyle || {}).table) {
      let arr = node.children[1].children;
      for (let i = 1; i < arr.length; i += 2) {
        arr[i].attrs.style = 'background-color:#f6f8fa';
      }
    }
    return true;
  },
  // 代码高亮函数
  highlight: function (content: string, attrs: IAnyObject) {
    return content;
  },
  // 文本处理函数
  onText: function(text: string, hasTag: Function) {
    text = text.replace(/^\x09/gm, ('&nbsp;').repeat(4));
    text = text.replace(/^\x20+/gm, (item) => ('&nbsp;').repeat(item.length));

    return text;
  },
  /** 实体编码列表 */
  entities: {
    quot: '"',
    apos: "'",
    semi: ';',
    nbsp: '\xA0',
    ndash: '–',
    mdash: '—',
    middot: '·',
    lsquo: '‘',
    rsquo: '’',
    ldquo: '“',
    rdquo: '”',
    bull: '•',
    hellip: '…'
  },
  /** 空白字符 */
  blankChar: makeMap(' ,\xA0,\t,\r,\n,\f'),
  boolAttrs: makeMap('autoplay,autostart,controls,ignore,loop,muted'),
  /** 块级标签，将被转为 div */
  blockTags: makeMap('address,article,aside,body,caption,center,cite,footer,header,html,nav,section' + (canIUse ? '' : ',pre')),
  /** 将被移除的标签 */
  ignoreTags: makeMap('area,base,canvas,frame,iframe,input,link,map,meta,param,script,source,style,svg,textarea,title,track,wbr' + (canIUse ? ',rp' : '')),
  /** 只能被 rich-text 显示的标签 */
  richOnlyTags: makeMap('a,colgroup,fieldset,legend' + (canIUse ? ',bdi,bdo,rt,ruby' : '')),
  /** 自闭合的标签 */
  selfClosingTags: makeMap('img-grid,area,base,br,col,circle,ellipse,embed,frame,hr,img,input,line,link,meta,param,path,polygon,rect,source,track,use,wbr'),
  /** 信任的标签 */
  trustTags: makeMap('img-grid,a,abbr,ad,audio,b,blockquote,br,code,col,colgroup,dd,del,dl,dt,div,em,fieldset,h1,h2,h3,h4,h5,h6,hr,i,img,ins,label,legend,li,ol,p,q,source,span,strong,sub,sup,table,tbody,td,tfoot,th,thead,tr,title,ul,video' + (canIUse ? ',bdi,bdo,caption,pre,rt,ruby' : '')),
  /** 默认的标签样式 */
  userAgentStyles: {
    address: 'font-style:italic',
    big: 'display:inline;font-size:1.2em',
    blockquote: 'background-color:#f6f6f6;border-left:3px solid #dbdbdb;color:#6c6c6c;padding:5px 0 5px 10px',
    caption: 'display:table-caption;text-align:center',
    center: 'text-align:center',
    cite: 'font-style:italic',
    dd: 'margin-left:40px',
    mark: 'background-color:yellow',
    pre: 'font-family:monospace;white-space:pre;overflow:scroll',
    s: 'text-decoration:line-through',
    small: 'display:inline;font-size:0.8em',
    u: 'text-decoration:underline'
  }
}


function makeMap(str: string) {
  let map = Object.create(null);
  let list = str.split(',');

  for (const name of list) {
    map[name] = true;
  }
    
  return map;
}
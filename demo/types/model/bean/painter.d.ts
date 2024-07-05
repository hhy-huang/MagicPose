declare namespace Painter {
   interface IView {
    type: "rect" | "text" | "image" | "qrcode";
    text?: string;
    url?: string;
    id?: string;
    content?: string;
    /** 事实上painter中view的css属性并不完全与CSSProperties一致。 */
    /** 有一些属性painter并不支持，而当你需要开启一些“高级”能力时，属性的使用方式也与css规范不一致。 */
    /** 具体的区别我们将在下方对应的view介绍中详细讲解，在这里使用CSSProperties仅仅是为了让你享受代码提示 */
    css: CSSProperties;
  }

  interface IPalette {
    background: string; // 整个模版的背景，支持网络图片的链接、纯色和渐变色
    width: string;
    height: string;
    borderRadius?: string;
    views: Array<IView>;
  }

  interface CSSProperties {
    width?: string;
    height?: string;
    mode?: 'aspectFill' | 'scaleToFill';

    fontSize?: string;
    color?: string;
    maxLines?: string;
    lineHeight?: string;
    fontWeight?: string;
    textDecoration?: 'underline' | 'overline' | 'line-through';
    textStyle?: 'fill' | 'stroke';
    background?: string;
    padding?: string;
    textAlign?: 'left' | 'center' | 'right';

    rotate?: string;
    top?: string;
    right?: string;
    bottom?: string;
    left?: string; 

    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    borderStyle?: string;

    align?: 'left' | 'right' | 'center';
  }
}
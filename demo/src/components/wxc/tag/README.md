## wxc-tag
多个标签时使用wxc-tag-group来控制

### Props
> 红色表示需要双向绑定属性

|属性|是否必须|说明|类型|默认值|
|---|:--:|---|:--:|:--:|
|selectable|否|是否可选|boolean|false|
|<font color="red">value</font>|否|是否选中, selectable为`true`时有效|boolean|false|
|size|否|大小 可选值`large` `medium`|string|medium|
|color|否|标签颜色|string|-|
|plain|否|是否是空心样式|boolean|false|
|round|否|圆角样式 可选`none` `all` `left` `right`|string|none|
|text-color|否|文本颜色|string|white|
|text|否|文本内容|string|-|


### Slot
|名称|说明|
|---|---|
|-|自定义Tag显示内容|


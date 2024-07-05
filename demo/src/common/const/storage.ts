/*****************************************************************************
文件名: storage
作者: wowbox
日期: 2020-01-20
描述: 跨文件的StorageKey设置最好设置为常量
******************************************************************************/


export const StorageKey = {
  token: "",
  hasUpdate: "",
  debug: ""
}

for (const key in StorageKey) {
  // @ts-ignore
  StorageKey[key] = key;
}
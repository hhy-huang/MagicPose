
declare type ResponseInfo = {
  status: number,
  error: string,
  data: AnyObject
}

declare type MethodType = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'

declare type ErrorInfo = {
  code: number,
  msg: string
}

declare type FailFunc = (err: ErrorInfo) => void

declare type HttpRequestItem = {
  method: MethodType, 
  path: string, 
  data: AnyObject, 
  success?: Function, 
  fail?: FailFunc, 
  extend?:AnyObject
};
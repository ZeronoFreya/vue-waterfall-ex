// const Mock = require("mockjs");
import Mock from "mockjs";
import data from "./data";

interface IurlParam {
  [key: string]: string;
}
interface Ioptions {
  body: string | null;
  type: string;
  url: string;
}
interface Irs {
  [key: string]: string | number | boolean;
}

/**
 * 根据参数名获取参数值
 */
// function getParameter(url, name) {
//   const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
//   const r = url.match(reg);
//   if (r != null) return unescape(r[2]);
//   return null;
// }

/**
 * 获取URL中所有参数并返回参数对象
 * @param url 
 */
const urlParam2Obj: (url: string) => IurlParam = url => {
  const urlParamObj: IurlParam = {};
  if (/\?/.test(url)) {
    const paramStr = url.substring(url.indexOf("?") + 1);
    const paramArr = paramStr.split("&");
    paramArr.forEach(item => {
      const param = item.split("=");
      urlParamObj[param[0]] = param[1];
    });
  }
  return urlParamObj;
};

Mock.setup({
  timeout: '600-2000'
})

Mock.mock(/yande\/post/, "get", (params: Ioptions) => {
  const {limit=30, page=1} = urlParam2Obj(params.url);
  const start = (Number(page) - 1) * Number(limit);
  let rs: Irs[] = [];
  if (start < data.length) {
    let end = start + Number(limit);
    end = end > data.length ? data.length : end;
    rs = (data as any[]).slice(start, end);
  }
  return rs;
});

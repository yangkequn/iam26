
//PageCallbacks 存储了每个页面的回调函数
//如果多个请求同时发送，那么只有第一个访问会真正触发。其它页面则在得到数据后通过回调函数返回
const PageCallbacks: any = {};
//CallbackProduce 将回调函数添加到PageCallbacks中
//url: 请求的url
//setState: 回调函数
//返回值: 是否需要实际发送请求
export const CallbackProduce = (url: string, callback: Function | null): boolean => {
    if (!callback) return true;
    if (url in PageCallbacks && PageCallbacks[url].length > 0) {
        PageCallbacks[url].push(callback);
        return false;
    } else {
        PageCallbacks[url] = [callback];
        return true
    }
}
export const CallbackCancel = (url: string, callback: Function| null) => {
    if (!callback) return
    if (url in PageCallbacks) {
        PageCallbacks[url].splice(PageCallbacks[url].indexOf(callback), 1);
    }
}
export const CallbackComsum = (url: string, data: any): void => {
    if (!(url in PageCallbacks)) return
    //触发多个setState函数
    while (PageCallbacks[url].length > 0) {
        let cb = PageCallbacks[url].pop();
        if (typeof cb === "function") cb(data);
    }
}


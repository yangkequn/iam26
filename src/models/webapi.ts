import axios from "axios";
import { GetStorage, SaveStorage } from '../base/Storage';
import { Jwt } from "./Jwt";
import { CallbackProduce, CallbackCancel, CallbackComsum } from "./Webapi.callback";

export const JwtRequest = (headers = {}, jwt = Jwt.Get()) => {
    if (jwt.IsValid()) headers["Authorization"] = jwt.jwt;
    return axios.create({ headers });
};
//{ setState, transformer }: { setState: Function; transformer: Function }
export const Get = (url: string, setState: Function = null, dataTransform: Function = null, exceptionCallBack: Function = Jwt.SignOut, useCache: boolean = true) => {
    //已经有参数，则返回参数
    if (useCache) {
        let data = GetStorage(url, setState);
        if (data != null)
            return data;
    }
    //立刻填充数据，否则随着其它页面数据到来，会重新TakePageParam，无数据，又会重复提交请求        //添加回调方法
    //相同的请求正在进行，不重复提交
    if (!CallbackProduce(url, setState)) return;
    JwtRequest().get(url).then(
        rsb => {
            let data = rsb.data
            if (!!dataTransform && (typeof (dataTransform) === "function")) data = dataTransform(data);

            CallbackComsum(url, setState, data);
            useCache && SaveStorage(url, data);
        }
    ).catch(e => {
        CallbackCancel(url, setState);
        !!exceptionCallBack && exceptionCallBack(e)
    });
    return null;
};
//Load function load response data to data
export const Load = (url: string, data: object, setState: Function) => {
    JwtRequest().get(url).then(rsb => {
        Merge(rsb.data, data);
        if (typeof setState === "function") setState(rsb.data)
    }).catch(Jwt.SignOut);
    return null;
};

export const Delete = (url: string, data: object, setState: Function = null) =>
    JwtRequest().delete(url, { data }).then(rsb => {
        Merge(rsb.data, data);
        if (typeof setState === "function") setState(rsb.data)
    }).catch(Jwt.SignOut)

export const Put = (url: string, data: object, setState: Function = null) => {
    JwtRequest().put(url, data).then(rsb => {
        Merge(rsb.data, data);
        if (typeof setState === "function") setState(rsb.data)
    }).catch(Jwt.SignOut)
}

export const Post = (url: string, data: object, setState: Function = null) =>
    JwtRequest().post(url, data).then(rsb => {
        Merge(rsb.data, data);
        if (typeof setState === "function") setState(rsb.data)
    }).catch(Jwt.SignOut)
//check whether 
const ObjectOfLastState = {}
export function ObjectVersionChanged(currentObject: object, key): boolean {
    const RefreshLocal = () => !!(ObjectOfLastState[key] = Object.assign({}, currentObject))

    if (!ObjectOfLastState[key]) return RefreshLocal()

    return JSON.stringify(ObjectOfLastState[key]) !== JSON.stringify(currentObject) && RefreshLocal()
}

export function Merge(src: object, target: object) {
    if (!src || !target) return;
    //assign properties of obj to this of type GoalItem
    //only properties of GoalItem is allowed
    for (let key in src) {
        if (target.hasOwnProperty(key) && (typeof target[key] === typeof src[key])) {
            target[key] = src[key];
        }
    }
}
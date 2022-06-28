//part1. functions access localstorage

export const SaveStorage = (url: string, data: any) => localStorage.setItem(url, JSON.stringify(data));
export const DelStorage = (key: string) => localStorage.removeItem(key);
export const GetStorage = (key: string, setState: Function | null = null): object | null => {
    let data = localStorage.getItem(key);
    let ret: object | null = null;
    if (data == null)
        return ret;
    try {
        ret = JSON.parse(data);
    } catch (e) {
        return ret;
    }
    if (!!setState) setState(ret);
    return ret;
};

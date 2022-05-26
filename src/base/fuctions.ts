export const now = (date = new Date()) => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
export const unixTime = ():number => Math.floor(new Date().getTime() / 1000)
export const NumberForHuman = v => v > 100000 ? v / 10000 + "万" : v
//when page is loading, many default empty corpus was created
//ensure they have different id, avoid their value cache into same key, and mis-recovered
export const TimePassed = (time: number): string => {
    let elapsedTime = (new Date().getTime() / 1000 - time)
    if (Math.floor(elapsedTime / 86400) >= 365.256) {
        return (elapsedTime / (86400 * 365.25)).toFixed(1) + '年前';
    } else if (Math.floor(elapsedTime / 86400) >= 30.44) {
        return (elapsedTime / (86400 * 30.44)).toFixed(1) + '月前';
    } else if (elapsedTime > 86400) {
        return (elapsedTime / (86400.)).toFixed(1) + '天前';
    } else {
        return (elapsedTime / (3600.)).toFixed(1) + '时前';
    }

}

export const IsASCII = (str: string): boolean => (/^[\x0-\x7F]*$/.test(str))

export const ParseQuery = (key: string = null, queryString: string = window.location.search): string | object => {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    if (key != null) {
        if (key in query) return query[key]
        return ""
    }
    return query;
}

export class TimeConverter {
    public static ISONow(): string { return TimeConverter.UnixTime2ISO(new Date().getTime() / 1000) }
    public static UnixTime2ISO(unixTm: number): string {
        var tm = new Date(unixTm * 1000);
        tm.setMinutes(tm.getMinutes() - tm.getTimezoneOffset());
        return tm.toISOString().slice(0, 16)
    }
    public static LocalISONowToUnixTime(time: string | number): number {
        if (typeof time == "number") return time

        var tm = new Date(time);
        var now = new Date();
        tm.setMinutes(tm.getMinutes() + now.getTimezoneOffset());
        return tm.getTime() / 1000;
    }

    public static TimePropertyFromUnix2ISO = obj => { if (!!obj["time"]) obj["time"] = TimeConverter.LocalISONowToUnixTime(obj["time"]); }
}

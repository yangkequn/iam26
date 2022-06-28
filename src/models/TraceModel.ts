import { Jwt } from './Jwt';
import { TimeConverter } from "../base/Fuctions"
import { Get } from "./Webapi";
import { TraceItem } from "./TraceItem";
import { MeasureItem } from "./MeasureItem";
import { ActItem } from "./ActItem";

//define interface according to TraceActMeasure
export interface ITraceModel {
    traceId: string,
    measureId: string | null,
    actId: string | null,
    name: string,
    unit: string,
    value: number,
    detail: string,
    memo: string,
    time: string,
    popularity: number,
    score: number
}

export class TraceModel implements ITraceModel {
    constructor(public traceId: string, public actId: string | null = "", public measureId: string | null = "",
        public name: string = "", public unit: string = "", public value: number = 5.6, public detail: string = "",
        public memo: string = "", public time: string = TimeConverter.ISONow(), public popularity: number = 0, public score: number = 0) {
    }

    Merge(obj: any) {
        //assign properties of obj to this of type TraceModel
        //only properties of TraceModel is allowed
        for (let key in obj) {
            if (this.hasOwnProperty(key)) (this as any)[key] = obj[key];

        }
    }

    private static getUrl: string = `/api/trace`;
    public static Get = (setState: Function): void => {

        const Transformer = (list: TraceItem[]): TraceModel[] => {
            var list_ = list.map((item: TraceItem) => {
                var trace = new TraceModel(item.traceId, item.actId, item.measureId)
                trace.value = item.value
                trace.time = TimeConverter.UnixTime2ISO(item.time)
                trace.memo = item.memo
                return trace
            })
            return list_
        }
        Get(TraceModel.getUrl, setState, Transformer, Jwt.SignOut, false)
    }
    public Save = (setUpdateTM: Function) => {
        const Merge = (o: MeasureItem | ActItem | TraceItem) => { this.Merge(o); setUpdateTM(new Date().getTime()); }
        !!this.measureId && MeasureItem.From(this).Put(Merge)
        !!this.actId && ActItem.From(this).Put(Merge)
        !!this.traceId && TraceItem.From(this).Put(Merge)
    }
    public Delete = (callback: Function) => !!this.traceId && TraceItem.From(this).Delete(callback)


}
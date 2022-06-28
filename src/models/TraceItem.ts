import { TimeConverter } from '../base/Fuctions';
import { Get, Delete, Put, ObjectVersionChanged } from "./Webapi";
export class Trace {
    private static urlTrace: `/api/trace`;
    public static GetTrace = (setState:Function) => Get(Trace.urlTrace, setState)
}

export interface ITraceItem { traceId: string; measureId: string | null; actId: string | null; value: number; time: number; memo: string; }
export class TraceItem implements ITraceItem {
    constructor(public traceId: string, public measureId: string | null, public actId: string | null, public value: number, public time: number, public memo: string) {
    }

    //convert obj to TraceItem
    // only properties of TraceItem is allowed
    public static From(obj: any): TraceItem {
        let tm = TimeConverter.LocalISONowToUnixTime(obj["time"])
        return new TraceItem(obj["traceId"], obj["measureId"], obj["actId"], Number(obj["value"]), tm, obj["memo"]);
    }

    private static getUrl = (id: string): string => `/api/traceItem?id=${id}`;
    public static Get = (id:string, setState:Function) => {
        !!id && Get(TraceItem.getUrl(id), (rsb:any) => setState(rsb.data))
    }

    private static url: string = `/api/traceItem`;
    private PutCheck = (): boolean => !!this.value && !!this.time && !!this.traceId
    public LocalVersionModified = (): boolean => ObjectVersionChanged(this, `TraceItem-${this.traceId}`)
    public Put = (setState:Function) => this.PutCheck() && this.LocalVersionModified() && Put(TraceItem.url, this, setState)
    public Delete =( setState:Function) => !!this.traceId && Delete(TraceItem.url, this, setState)

}

import { Get,Load,  Put,Delete, ObjectVersionChanged } from "./Webapi";

export interface IMeasureItem { measureId: string; name: string; unit: string; detail: string; popularity: number; score: number;mine:boolean }

export class MeasureItem implements IMeasureItem {

    constructor(public measureId: string, public name: string, public unit: string, public detail: string, public popularity: number, public score: number, public mine: boolean) {
    }

    public static From(obj: any): MeasureItem {
        //convert obj to MeasureItem
        // only properties of MeasureItem is allowed
        return new MeasureItem(obj["measureId"], obj["name"], obj["unit"], obj["detail"], obj["popularity"], obj["score"], obj["mine"]);
    }

    public LoadCheck = (): boolean =>  !(!this.measureId ||  this.measureId==="0")
    public Load = (setState:Function) => this.LoadCheck()&&Load(`/api/measure?id=${this.measureId}`,this, setState)

    private PutCheck = (): boolean => !!this.name && !!this.unit && !!this.measureId
    //LocalVersionModified can be call to avoid uncessary update
    public LocalVersionModified = (): boolean => ObjectVersionChanged(this, `MeasureItem-${this.measureId}`)
    public Put = (setState:Function) => this.PutCheck() && this.LocalVersionModified() && Put(`/api/measure`, this, setState)
    public Delete = (callback:Function) => !!this.measureId && Delete(`/api/measure`, this, callback )

    private static ListTransformer (data: any): MeasureItem[] {
        if (!data|| !data["list"]) return [];
        return data["list"].map((id: string): MeasureItem => new MeasureItem(id, "", "", "",  0,0, false ))
    } 
    public static MyList(setState:Function) {
        Get(`/api/measureList`, setState, MeasureItem.ListTransformer, undefined, false)
    }
    public  static  Recommend = (text:string, setState:Function) => Get( `/api/measureRecommend?text=${text}`, setState, MeasureItem.ListTransformer,undefined,false)
    public IsNew = (): boolean => !this.measureId || this.measureId === "0"

}
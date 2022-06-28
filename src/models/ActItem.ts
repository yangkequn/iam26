import { Get,Load,  Delete,Put,ObjectVersionChanged } from "./Webapi";

export interface IActItem { actId: string; name: string; unit: string; detail: string; popularity: number; score: number;mine:boolean }
export class ActItem implements IActItem {

    constructor(public actId: string, public name: string, public unit: string, public detail: string, public popularity: number, public score: number,public mine: boolean) {
    }

    public static From(obj: any): ActItem {
        //convert obj to ActItem
        // only properties of ActItem is allowed
        return new ActItem(obj["actId"], obj["name"], obj["unit"], obj["detail"], obj["popularity"], obj["score"], obj["mine"]);
    }

    public LoadCheck = (): boolean =>  !(!this.actId ||  this.actId==="0")
    public Load = (setState:Function) => this.LoadCheck()&&Load(`/api/act?id=${this.actId}`,this, setState)

    public LocalVersionModified=(): boolean => ObjectVersionChanged(this,`ActItem-${this.actId}`) 
    private PutCheck = (): boolean => !!this.name && !!this.unit && !!this.actId
    public Put = (setState: Function) => this.PutCheck()&&this.LocalVersionModified() &&Put( `/api/act`,this,setState) 
    public Delete = (callback:Function) => !!this.actId && Delete( `/api/act`, this, callback )

    private static ListTransformer (data: any): ActItem[] {
        if (!data|| !data["list"]) return [];
        return data["list"].map((id: string): ActItem => new ActItem(id, "", "", "", 0,0, false ))
    } 
    public static MyList(setState:Function) {
        Get(`/api/actList`, setState, ActItem.ListTransformer, undefined, false)
    }
    public  static  Recommend = (text:string, setState:Function) => Get( `/api/actRecommend?text=${text}`, setState, ActItem.ListTransformer,undefined,false)
    public IsNew = (): boolean => !this.actId || this.actId === "0"
}

import { Get,Load,  Delete,Put,ObjectVersionChanged } from "./Webapi";

export interface IActItem { actId: string; name: string; unit: string; detail: string; popularity: number; score: number;mine:boolean }
export class ActItem implements IActItem {

    constructor(public actId: string, public name: string, public unit: string, public detail: string, public popularity: number, public score: number,public mine: boolean) {
    }

    public static From(obj: object): ActItem {
        //convert obj to ActItem
        // only properties of ActItem is allowed
        return new ActItem(obj["actId"], obj["name"], obj["unit"], obj["detail"], obj["popularity"], obj["score"], obj["mine"]);
    }

    public LoadCheck = (): boolean =>  !(!this.actId ||  this.actId==="0")
    public Load = (setState) => this.LoadCheck()&&Load(`/api/act?id=${this.actId}`,this, setState)

    public LocalVersionModified=(): boolean => ObjectVersionChanged(this,`ActItem-${this.actId}`) 
    private PutCheck = (): boolean => !!this.name && !!this.unit && !!this.actId
    public Put = (setState: Function) => this.PutCheck()&&this.LocalVersionModified() &&Put( `/api/act`,this,setState) 
    public Delete = (callback:Function) => !!this.actId && Delete( `/api/act`, this, callback )

    private static ListTransformer (data: string[]): ActItem[] {
        if (!data|| !data["list"]) return [];
        return data["list"].map((id: string): ActItem => new ActItem(id, "", "", "", 0,0, false ))
    } 
    public static MyList(setState) {
        Get(`/api/actList`, setState, ActItem.ListTransformer, null, false)
    }
    public  static  Recommend = (text, setState) => Get( `/api/actRecommend?text=${text}`, setState, ActItem.ListTransformer,null,false)
    public IsNew = (): boolean => !this.actId || this.actId === "0"
}

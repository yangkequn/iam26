import { Get, Load, Put, Delete, ObjectVersionChanged } from "./Webapi";


export interface IGoalItem {
    id: string
    name: string
    detail: string
    benifites: string
    risk: string
    popularity: number
    mine: boolean
}
export class GoalItem implements IGoalItem {
    constructor(public id: string, public name: string, public detail: string, public benifites: string, public risk: string, public popularity: number, public mine: boolean) {
    }

    public static From(obj: any): GoalItem {
        //convert obj to GoalItem
        // only properties of GoalItem is allowed
        return new GoalItem(obj["id"], obj["name"], obj["detail"], obj["benifites"], obj["risk"], obj["popularity"], obj["mine"]);
    }
    public LoadCheck = (): boolean => !(!this.id || this.id === "0")
    public Load = (setState: Function) => this.LoadCheck() && Load(`${GoalItem.Url}?id=${this.id}`, this, setState)

    static Url: string = `/api/goal`;
    public LocalVersionModified = (): boolean => ObjectVersionChanged(this, `GoalItem-${this.id}`)
    private PutCheck = (): boolean => !!this.id && !!this.name && !!this.detail
    public Put = (setState: Function) => this.PutCheck() && this.LocalVersionModified() && Put(GoalItem.Url, this, setState)
    private static ListTransformer(data: any): GoalItem[] {
        if (!data || !data["list"]) return [];
        return data["list"].map((id: string): GoalItem => new GoalItem(id, "", "", "", "", 0, false))
    }
    public static Recommend(TextRequest:string, setState:Function) {
        Get(`/api/goalRecommend?text=${TextRequest}`, setState, GoalItem.ListTransformer, undefined, false)
    }
    public static MyList(setState:Function) {
        Get(`/api/goalList`, setState, GoalItem.ListTransformer, undefined, false)
    }
    public IsNew = (): boolean => !this.id || this.id === "0"

    public Delete = (callback: Function) => !!this.id && Delete(GoalItem.Url, this, callback)

}
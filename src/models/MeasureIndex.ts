import { Get,Load, Put, Delete, ObjectVersionChanged } from "./Webapi";

export interface IMeasureIndex {
	id: string
	user: string
	type: string
	data: Array<number>
	time: Array<number> // time tick, in milliseconds
	list: Array<string>
}


export class MeasureIndex implements IMeasureIndex {

	constructor(public id: string, public user: string, public type: string, public data: Array<number>, public time: Array<number>, public list: Array<string>) {
	}

    public static From(obj: object): MeasureIndex {
        //convert obj to MeasureIndex
        // only properties of MeasureIndex is allowed
        return new MeasureIndex(obj["id"], obj["user"], obj["type"], obj["data"], obj["time"], obj["list"]);
    }

    public LoadCheck = (): boolean =>  !(!this.id ||  this.id==="0")
    public Load = (setState) => this.LoadCheck()&&Load(`/api/measureIndex?id=${this.id}`,this, setState)

    private PutCheck = (): boolean => !!this.user && !!this.type && !!this.id && this.data.length>0 && this.time.length>0 && this.data.length===this.time.length
    //LocalVersionModified can be call to avoid uncessary update
    public LocalVersionModified = (): boolean => ObjectVersionChanged(this, `MeasureIndex-${this.id}`)
    public Put = (setState) => this.PutCheck() && this.LocalVersionModified() && Put(`/api/measure`, this, setState)
    //public Delete = (callback:Function) => !!this.id && Delete(`/api/MeasureIndex`, this, callback )

    public IsNew = (): boolean => !this.id || this.id === "0"

}


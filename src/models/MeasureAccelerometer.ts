import { Get, Load, Put, Delete, ObjectVersionChanged } from "./Webapi";

export interface IMeasureAccelerometer {
    id: string
    data: Array<number>
    list: Array<string>
}


export class MeasureAccelerometer implements IMeasureAccelerometer {

    constructor(public id: string, public data: Array<number>, public list: Array<string>) {
    }

    public static From(obj: object): MeasureAccelerometer {
        //convert obj to MeasureIndex
        // only properties of MeasureIndex is allowed
        return new MeasureAccelerometer(obj["id"], obj["data"],  obj["list"]);
    }

    public LoadCheck = (): boolean => !(!this.id || this.id === "0")
    public Load = (setState) => this.LoadCheck() && Load(`/api/measureAccelerometer?id=${this.id}`, this, setState)

    private PutCheck = (): boolean => !!this.id && this.data.length === 3*this.time.length
    //LocalVersionModified can be call to avoid uncessary update
    public LocalVersionModified = (): boolean => ObjectVersionChanged(this, `measureAccelerometer-${this.id}`)
    public Put = (setState) => this.PutCheck() && this.LocalVersionModified() && Put(`/api/measureAccelerometer`, this, setState)

    //public Delete = (callback:Function) => !!this.id && Delete(`/api/MeasureIndex`, this, callback )

    public IsNew = (): boolean => !this.id || this.id === "0"

}


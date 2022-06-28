import {  Put,  ObjectVersionChanged } from "./Webapi";

export interface IMeasureAccelerometerTraining {
    id: string
    data: string
    list: Array<string>
}


export class MeasureAccelerometerTraining implements IMeasureAccelerometerTraining {

    constructor(public id: string, public data: string, public list: Array<string>) {
    }

    public static From(obj: any): MeasureAccelerometerTraining {
        //convert obj to MeasureIndex
        // only properties of MeasureIndex is allowed
        return new MeasureAccelerometerTraining(obj["id"], obj["data"], obj["list"]);
    }

    public LoadCheck = (): boolean => !(!this.id || this.id === "0")
    private PutCheck = (): boolean => !!this.id
    //LocalVersionModified can be call to avoid uncessary update
    public LocalVersionModified = (): boolean => ObjectVersionChanged(this, `measureAccelerometer-${this.id}`)
    public Put = (setState:Function) => this.PutCheck() && this.LocalVersionModified() && Put(`/api/measureAccelerometerTraining`, this, setState)

    //public Delete = (callback:Function) => !!this.id && Delete(`/api/MeasureIndex`, this, callback )

    public IsNew = (): boolean => !this.id || this.id === "0"

}


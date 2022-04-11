import axios from "axios";
import { GetStorage, SaveStorage } from "../base/Storage";

export interface IJwt { sub: string | null, jwt: string | null, id: string | null, temporaryAccount: string | null, }
export class Jwt implements IJwt {
    public static LastGetJwtTime: number = 0;
    constructor(public sub: string | null, public jwt: string | null, public id: string | null, public temporaryAccount: string | null,) { }
    IsValid(): boolean { return !!this["jwt"] && !!this["id"] }

    public static Get = (jwt = GetStorage("jwt")): Jwt => Object.assign(new Jwt(null, null, null, null), jwt) as Jwt;
    public static Clear = (): void => { SaveStorage("jwt", new Jwt("", "", "", "")); Jwt.LastGetJwtTime = new Date().getTime() + Math.random(); };
    public static Save = (data: Jwt): void => { SaveStorage("jwt", data); Jwt.LastGetJwtTime = new Date().getTime() + Math.random(); };
    public static SaveOrClear = (data: object): void => {    
        let jwt=new Jwt(data["sub"], data["jwt"], data["id"], data["temporaryAccount"])
        jwt.IsValid() ? Jwt.Save(jwt) : Jwt.Clear();
    }
    public static UpdateJWT = (resetJWT: boolean = false, forceUpdate: boolean = false) => {

        if (resetJWT) Jwt.Clear();

        //if jwt stored in local storage,then use it
        if (!forceUpdate && Jwt.Get().IsValid()) return;
        //if not ,load Jwt from server
        let ws = window.screen, w = window;
        let s = { width: ws.width, height: ws.height, availWidth: ws.availWidth, availHeight: ws.availHeight };
        let p = { outerHeight: w.outerHeight, outerWidth: w.outerWidth, innerHeight: w.innerHeight, innerWidth: w.innerWidth };
        // @ts-ignore
        axios.get("/api/userJwt?" + new URLSearchParams({ ...p, ...s })).then(rsb => Jwt.SaveOrClear(rsb.data)).catch(e => setLoggedTime(false));
    };
    public static SignOut = (e: any): void => !!e.response && e.response.status === 401 && Jwt.UpdateJWT(true);
}
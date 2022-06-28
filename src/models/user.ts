

import { Get } from "./Webapi";

export class User {
    private static userUrl = (id: string): string => `/api/user?id=${id}`;
    public static avatarUrl = (id: string): string => `/api/userAvatar?id=${id}`;
    private static userAccountOccupiedUrl = (name: string): string => `/api/userAccountOccupied?name=${name}`;

    public static CheckAccountOccupied = (account: string, errorCallback: Function) => Get(User.userAccountOccupiedUrl(account),
        (data: any) => errorCallback && errorCallback(data.error),
        undefined,
        (error:any) => errorCallback("无法连接注册服务器"))
    public static GetUserName = (userID: string, setState: Function): void => { !!userID && Get(User.userUrl(userID), setState, (rsb:any) => rsb.name) }
};

export class ErrorObject {
    appid: string;
    center_id: string;
    userid: string;
    methodinfo: string;
    error: string;
    platform: string;

    constructor(appid, center_id, userid, methodinfo, error, platform) {
        this.appid = appid;
        this.center_id = center_id;
        this.userid = userid;
        this.methodinfo = methodinfo;
        this.error = error;
        this.platform = platform;
    }
}

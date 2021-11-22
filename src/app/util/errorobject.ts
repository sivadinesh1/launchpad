export class ErrorObject {
    appid: string;
    center_id: string;
    user_id: string;
    methodinfo: string;
    error: string;
    platform: string;

    constructor(appid, center_id, user_id, methodinfo, error, platform) {
        this.appid = appid;
        this.center_id = center_id;
        this.user_id = user_id;
        this.methodinfo = methodinfo;
        this.error = error;
        this.platform = platform;
    }
}

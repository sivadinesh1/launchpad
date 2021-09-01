export class ErrorObject {
  appid: string;
  centerid: string;
  userid: string;
  methodinfo: string;
  error: string;
  platform: string;



  constructor(appid, centerid, userid, methodinfo, error, platform) {
    this.appid = appid;
    this.centerid = centerid;
    this.userid = userid;
    this.methodinfo = methodinfo;
    this.error = error;
    this.platform = platform;
  }


}
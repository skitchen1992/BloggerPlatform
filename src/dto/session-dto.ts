export class SessionDTO {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  constructor(
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string,
  ) {
    this.ip = ip;
    this.title = title;
    this.lastActiveDate = lastActiveDate;
    this.deviceId = deviceId;
  }
}

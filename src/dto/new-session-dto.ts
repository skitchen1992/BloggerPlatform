
export class Session {

  constructor(
    public userId: string,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public tokenIssueDate: string,
    public tokenExpirationDate: string,
    public deviceId: string,
  ) {

  }
}

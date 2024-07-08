import { ObjectId } from 'mongodb';

export class Session {

  constructor(
    public _id: ObjectId,
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

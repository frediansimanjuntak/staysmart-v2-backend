import {AutoReject} from './reject_loi_ta';

export class Cron{
  static init ():void {
    AutoReject.autoRejectLetterOfIntent();
    AutoReject.autoRejectTenancyAgreement();
  }
}
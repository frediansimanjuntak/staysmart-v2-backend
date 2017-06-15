import {AutoReject} from './reject_loi_ta';
import {UserCron} from './user';

export class Cron{
  static init ():void {
    AutoReject.autoRejectLetterOfIntent();
    AutoReject.autoRejectTenancyAgreement();
    UserCron.autoDeleteBlacklistToken();
    AutoReject.autoRentedPropertyExpired();
  }
}
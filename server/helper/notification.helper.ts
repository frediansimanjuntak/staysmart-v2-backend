import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Agreements from '../api/v2/agreements/dao/agreements-dao';

export class companyHelper{
    static getNotif(notifications) {
        return new Promise((resolve:Function, reject:Function) => {
            Agreements.find().exec((err, res) => {
                let notification = [];
                let extra;
                for (var i = 0; i < notifications.length; i++) {
                    if (err) { extra = {}; }
                    else {
                        if (res.length == 0) { extra = {}; }
                        else {
                            let count = 0;
                            for (var j = 0; j < res.length; j++) {
                                if (notifications[i].ref_id == res[j]._id) {
                                    count += 1;
                                    if (res[j].letter_of_intent.data.created_at) {
                                        extra = { loi: 'LOIID'+notifications[i]._id };
                                        if (res[j].tenancy_agreement.data.created_at) {
                                            extra = { loi: 'LOIID'+notifications[i]._id, ta: 'TAID'+ notifications[i]._id};
                                            if (res[j].inventory_list.data.created_at) {
                                                extra = { loi: 'LOIID'+notifications[i]._id, ta: 'TAID'+notifications[i]._id, inv: 'INVENTORYID'+notifications[i]._id};
                                            }
                                        }
                                    }
                                    else { extra = {}; }            
                                }
                            }
                            if (count == 0) { extra = {}; }
                        }
                    }
                    notification.push({
                        _id: notifications[i]._id,
                        user_id: notifications[i].user._id,
                        message: notifications[i].message,
                        type: notifications[i].type,
                        ref_id: notifications[i].ref_id,
                        created_at: notifications[i].created_at,
                        read_at: notifications[i].read_at,
                        clicked: notifications[i].clicked,
                        user: {
                            _id: notifications[i].user._id,
                            username: notifications[i].user.username,
                            picture: notifications[i].user.picture ? notifications[i].user.picture.url : ''
                        },
                        extra: extra
                    });
                }
                resolve(notification);
            });
        });
    }
}
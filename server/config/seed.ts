/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/v2/users/dao/users-dao';

User
  .find({})
  .exec((err, user) => {
    if (err) {
      throw(err);
    }
    if (!user) {
      User.create({
            provider: 'local',
            username: 'master',
            password: 'master',
            email: 'master@master.com',
            role: 'admin',
          })
      .exec((err, result) => {
        if (err) { console.log(err); }
        else { console.log('finished populating users', result); }
      });
    }
    else {
      console.log('no need to seed');
    }
  });
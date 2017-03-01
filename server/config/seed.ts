/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/v1/users/dao/users-dao';

User
  .find({})
  .then(() => {
    User.create({
          provider: 'local',
          username: 'master',
          password: 'master',
          email: 'master@master.com',
          role: 'user',
        })
    .then(() => {
      console.log('finished populating users');
    });
  });

'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
export default {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/staysmart-revamp'
  },
  awsBucket: 'staysmart-revamp',

  dreamTalk: 'https://dt.shrimpventures.com',

  // Seed database on startup
  seedDB: true

};

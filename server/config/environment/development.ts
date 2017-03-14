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

  dream_talk: {
  	ws: 'wss://dt.shrimpventures.com/websocket',
    url: 'https://dt.shrimpventures.com/api/v1'
  },

  mailgun: {
    apiKey: 'key-00a073dfc3fb82ee2f4bea2be2696715',
    domain: 'sandbox024aadd07c004d32817a6f6fea399ca9.mailgun.org'
  },

  // dreamTalk: 'https://dt.shrimpventures.com',

  // Seed database on startup
  seedDB: true

};

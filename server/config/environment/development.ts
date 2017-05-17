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
  awsUrl: '.s3-ap-southeast-1.amazonaws.com/',

  dream_talk: {
  	ws: 'wss://dt.shrimpventures.com/websocket',
    url: 'https://dt.shrimpventures.com/api/v1'
  },
  // new ddp credential
  // dream_talk: {
  // 	ws: 'wss://dt-s.shrimpventures.com/websocket',
  //   url: 'https://dt-s.shrimpventures.com/api/v1'
  // },

  sms: {
    app_id: 'oLJ5MfvwtvjyvU0l',
    access_token: 'NnJhKemthvoyskWm'
  },

  mailgun: {
    apiKey: 'key-68ca5d110c068a55cf53afd4025a7b00',
    domain: 'sandbox2290d40ec2414e809fdd35fce8266c9b.mailgun.org'
  },

  url:{
    reset_password: 'http://ssnjs.shrimpventures.com/reset-password-email/',
    blog: 'http://ssnjs.shrimpventures.com/blog-view',
    blog_unsubscribe: 'http://ssnjs.shrimpventures.com/blog?unsubscribe=',
    blog_comment: '',
    approveProperty: '',
  },

  // dreamTalk: 'https://dt.shrimpventures.com',

  // Seed database on startup
  seedDB: true

};

'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*eslint no-process-env:0*/
// Development specific configuration
// ==================================
exports.default = {
    // MongoDB connection options
    mongo: {
        uri: 'mongodb://localhost/staysmart-revamp'
    },
    awsBucket: 'staysmart-revamp',
    // Seed database on startup
    seedDB: true
};
//# sourceMappingURL=development.js.map
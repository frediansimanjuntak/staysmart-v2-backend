/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
 exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['StaySmart-Revamp'],
  /**
   * Your New Relic license key.
   */
  license_key: 'ea6865292f748b2e482aa16dcd1b1381af13b636',
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'trace'
  }
}
// exports.config = {
//   /**
//    * Array of application names.
//    */
//   app_name : [process.env.NEW_RELIC_APP_NAME],
//   /**
//    * Your New Relic license key.
//    */
//   license_key : process.env.NEW_RELIC_LICENSE_KEY,
//   logging : {
//     *
//      * Level at which to log. 'trace' is most useful to New Relic when diagnosing
//      * issues with the agent, 'info' and higher will impose the least overhead on
//      * production applications.
     
//     level : 'trace'
//   } 
// };

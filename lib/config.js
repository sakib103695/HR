// =====================================================================
// FIXED APP CONFIGURATION
// ---------------------------------------------------------------------
// This deployment does not support environment variables, so all config
// lives here directly and is compiled into the app. To change any value
// (DB connection, admin login, session secret), edit it in THIS one file.
//
// Written as CommonJS so it works both for the Next.js app (import) and
// the plain Node scripts in /scripts (require).
//
// SECURITY NOTE: because these values are committed in source, anyone with
// access to this repository can read them. Keep the repo private, and scope
// the MongoDB user to only this database. Rotate the credentials if exposed.
// =====================================================================

module.exports = {
  // MongoDB Atlas
  MONGODB_URI:
    'mongodb+srv://fali87026_db_user:6XfzdgbOlxJZ8j8x@cluster0.aviyovd.mongodb.net/?appName=Cluster0',
  MONGODB_DB_NAME: 'hr_instaquirk',

  // Admin login (used to bootstrap / reset the admin account)
  ADMIN_EMAIL: 'instaquirk123@gmail.com',
  ADMIN_PASSWORD: 'Instaquirk@2026',

  // Secret used to sign the admin session cookie (HMAC). Keep it long + random.
  ADMIN_SESSION_SECRET: '46ae4970d0c76cb472055cab93e77b41e6fb84ddb00a369c560f5ad6024c9c14',
}

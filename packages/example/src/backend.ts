import {ServerDomain} from "@simpx/sync-core/src/server/server-domain";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {EmailPasswordAuthEngine} from "@simpx/sync-email-password-auth/src/email-password-auth-engine";
import {DatabaseMerger} from "@simpx/sync-database-merger/src/sync-database-merger";
import {ExpressRouterAdapter} from "@simpx/sync-express-router-adapter/src/sync-express-router";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import express from "express"

export async function backend() {
  const app = express();

  app.use(express.json());

  const databaseSyncDomain = new ServerDomain({
    databaseAdapter: new SqliteAdapter({
      databasePath: "./database.sqlite"
    }),
    prefix: "database",
    mergeEngine: new DatabaseMerger(),
  })

  await new ServerSyncEngine({
    domains: [databaseSyncDomain],
    routerAdapter: new ExpressRouterAdapter({ app, basePath: "sync" }),
    authEngine: new EmailPasswordAuthEngine({
      jwtSecret: "abacadabra"
    }),
    metadataDatabase: databaseSyncDomain.databaseAdapter,
  }).runSetup();

  app.listen(3000, () => {
    console.log("Listening on port 3000")
  })
}

backend()
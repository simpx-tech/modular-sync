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

  const syncEngine = await new ServerSyncEngine({
    domains: [databaseSyncDomain],
    routerAdapter: new ExpressRouterAdapter({ app, basePath: "sync" }),
    authEngine: new EmailPasswordAuthEngine({
      jwtSecret: "abacadabra"
    }),
    metadataDatabase: databaseSyncDomain.databaseAdapter,
  }).runSetup();

  // await syncEngine.authEngine.createUser({
  //   email: "test@gmail.com",
  //   password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" // 123456
  // })
  //
  // const { token } = await syncEngine.authEngine.authenticateUser({
  //   email: "test@gmail.com",
  //   password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" // 123456
  // });
  // console.log(token);
  //
  // await syncEngine.repositoryRepository.create({
  //   name: "test",
  //   user: 1,
  // })

  // await syncEngine.authEngine.deactivateUser({
  //   userId: 2,
  // });

  // await syncEngine.authEngine.activateUser({
  //   userId: 2,
  // });

  // const res = await syncEngine.authEngine.isAuthenticated("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwic3luY0FjdGl2YXRlZCI6MSwiaWF0IjoxNzAyNDc2ODc4fQ.jnG7gjKKnl6C2Qf5ubTMqfamY4_oCOttk5rGOtasGRg");
  // console.log(res);

  app.listen(3000, () => {
    console.log("Listening on port 3000")
  })
}

backend()
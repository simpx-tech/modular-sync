import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {ServerDomain} from "../../src/server/server-domain";
import {ExpressRouterAdapter} from "@simpx/sync-express-router-adapter/src/sync-express-router";
import {EmailPasswordAuthEngine} from "@simpx/sync-email-password-auth/src/email-password-auth-engine";
import express from "express";
import {DatabaseMerger} from "@simpx/sync-database-merger/src/sync-database-merger";
import {FieldStorageMethod} from "../../src/server/enums/field-storage-method";
import {Migration} from "../../src/interfaces/migration";
import {DatabaseAdapter, SchemaType} from "../../src/interfaces/database-adapter";
import {RepositoryFactory} from "../../src/common/repository-factory";

export function setupTests() {
  const dbPath = `./__tests__/data/${new Date().getTime()}.db`;
  const commonDb = new SqliteAdapter({ databasePath: dbPath });

  const test1Repository = RepositoryFactory.create("test_entity", {
    test: SchemaType.String,
    test2: SchemaType.String,
  });
  const test2Repository = RepositoryFactory.create("test_entity_2", {
    test: SchemaType.String,
    test2: SchemaType.String,
  });

  const domain = new ServerDomain({
    databaseAdapter: commonDb,
    mergeEngine: new DatabaseMerger(),
    fieldsStorageMethod: FieldStorageMethod.Unified,
    repositories: [test1Repository, test2Repository],
    name: "test-domain",
  });
  const authEngine = new EmailPasswordAuthEngine({ jwtSecret: "abacadabra" })

  const app = express();

  const routerAdapter = new ExpressRouterAdapter({ app, authEngine, basePath: "sync" });

  const syncEngine = new ServerSyncEngine({
    domains: [domain],
    routerAdapter,
    authEngine,
    metadataDatabase: commonDb,
  })

  return { app, routerAdapter, commonDb, domain, syncEngine, authEngine, dbPath }
}


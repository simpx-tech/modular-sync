import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {ServerDomain} from "../../src/server/server-domain";
import {ExpressRouterAdapter} from "@simpx/sync-express-router-adapter/src/sync-express-router";
import {EmailPasswordAuthEngine} from "@simpx/sync-email-password-auth/src/email-password-auth-engine";
import express from "express";
import {DatabaseMerger} from "@simpx/sync-database-merger/src/sync-database-merger";
import {FieldStorageMethod} from "../../src/server/enums/field-storage-method";
import {SchemaType} from "../../src/interfaces/database-adapter";
import {RepositoryFactory} from "../../src/common/repository-factory";
import * as crypto from "crypto";
import * as path from "path";

export function setupTests() {
  const dbPath = `${crypto.randomUUID()}.db`;
  const commonDb = new SqliteAdapter({ databasePath: path.join(__dirname, "../data", dbPath) });

  const test1Repository = RepositoryFactory.create("test_entity", {
    test: SchemaType.String,
    test2: SchemaType.String,
  });
  const test2Repository = RepositoryFactory.create("test_entity_2", {
    test: SchemaType.String,
    test2: SchemaType.String,
  });
  const test3Repository = RepositoryFactory.create("test_entity_3", {
    test: SchemaType.String,
    test2: SchemaType.Integer,
    test3: SchemaType.Boolean,
    test4: SchemaType.Date,
  }, { unique: ["test"] })

  const domain = new ServerDomain({
    databaseAdapter: commonDb,
    mergeEngine: new DatabaseMerger(),
    fieldsStorageMethod: FieldStorageMethod.Unified,
    repositories: [test1Repository, test2Repository, test3Repository],
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

  return { app, routerAdapter, commonDb, domain, syncEngine, authEngine, dbPath, test1Repository, test2Repository, test3Repository }
}


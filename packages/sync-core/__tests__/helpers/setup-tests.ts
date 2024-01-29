import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {ServerDomain} from "../../src/server/server-domain";
import {ExpressRouterAdapter} from "@simpx/sync-express-router-adapter/src/sync-express-router";
import {EmailPasswordAuthEngine} from "@simpx/sync-email-password-auth/src/email-password-auth-engine";
import express from "express";
import {DatabaseMerger} from "@simpx/sync-database-merger/src/sync-database-merger";
import {DynamicFieldsStrategy} from "../../src/server/enums/dynamic-fields-strategy";
import {SchemaType} from "../../src/interfaces/database-adapter";
import {RepositoryFactory} from "../../src/common/repository-factory";
import * as fs from "fs";
import * as crypto from "crypto";
import * as path from "path";
import * as os from "os";

export function __createTmpDirIfNotExists() {
  if (fs.existsSync(path.join(os.tmpdir(), "modular-sync-tmp"))) {
    return;
  }

  fs.mkdirSync(path.join(os.tmpdir(), "modular-sync-tmp"));
}

export function setupTests() {
  __createTmpDirIfNotExists();

  const dbPath = `${crypto.randomUUID()}.db`;
  const commonDb = new SqliteAdapter({ databasePath: path.join(os.tmpdir(), "modular-sync-tmp", dbPath) });

  const simpleRepository = RepositoryFactory.create("test_entity", {
    test: SchemaType.String,
    test2: SchemaType.String,
  });
  const simpleRepository2 = RepositoryFactory.create("test_entity_2", {
    test: SchemaType.String,
    test2: SchemaType.String,
  });
  const repositoryWithUnique = RepositoryFactory.create("test_entity_3", {
    test: SchemaType.String,
    test2: SchemaType.Integer,
    test3: SchemaType.Boolean,
    test4: SchemaType.Date,
  }, { unique: ["test"] })
  const repositoryWithUniqueNoMetadata = RepositoryFactory.create("test_entity_4", {
    test: SchemaType.String,
    test2: SchemaType.Integer,
    test3: SchemaType.Boolean,
    test4: SchemaType.Date,
  }, { unique: ["test"], isToIgnoreSyncFields: true });

  const domain = new ServerDomain({
    databaseAdapter: commonDb,
    mergeEngine: new DatabaseMerger(),
    dynamicFieldsStrategy: DynamicFieldsStrategy.Unified,
    repositories: [simpleRepository, simpleRepository2, repositoryWithUnique, repositoryWithUniqueNoMetadata],
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

  return { app, routerAdapter, commonDb, domain, syncEngine, authEngine, dbPath, simpleRepository, simpleRepository2, repositoryWithUnique, repositoryWithUniqueNoMetadata }
}


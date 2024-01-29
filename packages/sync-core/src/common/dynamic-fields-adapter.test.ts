import {ServerSyncEngine} from "../server/server-sync-engine";
import {RepositoryBase} from "./repository-base";
import {setupTests} from "../../__tests__/helpers/setup-tests";

describe("Repository", () => {
  let syncEngine: ServerSyncEngine;
  let repositoryWithUnique: RepositoryBase<any>;
  let repositoryWithUniqueNoMetadata: RepositoryBase<any>;

  beforeEach(async () => {
    ({syncEngine, repositoryWithUnique, repositoryWithUniqueNoMetadata} = setupTests());
    await syncEngine.runSetup()
  });

  describe('Unified Strategy', () => {

  });

  describe('Separated Strategy', () => {

  });
});
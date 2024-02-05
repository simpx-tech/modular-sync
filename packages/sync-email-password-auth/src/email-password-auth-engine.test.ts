import supertest from "supertest";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {Express} from "express";
import {setupTests} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import {setupAuthentication} from "@simpx/sync-core/__tests__/helpers/setup-authentication";
import {setupRepositories} from "@simpx/sync-core/__tests__/helpers/setup-repositories";
import {setupDomains} from "@simpx/sync-core/__tests__/helpers/setup-domains";
import {AuthEngine} from "@simpx/sync-core/src/server/interfaces/auth-engine";
import jwt from "jsonwebtoken";
import {QueryBuilder} from "@simpx/sync-core/src/common/query-builder";

describe("EmailPasswordAuthEngine", () => {
  let syncEngine: ServerSyncEngine;
  let app: Express;
  let authEngine: AuthEngine;

  beforeEach(async () => {
    ({ app, syncEngine, authEngine } = setupTests());

    await syncEngine.runSetup();

    await setupAuthentication(syncEngine);
    await setupRepositories(syncEngine);
    await setupDomains(syncEngine);
  })

  describe('createUser', () => {
    it('should create a new user with a random salt', async () => {
      await authEngine.createUser({ email: "test999@gmail.com", password: "123456" });

      const res = await syncEngine.metadataDatabase.query(new QueryBuilder("sync_users").where({ email: "test999@gmail.com"}).fetchOne());

      expect(res).toEqual({
        id: 2,
        email: "test999@gmail.com",
        password: expect.any(String),
        syncActivated: 1,
        salt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(res.password).not.toEqual("123456");
    });
  });

  describe('activateUser', () => {
    it('should activate the user', async () => {
      await syncEngine.metadataDatabase.update("sync_users", 1, { syncActivated: false });

      await authEngine.activateUser({ userId: 1 });

      const res = await syncEngine.metadataDatabase.query(new QueryBuilder("sync_users").withId(1));

      expect(res).toEqual({
        id: 1,
        email: "test@gmail.com",
        password: expect.any(String),
        syncActivated: 1,
        salt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate the user', async () => {
      await authEngine.deactivateUser({ userId: 1 });

      const res = await syncEngine.metadataDatabase.query(new QueryBuilder("sync_users").withId(1));

      expect(res).toEqual({
        id: 1,
        email: "test@gmail.com",
        password: expect.any(String),
        syncActivated: 0,
        salt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe("auth route / authenticate", () => {
    it('should fail if provide invalid email', async () => {
      await supertest(app).post("/sync/auth").send({
        email: "invalid-email",
        password: "123"
      }).expect(422);

      await supertest(app).post("/sync/auth").send({
        password: "123"
      }).expect(422);

      await supertest(app).post("/sync/auth").send({
        email: 12,
        password: "123"
      }).expect(422);
    });

    it('should fail if provide invalid password', async () => {
      await supertest(app).post("/sync/auth").send({
        email: "test@gmail.com",
        password: ""
      }).expect(422);

      await supertest(app).post("/sync/auth").send({
        email: "test@gmail.com",
      }).expect(422);

      await supertest(app).post("/sync/auth").send({
        email: "test@gmail.com",
        password: false,
      }).expect(422);
    });

    it("should fail if the user doesn't exists", async () => {
      await supertest(app).post("/sync/auth").send({
        email: "test-inexistent@gmail.com",
        password: "123456",
      }).expect(401);
    });

    it("should fail if the user doesn't has the sync feature activated", async () => {
      await syncEngine.authEngine.createUser({
        email: "test2",
        password: "123456",
      });

      await syncEngine.authEngine.deactivateUser({ userId: 2 });

      await supertest(app).post("/sync/auth").send({
        email: "test2@gmail.com",
        password: "123456",
      }).expect(401);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if the token is not valid', async () => {
      await syncEngine.authEngine.isAuthenticated("123");
    });

    it("should return false if the user doesn't has syncActivated", async () => {
      const token = jwt.sign({ id: 1, syncActivated: false }, "abacadabra")

      await syncEngine.authEngine.isAuthenticated(token);
    });

    it("should return true if the user doesn't has syncActivated", async () => {
      const token = jwt.sign({ id: 1, syncActivated: true }, "abacadabra")

      await syncEngine.authEngine.isAuthenticated(token);
    });
  });

  describe('decodeToken', () => {
    it('should return null if token is not valid', async () => {
      const res = await syncEngine.authEngine.decodeToken("123");

      expect(res).toBe(null);
    });

    it('should return the token decoded', async () => {
      const token = jwt.sign({ id: 1, syncActivated: true }, "abacadabra")

      const res = await syncEngine.authEngine.decodeToken(token);

      expect(res).toEqual({ id: 1, syncActivated: true, iat: expect.any(Number) });
    });
  });
});
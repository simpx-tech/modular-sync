import {AuthEngine} from "../../src/server/interfaces/auth-engine";

export async function setupAuthentication({ authEngine }: { authEngine: AuthEngine }) {
  await authEngine.createUser({ email: "test@gmail.com", password: "123456" });
  return authEngine.authenticateUser({ email: "test@gmail.com", password: "123456" });
}
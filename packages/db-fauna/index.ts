import { Client, errors, query as q } from "faunadb";
import type { ClientConfig, values } from "faunadb";
import { nanoid } from "nanoid";

import type { Db } from "db";

export function createDb(config: ClientConfig): Db {
  let client = new Client(config);

  return {
    // User functions
    getUserById: async (userId) => {
      let result = await client.query<{
        ref: values.Ref;
        data: { email: string; githubAccessToken?: string };
      }>(q.Get(q.Ref(q.Collection("Users"), userId)));

      return {
        id: result.ref.id,
        email: result.data.email,
      };
    },
    login: async ({ email, password }) => {
      try {
        let result = await client.query<{
          instance: values.Ref;
        }>(q.Call("LoginUser", [email, password]));

        if (!result?.instance?.id) {
          return null;
        }

        return {
          id: result.instance.id,
          email,
        };
      } catch (error) {
        if (error instanceof errors.BadRequest) {
          return null;
        }
        throw error;
      }
    },
    signup: async ({ email, password }) => {
      try {
        let result = await client.query<{
          ref: values.Ref;
          data: { email: string };
        }>(q.Call("CreateUser", [email, password]));

        return {
          id: result.ref.id,
          email: result.data.email,
        };
      } catch (error) {
        if (error instanceof errors.BadRequest) {
          return null;
        }
        throw error;
      }
    },

    // Project functions
    createProject: async ({ userId, name }) => {
      let result = await client.query<{ ref: values.Ref }>(
        q.Call("CreateProject", [name, userId])
      );

      return result.ref.id;
    },
    deleteProjectById: async ({ projectId, userId }) => {
      await client.query(q.Call("DeleteProjectById", [projectId, userId]));

      return projectId;
    },
    getProjectById: async ({ projectId, userId }) => {
      try {
        let result = await client.query<
          | false
          | {
              ref: values.Ref;
              data: { name: string; userId: string };
            }
        >(q.Call("GetProjectById", [projectId, userId]));

        if (!result) {
          return null;
        }

        return {
          id: result.ref.id,
          name: result.data.name,
        };
      } catch (error) {
        if (error instanceof errors.NotFound) {
          return null;
        }
        throw error;
      }
    },
    getProjectsByUserId: async (userId) => {
      try {
        const result = await client.query<{
          data: {
            ref: values.Ref;
            data: { name: string; userId: string };
          }[];
        }>(q.Call("GetProjectsByUserId", [userId]));

        return result.data.map((item) => ({
          id: item.ref.id,
          name: item.data.name,
        }));
      } catch (error) {
        console.log(String(error));
        throw error;
      }
    },

    // Flag functions
    createFlag: async ({ enabled, name, projectId, userId }) => {
      let result = await client.query<false | { ref: values.Ref }>(
        q.Call("CreateFlag", [name, enabled, projectId, userId])
      );

      if (!result) throw new Error("Failed to create flag");

      return result.ref.id;
    },
    deleteFlagById: async ({ flagId, userId }) => {
      await client.query(q.Call("DeleteFlagById", [flagId, userId]));

      return flagId;
    },
    getFlagById: async ({ flagId, userId }) => {
      try {
        let result = await client.query<{
          ref: values.Ref;
          data: { name: string; enabled: boolean; projectId: string };
        }>(q.Call("GetFlagById", [flagId, userId]));

        if (!result) return null;

        return {
          id: result.ref.id,
          name: result.data.name,
          enabled: result.data.enabled,
        };
      } catch (error) {
        console.log(String(error));
        throw error;
      }
    },
    getFlagsByProjectId: async ({ projectId, userId }) => {
      let results = await client.query<{
        data: {
          ref: values.Ref;
          data: { name: string; enabled: boolean; projectId: string };
        }[];
      }>(q.Call("GetFlagsByProjectId", [projectId, userId]));

      if (!results) return [];

      return results.data.map((item) => ({
        id: item.ref.id,
        name: item.data.name,
        enabled: item.data.enabled,
      }));
    },
    getFlagsByProjectIdWithToken: async ({ projectId, token }) => {
      let results = await client.query<{
        data: {
          ref: values.Ref;
          data: { name: string; enabled: boolean; projectId: string };
        }[];
      }>(q.Call("GetFlagsByProjectIdWithToken", [projectId, token]));

      if (!results) return [];

      return results.data.map((item) => ({
        id: item.ref.id,
        name: item.data.name,
        enabled: item.data.enabled,
      }));
    },
    setFlagEnabled: async ({ flagId, enabled, userId }) => {
      let result = await client.query(
        q.Call("SetFlagEnabled", [flagId, enabled, userId])
      );

      if (!result) throw new Error("Failed to set flag enabled");
    },

    // Token functions
    createToken: async ({ name, projectId, userId }) => {
      let secret = nanoid() + nanoid();
      let result = await client.query<false | { ref: values.Ref }>(
        q.Call("CreateToken", [name, secret, projectId, userId])
      );

      if (!result) throw new Error("Failed to create token");

      return secret;
    },
    getTokenById: async ({ tokenId, userId }) => {
      try {
        let result = await client.query<{
          ref: values.Ref;
          data: { name: string; projectId: string };
        }>(q.Call("GetTokenById", [tokenId, userId]));

        if (!result) return null;

        return {
          id: result.ref.id,
          name: result.data.name,
        };
      } catch (error) {
        console.log(String(error));
        throw error;
      }
    },
    getTokensByProjectId: async ({ projectId, userId }) => {
      let results = await client.query<{
        data: {
          ref: values.Ref;
          data: { name: string; projectId: string };
        }[];
      }>(q.Call("GetTokensByProjectId", [projectId, userId]));

      return results.data.map((item) => ({
        id: item.ref.id,
        name: item.data.name,
      }));
    },
    deleteTokenById: async ({ tokenId, userId }) => {
      await client.query(q.Call("DeleteTokenById", [tokenId, userId]));

      return tokenId;
    },
  };
}

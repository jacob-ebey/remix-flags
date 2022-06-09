export interface Project {
  id: string;
  name: string;
}

export interface Flag {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Token {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
}

export interface Db {
  // User functions
  getUserById(userId: string): Promise<User | null>;
  login(args: { email: string; password: string }): Promise<User | null>;
  signup(args: { email: string; password: string }): Promise<User | null>;

  // Project functions
  createProject(args: { userId: string; name: string }): Promise<string>;
  deleteProjectById(args: {
    projectId: string;
    userId: string;
  }): Promise<string | null>;
  getProjectById(args: {
    userId: string;
    projectId: string;
  }): Promise<Project | null>;
  getProjectsByUserId(userId: string): Promise<Project[] | null>;

  // Flag functions
  createFlag(args: {
    name: string;
    enabled: boolean;
    projectId: string;
    userId: string;
  }): Promise<string>;
  deleteFlagById(args: {
    flagId: string;
    userId: string;
  }): Promise<string | null>;
  getFlagsByProjectId(args: {
    projectId: string;
    userId: string;
  }): Promise<Flag[]>;
  getFlagsByProjectIdWithToken(args: {
    projectId: string;
    token: string;
  }): Promise<Flag[] | null>;
  getFlagById(args: { flagId: string; userId: string }): Promise<Flag | null>;
  setFlagEnabled(args: {
    flagId: string;
    enabled: boolean;
    userId: string;
  }): Promise<void>;

  // Token functions
  getTokenById(args: {
    tokenId: string;
    userId: string;
  }): Promise<Token | null>;
  deleteTokenById(args: {
    tokenId: string;
    userId: string;
  }): Promise<string | null>;
  getTokensByProjectId(args: {
    projectId: string;
    userId: string;
  }): Promise<Token[] | null>;
  createToken(args: {
    name: string;
    projectId: string;
    userId: string;
  }): Promise<string>;
}

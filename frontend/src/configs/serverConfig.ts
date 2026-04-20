interface ServerConfig {
  url: string;
}

export const serverConfig: ServerConfig = {
  url: import.meta.env.VITE_API_URL || "http://localhost:3000",
};

export const SERVER_URL = serverConfig.url;

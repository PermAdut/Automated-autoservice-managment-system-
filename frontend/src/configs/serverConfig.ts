interface ServerConfig{
    url: string;
}

export const serverConfig: ServerConfig = {
    url: import.meta.env.VITE_SERVER_URL || 'http://localhost:3333',
}
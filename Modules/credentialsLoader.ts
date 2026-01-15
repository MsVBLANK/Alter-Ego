import {readFileSync} from "fs";

export interface Credentials {
    discord: {
        token: string;
    }
    google: {
        type: string;
        project_id: string;
        private_key_id: string;
        private_key: string;
        client_email: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_x509_cert_url: string;
    }
}

export function loadCredentials(): Credentials {
    const filePath = "./Configs/credentials.json";
    let credentials: Credentials;

    try {
        const file = readFileSync(filePath, "utf8");
        credentials = JSON.parse(file);
    } catch (err) {
        // console.warn("Warning: Could not find credentials.json file. Using environment variables instead.");
        credentials = {
            discord: {token: process.env.DISCORD_TOKEN ?? ""},
            google: {
                auth_provider_x509_cert_url: process.env.G_CLIENT_X509_CERT_URL ?? "",
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                client_email: process.env.G_CLIENT_EMAIL ?? "",
                client_id: process.env.G_CLIENT_ID ?? "",
                client_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                private_key: process.env.G_PRIVATE_KEY.replace(/\\n/g, '\n') ?? "",
                private_key_id: process.env.PRIVATE_KEY_ID ?? "",
                project_id: process.env.PROJECT_ID ?? "",
                token_uri: "https://oauth2.googleapis.com/token",
                type: "service_account"
            }
        };
    }

    return credentials;
}

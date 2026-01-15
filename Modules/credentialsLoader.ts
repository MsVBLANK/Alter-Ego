import {readFileSync} from "fs";
import {readFile} from "fs/promises";

const CREDENTIALS_FILE_PATH = "./Configs/credentials.json";

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
    let file: string, parseFile: boolean;

    try {
        file = readCredentialsFile();
        parseFile = true;
    } catch (err) {
        console.log("Cannot read credentials file. Attempting to read from environment variables.");
        parseFile = false;
    }

    if (parseFile) {
        return parseCredentialsFile(file);
    } else {
        return readCredentialsEnv();
    }
}

export async function loadCredentialsAsync(): Promise<Credentials> {
    let file: string, parseFile: boolean;

    try {
        file = await readCredentialsFileAsync();
        parseFile = true;
    } catch (err) {
        console.log("Cannot read credentials file. Attempting to read from environment variables.");
        parseFile = false;
    }

    if (parseFile) {
        return parseCredentialsFile(file);
    } else {
        return readCredentialsEnv();
    }
}

export function readCredentialsFile(): string {
    return readFileSync(CREDENTIALS_FILE_PATH, "utf8");
}

export async function readCredentialsFileAsync(): Promise<string> {
    return readFile(CREDENTIALS_FILE_PATH, "utf8");
}

export function parseCredentialsFile(file: string): Credentials {
    return JSON.parse(file);
}

export function readCredentialsEnv(): Credentials {
    let credentials: Credentials;

    if (process.env.DISCORD_TOKEN === undefined) throw new Error("DISCORD_TOKEN environment variable not set.");
    if (process.env.G_CLIENT_X509_CERT_URL === undefined) throw new Error("G_CLIENT_X509_CERT_URL environment variable not set.");
    if (process.env.G_CLIENT_EMAIL === undefined) throw new Error("G_CLIENT_EMAIL environment variable not set.");
    if (process.env.G_CLIENT_ID === undefined) throw new Error("G_CLIENT_ID environment variable not set.");
    if (process.env.G_PRIVATE_KEY === undefined) throw new Error("G_PRIVATE_KEY environment variable not set.");
    if (process.env.G_PRIVATE_KEY_ID === undefined) throw new Error("PRIVATE_KEY_ID environment variable not set.");
    if (process.env.G_PROJECT_ID === undefined) throw new Error("PROJECT_ID environment variable not set.");

    credentials = {
        discord: {token: process.env.DISCORD_TOKEN ?? ""},
        google: {
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            client_email: process.env.G_CLIENT_EMAIL,
            client_id: process.env.G_CLIENT_ID,
            client_x509_cert_url: process.env.G_CLIENT_X509_CERT_URL,
            private_key: process.env.G_PRIVATE_KEY.replace(/\\n/g, '\n'),
            private_key_id: process.env.G_PRIVATE_KEY_ID,
            project_id: process.env.G_PROJECT_ID,
            token_uri: "https://oauth2.googleapis.com/token",
            type: "service_account"
        }
    };
    return credentials;
}

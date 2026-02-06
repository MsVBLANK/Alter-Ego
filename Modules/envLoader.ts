import { existsSync } from 'fs';
import { loadEnvFile } from 'node:process';

export function loadDotEnv() {
	const dotenvPath = process.env.DOTENV_PATH ?? './.env';

	// Load .env file if it exists.
	if (existsSync(dotenvPath)) {
		try {
			loadEnvFile(dotenvPath);
		} catch (e) {
			console.error(`Error: Cannot load .env file: ${e.toString()}`);
		}
	} else {
		console.warn(`Warning: .env file not found at ${dotenvPath}. You can ignore this warning if you are using Docker.`);
	}
}
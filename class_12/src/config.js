import { Command } from 'commander';
import dotenv from 'dotenv';

const commandLine = new Command();
commandLine
    .option('--mode <mode>')
    .option('--port <port>')
commandLine.parse();
const clOptions = commandLine.opts();

dotenv.config({ path: clOptions.mode === 'devel' ? '.env.devel' : '.env.prod' });

const config = {
    PORT: process.env.PORT || clOptions.port || 8080,
    MONGODB_URI: process.env.MONGODB_URI,
    PERSISTENCE: process.env.PERSISTENCE,
    SECRET: process.env.SECRET,
};

export default config;

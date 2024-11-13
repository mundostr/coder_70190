import * as url from 'url';
import { Command } from 'commander';

const commandLine = new Command();
commandLine
    .option('--mode <mode>')
    .option('--port <port>')
commandLine.parse();
const clOptions = commandLine.opts();
console.log(clOptions);

const config = {
    APP_NAME: 'coder70190',
    PORT: process.env.PORT || clOptions.port || 8080,
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    // getter: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/uploads` },
    // MONGODB_URI: 'mongodb://127.0.0.1:27017/coder70190',
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET: process.env.SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    /**
     * Una expresión regular (regex) nos permite evaluar una cadena para determinar si cumple o no
     * con un formato específico, en este caso, si corresponde a un id de MongoDB válido.
     */
    MONGODB_ID_REGEX: '/^[a-f\d]{24}$/i'
};


export default config;

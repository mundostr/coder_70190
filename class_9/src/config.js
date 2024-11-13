import * as url from 'url';
import { Command } from 'commander';
import dotenv from 'dotenv';

/**
 * OPCIONES DE LINEA DE COMANDOS
 * El módulo commander nos permite capturar fácilmente configuraciones
 * desde la línea de comandos al ejecutar el script.
 * 
 * A través del método option() podemos definir todas las que necesitemos.
 */
const commandLine = new Command();
commandLine
    .option('--mode <mode>')
    .option('--port <port>')
commandLine.parse();
// clOptions contendrá un objeto con todas las opciones que se hayan pasado
const clOptions = commandLine.opts();


/**
 * VARIABLES DE ENTORNO
 * NO utilizar dotenv y la opción --env-file de node a la vez, elegir una u otra.
 * 
 * El método config() de dotenv, toma lo definido en el archivo y lo envía
 * al sistema operativo para que sea agregado al paquete de variables de entorno.
 * A partir de allí, estará disponible en process.env.
 */
dotenv.config({ path: '.env' });
// Podríamos indicar con una opción de línea de comandos si queremos configurar
// en modo desarrollo o producción
// dotenv.config({ path: clOptions.mode === 'devel' ? '.env.devel' : '.env.prod' });

/**
 * Podemos ver que el objeto config() ya no tiene datos sensibles hardcodeados,
 * los recupera desde variables de entorno (como process.env.PORT) u opciones de
 * línea de comandos (como clOptions.port).
 */
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

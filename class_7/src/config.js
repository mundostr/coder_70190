import * as url from 'url';


const config = {
    APP_NAME: 'coder70190',
    PORT: 5050,
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    // getter: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/uploads` },
    MONGODB_URI: 'mongodb://127.0.0.1:27017/coder70190',
    // MONGODB_URI: 'mongodb+srv://coder70190:coder2024@cluster0.4qaobt3.mongodb.net/coder70190',
    SECRET: 'coder70190secret',
    GITHUB_CLIENT_ID: 'Iv23linzFMwCTr0FG7IJ',
    GITHUB_CLIENT_SECRET: '7e6b0ffb3abfdf7427cea9f322a2b7ae32df0425',
    GITHUB_CALLBACK_URL: 'http://localhost:5050/api/users/githubcallback',
    /**
     * Una expresión regular (regex) nos permite evaluar una cadena para determinar si cumple o no
     * con un formato específico, en este caso, si corresponde a un id de MongoDB válido.
     */
    MONGODB_ID_REGEX: '/^[a-f\d]{24}$/i'
};


export default config;

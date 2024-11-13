import { fork } from 'child_process';
import { Router } from 'express';


const router = Router();

/**
 * Recibe una cantidad variable de parámetros
 * Si alguno no es numérico, corta la ejecución del script con un error -4
 * Ver app.js para captura (listener) de este error.
 */
const listNumbers = (...numbers) => {
    numbers.forEach(number => {
        if (isNaN(number)) {
            console.log('Invalid parameters');
            process.exit(-4);
        } else {
            console.log(number);
        }
    });
}

// Una rutina para simular una operación compleja que tarda mucho tiempo
const complexOp = () => {
    let result = 0;
    for (let i = 0; i <= 3e9; i++ ) result += i // 3 000 000 000
    return result;
}

router.get('/', async (req, res) => {
    res.status(200).send({ error: null, data: `Servidor activo por ${process.uptime().toFixed(1)}` });
});

/**
 * Endpoint para ejecución de una función que dispara un exit.
 * En app.js habilitamos un listener de process para capturar ese evento.
 * 
 * Esta es solo una muestra, más adelante realizaremos una captura central
 * de errores con Express, e internamente el sistema aprovechará esta gestión
 * de process.
 */
router.get('/list', async (req, res) => {
    listNumbers(1, 2, 3, 4, 5);
    // listNumbers(1, 'Pepe', 3, 4, 5);
    res.status(200).send({ error: null, data: 'Función ejecutada' });
});

/**
 * Este endpoint llama de forma directa a la función complexOp().
 * El acceso a nuevas solicitudes EN CUALQUIER ENDPOINT quedara BLOQUEADO temporalmente,
 * hasta que la función resuelva el resultado.
 */
router.get('/complexwrong', async (req, res) => {
    res.status(200).send({ error: null, data: complexOp() });
});

/**
 * Este endpoint utiliza fork para generar un proceso hijo, y delega
 * la ejecución de la operación compleja a éste. De esa manera el hilo
 * principal se libera rápidamente y puede quedar atento a nuevas solicitudes.
 */
router.get('/complexok', async (req, res) => {
    // La operación compleja se coloca en un archivo separado, desde donde puede tomarla fork
    const childProcess = fork('src/complex.js');
    // Enviamos un mensaje al proceso hijo para que comience a trabajar (ver listener en complex.js)
    childProcess.send('start');
    // Activamos un listener acá en espera del resultado
    childProcess.on('message', result => {
        res.status(200).send({ error: null, data: result });
    });
});


export default router;

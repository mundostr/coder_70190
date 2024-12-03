import nodemailer from 'nodemailer';
import config from './config.js';

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
})

export const notifySuccessRegistration = async (to) => {
    return await transport.sendMail({
        from: `Sistema Coder <${config.GMAIL_APP_USER}>`, // de email origen
        to: to,
        subject: 'Registro exitoso!',
        html: `
            <h1>Coder Sales</h1>
            <h2>Bienvenido al sistema!</h2>
            <p>Su registro ha sido procesado correctamente, y ya
            puede comenzar a comprar!.</p>
        `});
}

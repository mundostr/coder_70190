/**
 * Para notificaciones por mail, nodemailer es un módulo muy cómodo.
 * Puede también probarse el servicio de Resend (https://resend.com), que cuenta con
 * una opción gratuita y funciona muy bien.
 * 
 * MUY IMPORTANTE!:
 * Por motivos de seguridad, si se desea enviar correos a través de Gmail
 * (similar situación acontece con otros prestadores), se deberá generar
 * primero una CLAVE DE APLICACION, es decir, la credencial indicada debajo
 * como config.GMAIL_APP_PASS, NO es la clave real de cuenta de Gmail, sino
 * una de aplicación.
 * 
 * Se puede crear en este enlace:
 * https://myaccount.google.com/apppasswords
 */

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

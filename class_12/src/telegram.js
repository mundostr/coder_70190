/**
 * Otra alternativa muy buena para notificaciones, es el uso de Telegram.
 * Telegram cuenta con una API tipo REST, por lo cual es muy fácil enviar solicitudes
 * para realizar ciertos procesos.
 * 
 * Para las automatizaciones, Telegram opera con el concepto de Bots, un bot es una aplicación
 * que podemos generar en nuestra cuenta y permite automatizar determinadas cosas. En el caso
 * del envío de notificaciones, se pueden seguir estos pasos:
 * 
 * 1- Crear lógicamente cuenta en Telegram.
 * 2- Desde el propio Telegram, buscar el usuario llamado @BotFather (el creador oficial de Bots),
 * y enviarle el mensaje /newbot para crear uno, indicándole el nombre deseado para el bot.
 * 3- @BotFather lo creará y devolverá un token de acceso para la API, guardar esta credencial
 * en lugar seguro (config.TELEGRAM_TOKEN).
 * 3- Para enviar un mensaje, ya sea a un usuario o a un grupo, se debe realizar una solicitud
 * al siguiente endpoint de la API:
 * https://api.telegram.org/bot[token]/sendMessage?chat_id=[id_chat]&text=[texto_del_mensaje]
 */

// npm i node-fetch

import fetch from 'node-fetch';

// Ejemplo de envío
const botUrl = `https://api.telegram.org/bot${config.TELEGRAM_TOKEN}`;
const sendMessageUrl = `${botUrl}/sendMessage`;
const getUpdatesUrl = `${botUrl}/getUpdates`;
// Para conocer el id de un determinado usuario o grupo:
// 1: Chatear con el usuario o sumarse al grupo
// 2: visitar desde el navegador la getUpdatesUrl, allí habrá un detalle
// de los mensajes intercambiados, donde se podrá localizar el id.
// Normalmente para los grupos, los id comienzan con un signo -.
const name = 'Carlos';
const chatId = 'id_de_usuario_o_grupo';
const text = `Bienvenido ${name}, te hemos registrado en nuestro sistema!.`;

const notification = await fetch(sendMessageUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text }),
});

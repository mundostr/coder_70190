/**
 * Envío de notificaciones a usuarios mediante servicio de Twilio
 * Twilio permite notificar vía SMS, MMS, admite integración con Whatsapp y otros.
 * 
 * Pasos para prueba:
 * 1- Crear cuenta gratuita en https://www.twilio.com/
 * 2- Obtener número de teléfono de prueba (Get Trial Phone Number), generalmente lo asigna sobre USA.
 * 3- Agendar credenciales proporcionadas: SID, TOKEN y número de teléfono.
 * 3- Utilizar cliente de NodeJS para envío (ver debajo)
 */

import twilio from 'twilio';

const twilioClient = twilio(config.TWILIO_SID, config.TWILIO_TOKEN);

// Ejemplo de envío
const notification = await twilioClient.messages.create({
    body: 'Mensaje enviado con servicio Twilio',
    from: config.TWILIO_PHONE,
    // Atención!: en la versión trial, Twilio no permitirá enviar a cualquier destino,
    // ingresar a la consola para configurar hasta 3 destinos de prueba.
    to: 'telefono_destino'
});
/**
 * En lo que respecta a notificaciones por SMS, una alternativa a Twilio es
 * Vonage (https://www.vonage.com/), servicio que antes figuraba bajo el nombre
 * de Nexmo, es muy cómodo y completo.
 */

// npm i @vonage/server-sdk
import { Vonage } from '@vonage/server-sdk';

// Estas credenciales se deben generar en el panel de administración de Vonage
const vonageClient = new Vonage({ apiKey: config.VONAGE_API_KEY, apiSecret: config.VONAGE_API_SECRET });

// Ejemplo de envío
const to = 'numero_telefono_destino';
const from = 'coder_70190_api';
const text = 'El texto del SMS';
const notification = await vonageClient.sms.send({to, from, text});

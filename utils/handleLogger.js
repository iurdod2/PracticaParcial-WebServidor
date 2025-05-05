const { IncomingWebhook } = require("@slack/webhook");

// Inicializar el webhook con la URL de Slack desde las variables de entorno
const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK);

// Crear el objeto loggerStream que será utilizado por morgan-body
const loggerStream = {
  write: message => {
    // Enviar mensaje a Slack cuando se escribe en el stream
    webHook.send({
      text: message
    });
  }
};

module.exports = loggerStream;
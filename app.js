const express = require('express');
const cors = require('cors');
const morganBody = require("morgan-body");
require('dotenv').config();
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./docs/swagger");

const loggerStream = require('./utils/handleLogger');
const routers = require('./routes');
const dbConnect = require('./config/mongo.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("storage"));

// Configuración de morgan-body para capturar y enviar logs de errores a Slack
morganBody(app, {
    noColors: true, // Limpia el String de datos lo máximo posible antes de mandarlo a Slack
    skip: function(req, res) { // Solo enviamos errores (4XX de cliente y 5XX de servidor)
        return res.statusCode < 400;
    },
    stream: loggerStream
});

app.use('/api', routers);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});

app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
);
app.use("/api", require("./routes"));

dbConnect();

module.exports = {app, server};
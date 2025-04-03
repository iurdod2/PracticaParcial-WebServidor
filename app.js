const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")

const routers = require('./routes');
const dbConnect = require('./config/mongo.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("storage"));

app.use('/api', routers);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});

app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
   )
app.use("/api", require("./routes"))

dbConnect();

module.exports = {app, server};

//@ts-nocheck
import OcppClientMessageHandler from "./OcppClientMessageHandler";
import OcppClientAuthHandler from "./OcppClientAuthHandler";
import ApiHandler from "./ApiHandler";

const express = require('express');
const { RPCServer } = require("ocpp-rpc");

const app = express();
app.use(express.json());
const apiHandler = new ApiHandler();
apiHandler.attachTo(app);

const httpServer = app.listen(3001);
console.log("Client Service running on port 3001")

const rpcServer = new RPCServer({
    protocols: ['ocpp1.6'],
    strictMode: true,
});

httpServer.on('upgrade', rpcServer.handleUpgrade);

const authHandler = new OcppClientAuthHandler();
authHandler.attachTo(rpcServer);

const clientHandler = new OcppClientMessageHandler();
clientHandler.attachTo(rpcServer);
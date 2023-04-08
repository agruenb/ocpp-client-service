
//@ts-nocheck
import OcppClientMessageHandler from "./OcppClientMessageHandler";
import OcppClientAuthHandler from "./OcppClientAuthHandler";
import OcppServerMessageHandler from "./ServerMessageQueueHandler";
import CommandApiHandler from "./CommandApiHandler";

const express = require('express');
const { RPCServer } = require("ocpp-rpc");

const app = express();
app.use(express.json());
const commandApiHandler = new CommandApiHandler();
commandApiHandler.attachTo(app);

const httpServer = app.listen(3000);

const rpcServer = new RPCServer({
    protocols: ['ocpp1.6'],
    strictMode: true,
});

httpServer.on('upgrade', rpcServer.handleUpgrade);

const authHandler = new OcppClientAuthHandler();
authHandler.attachTo(rpcServer);

const clientHandler = new OcppClientMessageHandler();
clientHandler.attachTo(rpcServer);
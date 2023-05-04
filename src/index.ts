
//@ts-nocheck
import OcppClientAuthHandler from "./OcppClientAuthHandler";
import ocppClientManager from "./mainClientManager";
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

const authHandler = new OcppClientAuthHandler();
authHandler.attachTo(rpcServer);

rpcServer.on('client', async (client: any) => {
    ocppClientManager.add(client);
});

httpServer.on('upgrade', rpcServer.handleUpgrade);
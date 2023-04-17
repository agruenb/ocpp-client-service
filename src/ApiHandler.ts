
import { Express, Response} from "express";
import { Request } from "express-serve-static-core";
import Logger from "./logs/Logger";
import mainClientHandler from "./mainClientManager";

export default class ApiHandler{
    attachTo(app:Express){
        app.post("/remoteStartTransaction", async (req, res) => {
            this.remoteStartTransactionCommandHandler(req, res);
        });
        app.post("/remoteStopTransaction", async (req, res) => {
            this.remoteStopTransactionCommandHandler(req, res);
        });
        app.get("/connectedOcppClients", async (req, res) => {
            this.getConnectedOcppClientsHandler(req, res);
        });
        app.get("/ocppClientInfo", async (req, res) => {
            this.getOcppClientInfo(req, res);
        });
    }
    getConnectedOcppClientsHandler(req:Request, res:Response){
        Logger.log("CmdApi","Received GetConnectedOcppClients via command API");
        let jsonString = JSON.stringify(mainClientHandler.getClientIds());
        res.end(jsonString);
    }
    getOcppClientInfo(req:Request, res:Response){
        Logger.log("CmdApi","Received getOcppClientInfo via command API");
        let jsonString = JSON.stringify(mainClientHandler.getClientInfo(req.params.ocppIdentity));
        res.end(jsonString);
    }
    remoteStartTransactionCommandHandler(req:Request, res:Response){
        Logger.log("CmdApi","Received RemoteStartTransaction via command API");
        let cmdParams = {
            id: req.body.id
        }
        let client = mainClientHandler.clientByIdentity(cmdParams.id);
        if(!client){
            Logger.log("CmdApi",`Invalid client id (${cmdParams.id}) on RemoteStartTransaction`);
            res.status(400).end('Invalid client id');
            return;
        }
        Logger.log("CmdApi",`Calling RemoteStartTransaction on (${req.body.id})`);
        client.call("RemoteStartTransaction", {
            idTag:"fakeId"
        }).then(
            (resp:any) => {
                Logger.log("CmdApi",`Client (${req.body.id}) RemoteStartTransaction response: ${resp.status}`);
                if(resp.status === "Accepted"){
                    res.end();
                    return;
                }
                res.status(500).end();
            }
        ).catch(
            (err:any) => {
                Logger.error("CmdApi",`RemoteStartTransaction error on (${cmdParams.id})`, err);
                res.status(500).end();
            }
        );
    }
    remoteStopTransactionCommandHandler(req:Request, res:Response){
        Logger.log("CmdApi","Received RemoteStopTransaction via command API");
        let cmdParams = {
            id: req.body.id
        }
        let client = mainClientHandler.clientByIdentity(cmdParams.id);
        if(!client){
            Logger.log("CmdApi", `Invalid client id (${cmdParams.id}) on RemoteStopTransaction`);
            res.status(400).send('Invalid client id');
            return;
        }
        Logger.log("CmdApi", `Calling RemoteStopTransaction on (${cmdParams.id})`);
        client.call("RemoteStopTransaction", {
            transactionId: 42
        }).then(
            (resp:any) => {
                Logger.log("CmdApi",`Client (${req.body.id}) RemoteStopTransaction response: ${resp.status}`);
                if(resp.status === "Accepted"){
                    res.end();
                    return;
                }
                res.status(500).end();
            }
        ).catch(
            (err:any) => {
                Logger.error("CmdApi", `RemoteStopTransactionError on (${cmdParams.id})`, err);
                res.status(500).end();
            }
        );
    }
}
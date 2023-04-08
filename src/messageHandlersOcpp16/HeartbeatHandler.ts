import { FromSchema } from "json-schema-to-ts";
import Logger from "../logs/Logger";

const HeartbeatJson = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "urn:OCPP:1.6:2019:12:HeartbeatRequest",
    "title": "HeartbeatRequest",
    "type": "object",
    "properties": {},
    "additionalProperties": false
} as const;

export type Heartbeat = FromSchema<typeof HeartbeatJson>;

export default class HearbeatHandler{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('Heartbeat', ({params}:any) => this.handler({params}));
    }
    handler({params}:any){
        Logger.log("HeartbeatHandler", `Got heartbeat - ID: ${this._client.identity}`)
        return {
            currentTime: new Date().toISOString()
        };
    }
}
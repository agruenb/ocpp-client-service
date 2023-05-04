import { FromSchema } from "json-schema-to-ts";
import Logger from "../logs/Logger";
import EventEmitter from "events";

const HeartbeatJson = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "urn:OCPP:1.6:2019:12:HeartbeatRequest",
    "title": "HeartbeatRequest",
    "type": "object",
    "properties": {},
    "additionalProperties": false
} as const;

export type Heartbeat = FromSchema<typeof HeartbeatJson>;

export default class HearbeatHandler extends EventEmitter{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('Heartbeat', (msg:any) => this.handler(msg));
    }
    handler(msg:any){
        Logger.log("HeartbeatHandler", `Got heartbeat - ID: ${this._client.identity}`)
        msg.reply({
            currentTime: new Date().toISOString()
        });
        this.emit("msg");
    }
}
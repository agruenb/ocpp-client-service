import { FromSchema } from "json-schema-to-ts";
import Logger from "../logs/Logger";

const BootNotificationJson = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "urn:OCPP:1.6:2019:12:BootNotificationRequest",
    "title": "BootNotificationRequest",
    "type": "object",
    "properties": {
        "chargePointVendor": {
            "type": "string",
            "maxLength": 20
        },
        "chargePointModel": {
            "type": "string",
            "maxLength": 20
        },
        "chargePointSerialNumber": {
            "type": "string",
            "maxLength": 25
        },
        "chargeBoxSerialNumber": {
            "type": "string",
            "maxLength": 25
        },
        "firmwareVersion": {
            "type": "string",
            "maxLength": 50
        },
        "iccid": {
            "type": "string",
            "maxLength": 20
        },
        "imsi": {
            "type": "string",
            "maxLength": 20
        },
        "meterType": {
            "type": "string",
            "maxLength": 25
        },
        "meterSerialNumber": {
            "type": "string",
            "maxLength": 25
        }
    },
    "additionalProperties": false,
    "required": [
        "chargePointVendor",
        "chargePointModel"
    ]
} as const;

export type BootNotification = FromSchema<typeof BootNotificationJson>;

export default class BootNotificationHandler{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('BootNotification', (msg:any) => this.handler(msg));
    }
    handler(msg:any){
        Logger.log("BootNotificationHandler", `BootNotification - ID: ${this._client.identity}`);
        return {
            status: "Accepted",
            interval: 300,
            currentTime: new Date().toISOString()
        };
    }
}
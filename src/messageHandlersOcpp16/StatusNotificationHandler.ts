import Logger from "../logs/Logger";
import redisClient from "../redis-db/mainRedisClient";
import RedisOperations from "../redis-db/RedisOperations";
import { FromSchema } from "json-schema-to-ts";

const StatusNotificationJson = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "urn:OCPP:1.6:2019:12:StatusNotificationRequest",
    "title": "StatusNotificationRequest",
    "type": "object",
    "properties": {
        "connectorId": {
            "type": "integer"
        },
        "errorCode": {
            "type": "string",
            "additionalProperties": false,
            "enum": [
                "ConnectorLockFailure",
                "EVCommunicationError",
                "GroundFailure",
                "HighTemperature",
                "InternalError",
                "LocalListConflict",
                "NoError",
                "OtherError",
                "OverCurrentFailure",
                "PowerMeterFailure",
                "PowerSwitchFailure",
                "ReaderFailure",
                "ResetFailure",
                "UnderVoltage",
                "OverVoltage",
                "WeakSignal"
            ]
        },
        "info": {
            "type": "string",
            "maxLength": 50
        },
        "status": {
            "type": "string",
            "additionalProperties": false,
            "enum": [
                "Available",
                "Preparing",
                "Charging",
                "SuspendedEVSE",
                "SuspendedEV",
                "Finishing",
                "Reserved",
                "Unavailable",
                "Faulted"
            ]
        },
        "timestamp": {
            "type": "string",
            "format": "date-time"
        },
        "vendorId": {
            "type": "string",
            "maxLength": 255
        },
        "vendorErrorCode": {
            "type": "string",
            "maxLength": 50
        }
    },
    "additionalProperties": false,
    "required": [
        "connectorId",
        "errorCode",
        "status"
    ]
} as const;

export type StatusNotification = FromSchema<typeof StatusNotificationJson>;

export default class StatusNotificationHandler{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('StatusNotification', (msg:any) => this.handler(msg));
    }
    async handler(msg:any){
        let data:StatusNotification = msg.params;
        Logger.log("StatusMessageHandler", `Got StatusNotification - ID: ${this._client.identity}`);
        await RedisOperations.updateOcppClientStatus(redisClient, this._client, data.status);
        msg.reply({});
    }
}
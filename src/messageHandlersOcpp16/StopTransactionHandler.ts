import { FromSchema } from "json-schema-to-ts";
import { DbModelTransaction, Transaction } from "../db/src/DbModelTransactions";
import Logger from "../logs/Logger";
import redisPublisher from "../redis-db/RedisPublisher";
import EventEmitter from "events";

const StopTransactionJson = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "urn:OCPP:1.6:2019:12:StopTransactionRequest",
    "title": "StopTransactionRequest",
    "type": "object",
    "properties": {
        "idTag": {
            "type": "string",
            "maxLength": 20
        },
        "meterStop": {
            "type": "integer"
        },
        "timestamp": {
            "type": "string",
            "format": "date-time"
        },
        "transactionId": {
            "type": "integer"
        },
        "reason": {
            "type": "string",
            "additionalProperties": false,
            "enum": [
                "EmergencyStop",
                "EVDisconnected",
                "HardReset",
                "Local",
                "Other",
                "PowerLoss",
                "Reboot",
                "Remote",
                "SoftReset",
                "UnlockCommand",
                "DeAuthorized"
            ]
        },
        "transactionData": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "timestamp": {
                        "type": "string",
                        "format": "date-time"
                    },
                    "sampledValue": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "value": {
                                    "type": "string"
                                },
                                "context": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "Interruption.Begin",
                                        "Interruption.End",
                                        "Sample.Clock",
                                        "Sample.Periodic",
                                        "Transaction.Begin",
                                        "Transaction.End",
                                        "Trigger",
                                        "Other"
                                    ]
                                },  
                                "format": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "Raw",
                                        "SignedData"
                                    ]
                                },
                                "measurand": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "Energy.Active.Export.Register",
                                        "Energy.Active.Import.Register",
                                        "Energy.Reactive.Export.Register",
                                        "Energy.Reactive.Import.Register",
                                        "Energy.Active.Export.Interval",
                                        "Energy.Active.Import.Interval",
                                        "Energy.Reactive.Export.Interval",
                                        "Energy.Reactive.Import.Interval",
                                        "Power.Active.Export",
                                        "Power.Active.Import",
                                        "Power.Offered",
                                        "Power.Reactive.Export",
                                        "Power.Reactive.Import",
                                        "Power.Factor",
                                        "Current.Import",
                                        "Current.Export",
                                        "Current.Offered",
                                        "Voltage",
                                        "Frequency",
                                        "Temperature",
                                        "SoC",
                                        "RPM"
                                    ]
                                },
                                "phase": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "L1",
                                        "L2",
                                        "L3",
                                        "N",
                                        "L1-N",
                                        "L2-N",
                                        "L3-N",
                                        "L1-L2",
                                        "L2-L3",
                                        "L3-L1"
                                    ]
                                },
                                "location": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "Cable",
                                        "EV",
                                        "Inlet",
                                        "Outlet",
                                        "Body"
                                    ]
                                },
                                "unit": {
                                    "type": "string",
                                    "additionalProperties": false,
                                    "enum": [
                                        "Wh",
                                        "kWh",
                                        "varh",
                                        "kvarh",
                                        "W",
                                        "kW",
                                        "VA",
                                        "kVA",
                                        "var",
                                        "kvar",
                                        "A",
                                        "V",
                                        "K",
                                        "Celcius",
                                        "Fahrenheit",
                                        "Percent"
                                    ]
                                }
                            },
                            "additionalProperties": false,
                            "required": [
                                "value"
                            ]
                        }
                    }
                },
                "additionalProperties": false,
                "required": [
                    "timestamp",
                    "sampledValue"
                ]
            }
        }
    },
    "additionalProperties": false,
    "required": [
        "transactionId",
        "timestamp",
        "meterStop"
    ]
} as const;

export type StopTransaction = FromSchema<typeof StopTransactionJson>;

export default class StopTransactionHandler extends EventEmitter{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('StopTransaction', (msg:any) => this.handler(msg));
    }
    async handler(msg:any){
        let stoppedTransactionParams:StopTransaction = msg.params;
        let stoppedTransaction:Transaction;
        try {
            stoppedTransaction = await DbModelTransaction.updateFinished(
                stoppedTransactionParams.transactionId,
                stoppedTransactionParams.meterStop,
                stoppedTransactionParams.timestamp
            );
        } catch (error) {
            Logger.error("StopTransactionHandler","SqlError", error);
            return {};
        }
        redisPublisher.transactionStopped([stoppedTransactionParams]);
        msg.reply({
            idTagInfo: {
                status: "Accepted"
            }
        });
        this.emit("msg", stoppedTransactionParams);
    }
}
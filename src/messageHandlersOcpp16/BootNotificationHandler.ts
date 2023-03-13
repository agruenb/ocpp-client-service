export default class BootNotificationHandler{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('BootNotification', ({params}:any) => this.handler({params}));
    }
    handler({params}:any){
        console.log("BootNotification from " + this._client.identity)
        return {
            status: "Accepted",
            interval: 300,
            currentTime: new Date().toISOString()
        };
    }
}
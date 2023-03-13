export default class HearbeatHandler{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('Heartbeat', ({params}:any) => this.handler({params}));
    }
    handler({params}:any){
        console.log(`Server got Heartbeat from ${this._client.identity}:`, params);
        return {
            currentTime: new Date().toISOString()
        };
    }
}
import Logger from "./logs/Logger";

export default class OcppClientManager{

    _list:Array<any> = [];

    clientByIdentity(id:string){
        return this._list.filter( el => {return el.identity === id} )[0];
    }

    removeClient(id:string){
        let index = this._list.findIndex( el => el.identity === id);
        if(index === -1){
            Logger.log("ClientManager", "Tried removing non-existing client. ID:"+id);
        }else{
            this._list.splice(index, 1);
            Logger.log("ClientManager", "No proper client cleanup");
        }
    }

    clientExists(client:any){
        return this.clientByIdentity(client.identity) !== undefined;
    }

    add(client:any){
        if(this.clientExists(client)){
            Logger.log("ClientManager", "Client with duplicate id connected. ID:" + client.identity);
            this.removeClient(String(client.identity));
        }
        this._list.push(client);
    }
}
export default class Logger{
    static log(source:string, message:string){
        if(process.env.BUILD_MODE === "DEVELOPMENT"){
            console.log(`[${source}] ${message}`);
        }else{
            return;
        }
    }
    static error(source:string, message:string, error:any){
        if(process.env.BUILD_MODE === "DEVELOPMENT"){
            Logger.log(source, message);
            console.log(error);
        }else{
            return;
        }
    }
}
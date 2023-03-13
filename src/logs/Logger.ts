export default class Logger{
    static log(message:string){
        if(process.env.BUILD_MODE === "DEVELOPMENT"){
            console.log(message);
        }else{
            return;
        }
    }
}
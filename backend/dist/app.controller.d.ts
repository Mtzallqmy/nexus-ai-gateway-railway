import { AppService } from "./app.service";
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    root(): {
        name: string;
        version: string;
        status: string;
        timestamp: string;
        docs: string;
        health: string;
    };
}

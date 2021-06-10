import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import './middlewares/passport';
import passport from 'passport';
import routes from './routes';
import { info, success } from './helpers/log';

const https = require('https');
const fs = require('fs');


export default class Server {
    private _host: string;
    private _port: number;
    private _app: Express | null = null;
    private credentials = {
        key: fs.readFileSync(__dirname + '/../sslCertificates/key.pem'),
        cert: fs.readFileSync(__dirname + '/../sslCertificates/cert.pem')
    };

    public constructor(host: string, port: number) {
        this._host = host;
        this._port = port;
    }

    private async _initialize(): Promise<void> {
        success('Database successfully authenticated');
        this._app = express();
        this._app.use(cors());
        this._app.use(helmet());
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));
        this._app.use(passport.initialize());
        this._app.use('/', routes);
    }

    public async run(): Promise<void> {
        await this._initialize();

        if (this._app) {
            const httpsServer = https.createServer(this.credentials, this._app)
            
            httpsServer.listen(this._port, () => {
                info(`Server is listening on ${this._host}:${this._port}`);
            });
        }
    }
}

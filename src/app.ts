import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/route';
import sequelize from './config/database';
import * as dotenv from 'dotenv';

dotenv.config({
    path: ".env"
});

const app: Application = express();

app.use(bodyParser.json());

app.use('/api', authRoutes);

app.get('/health', async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({ message: "ok" });
});

const port = process.env.PORT || 3000;

app.get('/api/config', (req: Request, res: Response) => {
    res.json({ apiUrl: `http://localhost:${port}` });
});

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error: any) {
        console.error('Unable to connect to the database:', error.message);
    }
};

startServer();
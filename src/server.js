import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { logger } from './middlewares/logger.js';
import { env } from './utils/env.js';
import cookieParser from 'cookie-parser';
import { contactRouter } from './routers/contacts.js';
import { authRouter } from './routers/auth.js';
import { UPLOAD_DIR } from './constants/auth.js';

export default function setupServer(){
    const app = express();
    const PORT = Number(env('PORT', 3000));

    app.use(cors());
    app.use(logger);
    app.use(express.json());
    app.use(cookieParser());


    app.use('/auth', authRouter);
    app.use(contactRouter);
    app.use('/uploads', express.static(UPLOAD_DIR));

    app.use('*', notFoundHandler);

    app.use(errorHandler);

      app.listen(PORT, ()=> {
        console.log(`Server is running on ${PORT}`);
      });
}



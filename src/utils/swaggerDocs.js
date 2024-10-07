import createHttpError from 'http-errors';
import swaggerUI from 'swagger-ui-express';
import {readFileSync} from "node:fs";

import { SWAGGER_PATH } from "../constants/contacts.js";

export const swaggerDocs = () => {
    try {
    const swaggerDoc = JSON.parse(readFileSync(SWAGGER_PATH).toString());
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)];
    } catch (error) {
        console.error(`Error loading Swagger docs: ${error.message}`);
        return (req, res, next) =>
            next(createHttpError(500, "Can't load swagger docs"));
    }
};

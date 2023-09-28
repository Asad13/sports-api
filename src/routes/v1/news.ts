/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import validate from '@src/middlewares/v1/data-validation';
import { getClubNewsSchema } from '@src/schemas/v1/news.schema';
import { getNewsHandler } from '@src/controllers/v1/news.controller';

const router = Router();

router.route('/').get(validate(getClubNewsSchema), getNewsHandler);

export default router;

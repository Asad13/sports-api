/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import {
  getMensFixtureHandler,
  getWomensFixtureHandler,
  getFixtureByClubHandler,
} from '@src/controllers/v1/fixture.controller';

const router = Router();

/**
 * @openapi
 * paths:
 *   /v1/fixtures/men:
 *     get:
 *       tags:
 *         - Fixture
 *       summary: GET All Matches' Info(Men)
 *       description: Get all the men's match data from thesports.com API
 *       responses:
 *         200:
 *           description: Success
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: boolean
 *                     default: true
 *                   message:
 *                     type: string
 *                     default: All Men's Match Data
 *                   data:
 *                     type: object
 *                     properties:
 *                       English Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       English FA Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       English Carabao Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       English Association Community Shield:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Scottish Premiership:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Scottish Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Scottish League Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Northern Ireland Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Northern Ireland Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Northern Ireland League Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Welsh Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Welsh Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *         500:
 *           description: Internal server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: boolean
 *                     default: false
 *                   message:
 *                     type: string
 *                     default: Internal server error
 *
 */
router.route('/men').get(getMensFixtureHandler);

/**
 * @openapi
 * paths:
 *   /v1/fixtures/women:
 *     get:
 *       tags:
 *         - Fixture
 *       summary: GET All Matches' Info(Women)
 *       description: Get all the women's match data from thesports.com API
 *       responses:
 *         200:
 *           description: Success
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: boolean
 *                     default: true
 *                   message:
 *                     type: string
 *                     default: All Women's Match Data
 *                   data:
 *                     type: object
 *                     properties:
 *                       English FA Women's Super League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       English FA Women's Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       English FA Women's League Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       English FA Women's Community Shield:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Scottish Women's Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Scottish Women's Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Northern Ireland Women's Super League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Northern Ireland Women's Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Welsh Women's Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *                       Welsh Women's League Cup:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Match'
 *         500:
 *           description: Internal server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: boolean
 *                     default: false
 *                   message:
 *                     type: string
 *                     default: Internal server error
 *
 */
router.route('/women').get(getWomensFixtureHandler);

router.route('/:clubId').get(getFixtureByClubHandler);

export default router;

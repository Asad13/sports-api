/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import {
  getMensStandingHandler,
  getWomensStandingHandler,
} from '@src/controllers/v1/standing.controller';

const router = Router();

/**
 * @openapi
 * paths:
 *   /v1/standings/men:
 *     get:
 *       tags:
 *         - Standing
 *       summary: GET Teams Standing Info(Men)
 *       description: Get all the men's teams standing data from thesports.com API
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
 *                     default: All Men's Team Standing
 *                   data:
 *                     type: object
 *                     properties:
 *                       English Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       English Football League Championship:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       English Football League One:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       English Football League Two:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       English National League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       Scottish Premiership:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       Scottish Championship:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       Northern Ireland Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       Welsh Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
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
router.route('/men').get(getMensStandingHandler);

/**
 * @openapi
 * paths:
 *   /v1/standings/women:
 *     get:
 *       tags:
 *         - Standing
 *       summary: GET Teams Standing Info(Women)
 *       description: Get all the women's teams standing data from thesports.com API
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
 *                     default: All Women's Team Standing
 *                   data:
 *                     type: object
 *                     properties:
 *                       English FA Women's Super League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       English FA Women's Super League 2:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       English Women's North Conference:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       English Women's South Conference:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       Scottish Women's Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       Northern Ireland Women's Super League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *                       Welsh Women's Premier League:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StandingInfo'
 *
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
router.route('/women').get(getWomensStandingHandler);

export default router;

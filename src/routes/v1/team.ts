/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import {
  getMensTeamHandler,
  getWomensTeamHandler,
  getTeamInfoHandler,
} from '@src/controllers/v1/team.controller';

const router = Router();

/**
 * @openapi
 * paths:
 *   /v1/teams/men:
 *     get:
 *       tags:
 *         - Team
 *       summary: GET All Teams Info(Men)
 *       description: Get all the men's team data from thesports.com API
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
 *                     default: All Men's Team
 *                   data:
 *                     type: object
 *                     properties:
 *                       England:
 *                         type: object
 *                         properties:
 *                           English Premier League:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                           English Football League Championship:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                           English Football League One:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                           English Football League Two:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                           English National League:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                       Scotland:
 *                         type: object
 *                         properties:
 *                           Scottish Premiership:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                           Scottish Championship:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                       Northern Ireland:
 *                         type: object
 *                         properties:
 *                           Northern Ireland Premier League:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                       Wales:
 *                         type: object
 *                         properties:
 *                           Welsh Premier League:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
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
router.route('/men').get(getMensTeamHandler);

/**
 * @openapi
 * paths:
 *   /v1/teams/women:
 *     get:
 *       tags:
 *         - Team
 *       summary: GET All Teams Info(Women)
 *       description: Get all the women's team data from thesports.com API
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
 *                     default: All Women's Team
 *                   data:
 *                     type: object
 *                     properties:
 *                       England:
 *                         type: object
 *                         properties:
 *                           English FA Women's Super League:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                           English FA Women's Super League 2:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                           English Women's North Conference:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                           English Women's South Conference:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                       Scotland:
 *                         type: object
 *                         properties:
 *                           Scottish Women's Premier League:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                       Northern Ireland:
 *                         type: object
 *                         properties:
 *                           Northern Ireland Women's Super League:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
 *                       Wales:
 *                         type: object
 *                         properties:
 *                           Welsh Women's Premier League:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Team'
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
router.route('/women').get(getWomensTeamHandler);

router.route('/:clubId').get(getTeamInfoHandler);

export default router;

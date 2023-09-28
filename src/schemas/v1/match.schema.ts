/**
 * @openapi
 * components:
 *   schemas:
 *     MatchResult:
 *       type: object
 *       required:
 *         - home_team
 *         - away_team
 *       properties:
 *         home_team:
 *           type: number
 *         away_team:
 *           type: number
 *         penalty_score:
 *           type: object
 *           required:
 *             - home_team
 *             - away_team
 *           properties:
 *             home_team:
 *               type: number
 *             away_team:
 *               type: number
 *     Match:
 *       type: object
 *       required:
 *         - id
 *         - competition_id
 *         - date
 *         - is_live
 *         - is_completed
 *         - home_team
 *         - away_team
 *         - result
 *       properties:
 *         id:
 *           type: string
 *         competition_id:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         is_live:
 *           type: boolean
 *         is_completed:
 *           type: boolean
 *         home_team:
 *           type: string
 *         away_team:
 *           type: string
 *         result:
 *           $ref: '#/components/schemas/MatchResult'
 *           nullable: true
 */

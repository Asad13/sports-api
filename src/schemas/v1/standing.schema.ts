/**
 * @openapi
 * components:
 *   schemas:
 *     TeamStat:
 *       type: object
 *       required:
 *         - played
 *         - won
 *         - drawn
 *         - lost
 *         - goals_scored
 *         - goals_against
 *       properties:
 *         played:
 *           type: number
 *         won:
 *           type: number
 *         drawn:
 *           type: number
 *         lost:
 *           type: number
 *         goals_scored:
 *           type: number
 *         goals_against:
 *           type: number
 *     StandingInfo:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - points
 *         - position
 *         - home_stats
 *         - away_stats
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         points:
 *           type: number
 *         position:
 *           type: number
 *         home_stats:
 *           $ref: '#/components/schemas/TeamStat'
 *         away_stats:
 *           $ref: '#/components/schemas/TeamStat'
 */

import { AppDataSource } from '@src/databases/postgres/data-source';
import { Team } from '@src/databases/postgres/entities';
import logger from '@src/utils/logger';

export const saveTeams = async (teams: any): Promise<void> => {
  try {
    const teamRepository = AppDataSource.getRepository(Team);

    await teamRepository.save(teams);
  } catch (error) {
    logger.error(`[ERROR SAVING TEAM DATA IN POSTGRES]: ${error as string}`);
  }
};

export const getTeam = async (id: string): Promise<any[]> => {
  try {
    const teamRepository = AppDataSource.getRepository(Team);

    const data = await teamRepository.find({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        country_id: true,
        competition_id: true,
        logo: true,
        venue_id: true,
        venue: true,
        capacity: true,
      },
    });

    return data;
  } catch (error: any) {
    logger.error(
      `[ERROR READING ALL TEAMS DATA FROM POSTGRES]: ${error as string}`
    );
    return [];
  }
};

export const getAllTeams = async (): Promise<any[]> => {
  try {
    const teamRepository = AppDataSource.getRepository(Team);

    const data = await teamRepository.find({
      select: {
        id: true,
        name: true,
        country_id: true,
        competition_id: true,
        logo: true,
        venue_id: true,
        venue: true,
        capacity: true,
      },
    });

    return data;
  } catch (error: any) {
    logger.error(
      `[ERROR READING ALL TEAMS DATA FROM POSTGRES]: ${error as string}`
    );
    return [];
  }
};

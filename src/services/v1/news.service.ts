import { AppDataSource } from '@src/databases/postgres/data-source';
import { Article, Team } from '@src/databases/postgres/entities';
import { Between } from 'typeorm';
import logger from '@src/utils/logger';

export const saveNews = async (
  articles: any[],
  clubId: string
): Promise<void> => {
  try {
    const articleRepository = AppDataSource.getRepository(Article);
    const teamRepository = AppDataSource.getRepository(Team);
    const team = await teamRepository.findOne({
      where: {
        id: clubId,
      },
    });

    const titles: string[] = [];

    if (team != null) {
      const newArticles: Article[] = [];
      for (let i = 0; i < articles.length; i++) {
        if (articles[i]?.id !== undefined) {
          let article = await articleRepository.findOne({
            relations: {
              teams: true,
            },
            where: {
              id: articles[i].id,
            },
            select: {
              teams: {
                id: true,
              },
            },
          });

          if (article != null) {
            let willInsert = true;
            for (let j = 0; j < article.teams.length; j++) {
              if (article.teams[j].id === clubId) {
                willInsert = false;
              }
            }

            if (willInsert) {
              article.teams = [...article.teams, team];
              newArticles.push(article);
            }
          } else {
            if (!titles.includes(articles[i].title)) {
              article = new Article();
              article.id = articles[i].id;
              article.title = articles[i].title;
              article.image = articles[i].image;
              article.summary = articles[i].summary;
              article.url = articles[i].url;
              article.pubDate = articles[i].pubDate;
              article.teams = [team];

              newArticles.push(article);
            }
          }

          titles.push(articles[i].title);
        }
      }

      await articleRepository.save(newArticles);
    } else {
      logger.error(
        `[ERROR SAVING DATA IN POSTGRES]: No club found with id ${clubId}`
      );
    }
  } catch (error) {
    logger.error(`[ERROR SAVING DATA IN POSTGRES]: ${error as string}`);
  }
};

export const getAllNews = async (
  clubId: string,
  from: string,
  to: string
): Promise<any> => {
  try {
    const teamRepository = AppDataSource.getRepository(Team);

    const data = await teamRepository.find({
      relations: {
        articles: true,
      },
      where: {
        id: clubId,
        articles: {
          pubDate: Between(new Date(from), new Date(to)),
        },
      },
      select: {
        id: true,
        name: true,
        logo: true,
        articles: {
          id: true,
          title: true,
          image: true,
          summary: true,
          url: true,
          pubDate: true,
        },
      },
      order: {
        articles: {
          pubDate: 'DESC',
        },
      },
    });

    if (data.length > 0) {
      return data[0];
    } else {
      return null;
    }
  } catch (error: any) {
    logger.error(`[ERROR READING DATA FROM POSTGRES]: ${error as string}`);
    return null;
  }
};

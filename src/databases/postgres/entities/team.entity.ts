import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Article } from './article.entity';

@Entity({ name: 'teams' })
export class Team {
  @PrimaryColumn({ unique: true, length: 100 })
  id: string;

  @Column()
  name: string;

  @Column({ length: 100 })
  country_id: string;

  @Column({ length: 100 })
  competition_id: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true, length: 100 })
  venue_id: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  capacity: number;

  @ManyToMany(() => Article, (article) => article.teams)
  @JoinTable({
    name: 'articles_teams',
    joinColumn: {
      name: 'team_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'article_id',
      referencedColumnName: 'id',
    },
  })
  articles: Article[];
}

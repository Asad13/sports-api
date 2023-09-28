import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import { Team } from './team.entity';

@Entity({ name: 'articles' })
export class Article {
  @PrimaryColumn({ unique: true, length: 100 })
  id: string;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column()
  summary: string;

  @Column()
  url: string;

  @Column()
  pubDate: Date;

  @ManyToMany(() => Team, (team) => team.articles)
  teams: Team[];
}

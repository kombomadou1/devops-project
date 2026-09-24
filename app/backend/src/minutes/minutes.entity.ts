import { Association } from 'src/associations/association.entity';
import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable, ManyToOne } from 'typeorm';

@Entity()
export class Minute {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public date: string;

  @Column()
  public content: string;

 
  @ManyToMany(() => User, (user) => user.minutes)
  @JoinTable()
  public users: User[];

  @ManyToOne(() => Association, (association) => association.minutes)
  @JoinTable()
  public association: Association;

}



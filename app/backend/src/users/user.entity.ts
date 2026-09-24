import { Minute } from 'src/minutes/minutes.entity';
import { Role } from 'src/roles/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public lastname: string;

  @Column()
  public firstname: string;

  @Column()
  public age: number;

  @Column()
  public password: string;

  @ManyToMany(() => Minute, (minute) => minute.users)
  public minutes: Minute[];
  
  @OneToMany(() => Role, (role) => role.user)
  public roles: Role[];
}





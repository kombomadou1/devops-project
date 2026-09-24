import { Minute } from "src/minutes/minutes.entity";
import { Role } from "src/roles/role.entity";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity()
export class Association {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @OneToMany(() => Minute, (minute) => minute.association)
  public minutes: Minute[];

  @OneToMany(() => Role, (role) => role.association)
  public roles: Role[];
}




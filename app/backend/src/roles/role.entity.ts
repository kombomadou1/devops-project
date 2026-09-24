import { Association } from "src/associations/association.entity";
import { User } from "../users/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn } from "typeorm";

@Entity()
export class Role {
  @PrimaryColumn()
  public idUser: number;

  @PrimaryColumn()
  public idAssociation: number;

  @Column()
  public name: string;

  @ManyToOne(() => User, (user) => user.roles)
  @JoinColumn({ name: 'idUser' })
  public user: User;

  @ManyToOne(() => Association, (association) => association.roles)
  @JoinColumn({ name: 'idAssociation' })
  public association: Association;
}




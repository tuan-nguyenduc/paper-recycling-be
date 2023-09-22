import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {SchoolStatus, SchoolType} from "../enum";
import SchoolClass from "./SchoolClass";
import {User} from "./User";

@Entity()
class School {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({
    nullable: true,
  })
  address: string

  @Column({
    nullable: true,
  })
  phone: string

  @Column({
    nullable: true,
  })
  principal: string

  @Column({
    default: SchoolStatus.ACTIVE,
    type: 'smallint'
  })
  status: SchoolStatus

  @Column({
    type: 'varchar'
  })
  type: SchoolType

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  //relations
  @OneToMany(type => SchoolClass, schoolClass => schoolClass.school)
  classes: SchoolClass[];

  @OneToMany(type => User, user => user.school)
  users: User[];
}

export default School;

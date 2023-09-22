import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ClassStatus} from "../enum";
import School from "./School";
import {User} from "./User";
import PaperPointHistory from "./PaperPointHistory";
import PaperCollectHistory from "./PaperCollectHistory";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";

@Entity()
class SchoolClass {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  grade: number

  @Column({
    nullable: true,
  })
  teacherId: number

  @Column({
    nullable: true,
    default: 0,
  })
  totalStudent: number

  @Column({
    default: ClassStatus.ACTIVE,
  })
  status: ClassStatus

  @Column({
    nullable: true,
  })
  nextClassId: number

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
  @Column()
  schoolId: number
  @ManyToOne(type => School, school => school.classes)
  school: School;

  //one class has many students
  @OneToMany(type => User, user => user.schoolClass)
  users: User[];

  @OneToMany(type => PaperCollectHistory, x => x.schoolClass)
  paperCollectHistories: PaperPointHistory[];
  @Column({
    default: 0,
    type: 'decimal',
    transformer: new ColumnNumericTransformer()
  })
  rewardPaperPoint
}

export default SchoolClass;

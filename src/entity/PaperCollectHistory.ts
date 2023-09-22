import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";
import {PaperCollectStatus} from "../enum";
import SchoolClass from "./SchoolClass";

@Entity()
class PaperCollectHistory {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer()
  })
  weight: number

  @Column({
    type: 'smallint',
    default: PaperCollectStatus.CREATED
  })
  status: PaperCollectStatus

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

  // relations
  @Column({
    nullable: true,
  })
  schoolClassId: number;

  @ManyToOne(type => SchoolClass, schoolClass => schoolClass.users, {
    nullable: true,
  })
  schoolClass: SchoolClass;
  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  paperPointReward: number;


}

export default PaperCollectHistory;

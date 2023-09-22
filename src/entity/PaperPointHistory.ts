import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {PaperPointHistoryType} from "../enum";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";

@Entity()
class PaperPointHistory {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer()
  })
  amount: number

  @Column()
  isAdd: boolean

  @Column({
    type: 'varchar'
  })
  type: PaperPointHistoryType

  @Column()
  referenceId: number

  @Column()
  userId: number
  @ManyToOne(type => User, user => user.paperPointHistories)
  user: User;
}

export default PaperPointHistory;

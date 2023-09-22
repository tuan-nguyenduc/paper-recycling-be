import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {OrderStatus} from "../enum";
import {User} from "./User";
import OrderDetail from "./OrderDetail";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";

@Entity()
class Order {
  @PrimaryGeneratedColumn()
  id: number


  @Column({
    default: OrderStatus.CREATED,
    type: 'smallint'
  })
  status: OrderStatus

  @Column({
    default: 0,
    type: 'decimal',
    transformer: new ColumnNumericTransformer()
  })
  amount: number

  @Column()
  userId: number

  @ManyToOne(type => User, user => user.orders)
  user: User;

  @OneToMany(type => OrderDetail, orderDetail => orderDetail.order)
  orderDetails: OrderDetail[];

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
}

export default Order;

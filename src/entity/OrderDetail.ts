import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import Order from "./Order";
import {Product} from "./Product";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";

@Entity()
class OrderDetail {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  orderId: number

  @Column()
  productId: number

  @Column()
  quantity: number

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer()
  })
  price: number // price at the time of purchase

  @ManyToOne(type => Order, order => order.orderDetails)
  order: Order;

  @ManyToOne(type => Product, product => product.orderDetails)
  product: Product;

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

export default OrderDetail;

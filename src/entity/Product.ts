import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ProductStatus} from "../enum";
import {Category} from "./Category";
import OrderDetail from "./OrderDetail";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";
import {Review} from "./Review";

@Entity()
export class Product {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer()
  })
  price: number

  @Column({
    nullable: true,
    type: 'text',
  })
  description: string

  @Column({
    nullable: true,
    type: 'text',
  })
  images: string

  @Column({
    default: 0,
  })
  quantity: number

  @Column({
    default: ProductStatus.ACTIVE,
    type: 'smallint'
  })
  status: ProductStatus

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

  @Column()
  categoryId: number;

  @Column({
    default: 0,
  })
  rating: number;

  @ManyToOne(type => Category, category => category.products)
  category: Category;

  @OneToMany(type => OrderDetail, orderDetail => orderDetail.product)
  orderDetails: OrderDetail[];

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];
}

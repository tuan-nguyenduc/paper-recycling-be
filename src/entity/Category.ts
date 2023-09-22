import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Product} from "./Product";
import {CategoryStatus} from "../enum";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({
    nullable: true,
    type: 'text',
  })
  description: string;
  @Column({
    default: CategoryStatus.ACTIVE,
    type: 'smallint'
  })
  status: CategoryStatus

  @Column({
    nullable: true,
    type: 'text',
  })
  image: string;

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

  @OneToMany(type => Product, product => product.category)
  products: Product[];
}

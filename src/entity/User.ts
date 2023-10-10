import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne} from "typeorm"
import * as jwt from "jsonwebtoken";
import {AppRole} from "../enum";
import Order from "./Order";
import PaperPointHistory from "./PaperPointHistory";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";
import SchoolClass from "./SchoolClass";
import School from "./School";
import {Review} from "./Review";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({
    unique: true,
  })
  email: string

  @Column()
  password: string

  @Column({
    nullable: false,
    unique: true,
  })
  studentId: string

  @Column({
    nullable: true,
  })
  phone: string


  @Column({
    nullable: true,
  })
  avatar: string

  @Column({
    nullable: true,
  })
  age: number

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

  @Column({
    default: AppRole.USER,
  })
  role: AppRole

  @Column({
    default: 0,
    type: 'decimal',
    transformer: new ColumnNumericTransformer()
  })
  paperPoint: number;

  generateJwt() {
    const payload = {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
  }

  @OneToMany(type => Order, order => order.user)
  orders: Order[];

  @OneToMany(type => PaperPointHistory, x => x.user)
  paperPointHistories: PaperPointHistory[];

  @Column({
    nullable: true,
  })
  schoolClassId: number;

  @ManyToOne(type => SchoolClass, schoolClass => schoolClass.paperCollectHistories, {
    nullable: true,
  })
  schoolClass: SchoolClass;

  @Column({
    nullable: true,
  })
  schoolId: number;
  @ManyToOne(type => School, school => school.users, {
    nullable: true,
  })
  school: School;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[]
}

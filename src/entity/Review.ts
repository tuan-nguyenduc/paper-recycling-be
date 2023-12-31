import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Product} from "./Product";
import {Post} from "./Post";


@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content: string

    @Column()
    userId: number

    @Column()
    productId: number

    @Column({
        default: 0
    })
    rating: number

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updated: Date;


    @ManyToOne(() => User, (user) => user.reviews)
    user: User

    @ManyToOne(() => Product, (product) => product.reviews)
    product: Product

}

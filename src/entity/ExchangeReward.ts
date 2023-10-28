import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import School from "./School";
import {Post} from "./Post";

@Entity()
export class ExchangeReward {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    material: string

    @Column()
    reward: number

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

    @ManyToOne(type => Post, post => post.exchangeRewards)
    post: Post;
}
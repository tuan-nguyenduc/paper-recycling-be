import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import School from "./School";
import {Post} from "./Post";
import {ExchangeRewardStatus} from "../enum";

@Entity()
export class ExchangeReward {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    material: string

    @Column({
        default: null
    })
    description: string

    @Column({
        default: null
    })
    images: string

    @Column()
    postId: number

    @Column({
        default: ExchangeRewardStatus.ACTIVE
    })
    status: ExchangeRewardStatus

    @Column({
        default: 0
    })
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
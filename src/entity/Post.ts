import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Review} from "./Review";
import {Category} from "./Category";
import School from "./School";
import {ExchangeReward} from "./ExchangeReward";
import {CampaignStatus, ProductStatus} from "../enum";
import MaterialCollectDetail from "./MaterialCollectDetail";
import MaterialCollectHistory from "./MaterialCollectHistory";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    images: string

    @Column()
    schoolId: number

    @Column({
        default: CampaignStatus.ONGOING,
        type: 'smallint'
    })
    status: CampaignStatus

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

    @ManyToOne(type => School, school => school.post)
    school: School;

    @OneToMany(() => ExchangeReward, exchangeReward => exchangeReward.post)
    exchangeRewards: ExchangeReward[];

    @OneToMany(type => MaterialCollectHistory, materialCollectHistory => materialCollectHistory.post)
    materialCollectHistories: MaterialCollectHistory[]
}
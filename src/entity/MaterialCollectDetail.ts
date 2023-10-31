import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";
import MaterialCollectHistory from "./MaterialCollectHistory";
import materialCollectHistory from "./MaterialCollectHistory";

@Entity()
class MaterialCollectDetail {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    materialCollectHistoryId: number

    @Column()
    weight: number

    @Column()
    exchangeRewardId: number

    @Column({
        type: 'decimal',
        transformer: new ColumnNumericTransformer()
    })
    reward: number

    @ManyToOne(type => MaterialCollectHistory, materialCollectHistory => materialCollectHistory.materialCollectDetails)
    materialCollectHistory: materialCollectHistory
}

export default MaterialCollectDetail
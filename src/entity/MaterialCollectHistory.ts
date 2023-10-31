import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {PaperCollectStatus} from "../enum";
import SchoolClass from "./SchoolClass";
import ColumnNumericTransformer from "./transformer/ColumnNumericTransformer";
import MaterialCollectDetail from "./MaterialCollectDetail";
import materialCollectDetail from "./MaterialCollectDetail";
import {Post} from "./Post";

@Entity()
class MaterialCollectHistory {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        default: PaperCollectStatus.CREATED,
        type: 'smallint'
    })
    status: PaperCollectStatus

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
    postId: number

    @Column({
        nullable: true
    })
    schoolClassId: number

    @ManyToOne(type => Post, post => post.materialCollectHistories, {
        nullable: true,
    })
    post: Post;

    @ManyToOne(type => SchoolClass, schoolClass => schoolClass.materialCollectHistories, {
        nullable: true,
    })
    schoolClass: SchoolClass;

    @OneToMany(type => MaterialCollectDetail, materialCollectDetail => materialCollectDetail.materialCollectHistory)
    materialCollectDetails: MaterialCollectDetail[]

    @Column({
        type: 'decimal',
        transformer: new ColumnNumericTransformer(),
        default: 0,
    })
    paperPointReward: number;
}

export default MaterialCollectHistory;
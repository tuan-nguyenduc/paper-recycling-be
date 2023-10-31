import MaterialCollectHistoryService from "../service/MaterialCollectHistoryService";
import {AuthenticatedRequest} from "../type";
import {Response} from "express";
import PostService from "../service/PostService";
import MaterialCollectHistory from "../entity/MaterialCollectHistory";
import {CampaignStatus, PaperCollectStatus} from "../enum";
import MaterialCollectDetail from "../entity/MaterialCollectDetail";
import ClassService from "../service/ClassService";
import {fromMaterialToPaperPoint} from "../util";
import materialCollectDetail from "../entity/MaterialCollectDetail";

class MaterialCollectHistoryController {
    private readonly materialCollectHistoryService: MaterialCollectHistoryService;
    private readonly postService: PostService;
    private readonly classService: ClassService;

    constructor() {
        this.materialCollectHistoryService = new MaterialCollectHistoryService();
        this.postService = new PostService();
        this.classService = new ClassService();
    }

    async createMaterialCollectHistory(req: AuthenticatedRequest, res: Response) {
        try {
            const {postId, details, schoolClassId} = req.body;
            if (!postId || !details || !schoolClassId) {
                return res.status(400).json({
                    message: 'postId, classId and collect detail are required'
                })
            }
            const post = await this.postService.findPostById(postId);
            if (!post) {
                return res.status(400).json({
                    message: 'Post not found'
                })
            }
            if (post.status !== CampaignStatus.ONGOING) {
                return res.status(400).json({
                    message: 'Post is not available'
                })
            }
            const clazz = await this.classService.findClassById(+schoolClassId);
            if(!clazz) {
                throw new Error('school class not found');
            }
            const newMaterialCollectHistory = new MaterialCollectHistory();
            newMaterialCollectHistory.postId = postId;
            newMaterialCollectHistory.status = PaperCollectStatus.CREATED;
            newMaterialCollectHistory.schoolClassId = schoolClassId;
            const savedMaterialCollectHistory = await this.materialCollectHistoryService.createMaterialCollectHistory(newMaterialCollectHistory);

            let listToCreate = [];
            for (const detail of details) {
                const materialCollectDetail = new MaterialCollectDetail();
                materialCollectDetail.materialCollectHistoryId = savedMaterialCollectHistory.id;
                materialCollectDetail.exchangeRewardId = detail.exchangeRewardId;
                materialCollectDetail.weight = detail.weight;
                materialCollectDetail.reward = detail.reward;
                listToCreate.push(materialCollectDetail)
            }

            console.log(listToCreate);
            await this.materialCollectHistoryService.createMaterialCollectDetails(listToCreate);
            return res.status(200).json({
                message: 'Create material collection success',
                data: savedMaterialCollectHistory
            });
        } catch (e: any) {
            return res.status(500).json({
                message: 'Create material collection failed ' + e.message
            })
        }
    }

    async confirmMaterialCollect(req: AuthenticatedRequest, res: Response) {
        try {
            const {id} = req.params;
            const materialCollectHistory = await this.materialCollectHistoryService.findById(+id);
            const materialCollectDetails = await this.materialCollectHistoryService.findDetailsById(+id);
            if (!materialCollectHistory) {
                throw new Error('material collect history not found');
            }
            if (materialCollectHistory.status !== PaperCollectStatus.CREATED) {
                throw new Error('cannot confirm this material collect history');
            }
            const classId = materialCollectHistory.schoolClassId;
            const schoolClass = await this.classService.findClassById(+classId);
            if (!schoolClass) {
                throw new Error('class not found');
            }
            const rewardPaperPoint = fromMaterialToPaperPoint(materialCollectDetails);
            schoolClass.rewardPaperPoint = +schoolClass.rewardPaperPoint + rewardPaperPoint;
            await this.classService.updateClass(schoolClass);

            //update paper collect history
            materialCollectHistory.status = PaperCollectStatus.COMPLETED;
            materialCollectHistory.paperPointReward = rewardPaperPoint;
            const updated = await this.materialCollectHistoryService.createMaterialCollectHistory(materialCollectHistory);
            return res.status(200).json({
                message: 'Updated material collect history',
                data: updated
            });
        } catch (e: any) {
            return res.status(500).json({
                message: e.message
            })
        }
    }

    async cancelMaterialCollect(req: AuthenticatedRequest, res: Response) {
        try {
            const {id} = req.params;
            const materialCollectHistory = await this.materialCollectHistoryService.findById(+id);
            if (!materialCollectHistory) {
                throw new Error('material collect history not found');
            }
            if (materialCollectHistory.status !== PaperCollectStatus.CREATED) {
                throw new Error('cannot cancel this paper collect history');
            }
            materialCollectHistory.status = PaperCollectStatus.CANCELLED;
            const updated = await this.materialCollectHistoryService.createMaterialCollectHistory(materialCollectHistory);
            return res.status(200).json({
                message: 'updated',
                data: updated
            });

        } catch (err: any) {
            console.log("cancel material collect history error", err);
            return res.status(500).json({
                message: err.message
            })
        }
    }

    async updateMaterialCollect(req: AuthenticatedRequest, res: Response) {
        try {
            const {id} = req.params;
            const {postId, details, schoolClassId} = req.body;
            const materialCollectHistory = await this.materialCollectHistoryService.findById(+id);
            if(!materialCollectHistory) {
                throw new Error('material collect history not found');
            }
            if (materialCollectHistory.status !== PaperCollectStatus.CREATED) {
                throw new Error('cannot update this material collect history')
            }
            if (postId) {
                const post = await this.postService.findPostById(postId);
                if (!post) {
                    throw new Error('post not found')
                }
                else {
                    materialCollectHistory.postId = postId
                }
            }

            if (schoolClassId) {
                materialCollectHistory.schoolClassId = schoolClassId;
            }

            let materialDetails = await this.materialCollectHistoryService.findDetailsById(+id)
            console.log(materialDetails)

            let listToUpdate = [];
            if (details) {for (let i = 0; i < details.length; i++) {
                    const materialCollectDetail = new MaterialCollectDetail();
                    materialCollectDetail.id = materialDetails[i].id;
                    materialCollectDetail.materialCollectHistoryId = +id;
                    materialCollectDetail.exchangeRewardId = details[i].exchangeRewardId;
                    materialCollectDetail.weight = details[i].weight;
                    materialCollectDetail.reward = details[i].reward;
                    listToUpdate.push(materialCollectDetail)
                }
            }
            await this.materialCollectHistoryService.updateMaterialCollectDetail(listToUpdate);
            const updated = await this.materialCollectHistoryService.updateMaterialCollectHistory(materialCollectHistory)
            return res.status(200).json({
                message: 'Update material collect successfully',
                data: updated
            })

        } catch (e: any) {
            return res.status(500).json({
                message: e.message
            })
        }
    }

    async findAllPaginated(req: AuthenticatedRequest, res: Response) {
        try {
            const params = req.query;
            const pagination = await this.materialCollectHistoryService.getAllMaterialCollectHistoriesPaginated(params);
            //console.log(pagination)
            return res.status(200).json({
                message: 'get all material collect history success',
                data: pagination
            });
        } catch (err: any) {
            console.log("find all paper collect history error", err);
            return res.status(500).json({
                message: err.message
            })
        }
    }
}



export default MaterialCollectHistoryController
import ExchangeRewardService from "../service/ExchangeRewardService";
import {AuthenticatedRequest} from "../type";
import {Request, Response} from "express";
import {ExchangeReward} from "../entity/ExchangeReward";
import PostService from "../service/PostService";
import {CampaignStatus} from "../enum";

export default class ExchangeRewardController {
    private readonly exchangeRewardService: ExchangeRewardService;
    private readonly postService: PostService;
    constructor() {
        this.exchangeRewardService = new ExchangeRewardService();
        this.postService = new PostService();
    }

    async createExchangeReward(req: AuthenticatedRequest, res: Response) {
        try {
            const {material, description, images, reward, postId,} = req.body;
            if (!material || !reward || !postId || !images || !description) {
                return res.status(400).json({
                    message: "Material, reward, images, description are required"
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
            const exchangeReward = new ExchangeReward();
            exchangeReward.material = material;
            exchangeReward.reward = reward;
            exchangeReward.post = post;
            exchangeReward.description = description;
            exchangeReward.images = images;
            const savedExchangeReward = await this.exchangeRewardService.createExchangeReward(exchangeReward);
            return res.status(200).json({
                message: 'Create exchange reward success',
                data: savedExchangeReward
            })
        } catch (e: any) {
            return res.status(500).json({
                message: "Create exchange reward failed" + e.message
            })
        }
    }

    async getAllExchangeRewards(req: Request, res: Response) {
        try {
            const params = req.query;
            const products = await this.exchangeRewardService.findExChangeRewardPagination(params);

            return res.status(200).json({
                message: 'Get all exchange rewards success',
                data: products
            })

        } catch (err: any) {
            return res.status(500).json({
                message: 'Get all exchange rewards failed ' + err.message
            })
        }
    }

    async deleteExchangeReward(req: AuthenticatedRequest, res: Response) {
        try {
            const id = req.params.id;
            const existedExchangeReward = await this.exchangeRewardService.findExchangeRewardById(+id);
            if (!existedExchangeReward) return res.status(400).json({
                message: 'Exchange Reward not found'
            })
            await this.exchangeRewardService.deleteExchangeReward(existedExchangeReward)
            return res.status(200).json({
                message: 'Delete Exchange Reward successfully'
            })
        } catch (err: any) {
            return res.status(500).json({
                message: 'Delete Exchange Reward failed ' + err.message
            })
        }
    }

    async updateExchangeReward(req: AuthenticatedRequest, res: Response) {
        try {
            const id = req.params.id;
            const {material, description, images, reward, postId} = req.body;
            const existedExchangeReward = await this.exchangeRewardService.findExchangeRewardById(+id);
            if (!existedExchangeReward) return res.status(400).json({
                message: 'Exchange Reward not found'
            })
            if (material) existedExchangeReward.material = material;
            if (description) existedExchangeReward.description = description;
            if (images) existedExchangeReward.images = images;
            if (reward) existedExchangeReward.reward = reward;
            if(postId) {
                const post = this.postService.findPostById(postId);
                if (!post) {
                    return res.status(400).json({
                        message: 'Campaign not found'
                    })
                }
                existedExchangeReward.post = await post;
            }
            const updatedExchangeReward = await this.exchangeRewardService.updateExchangeReward(existedExchangeReward);
            return res.status(200).json({
                message: 'Update Exchange Reward success',
                data: updatedExchangeReward
            });
        } catch (err: any) {
            return res.status(500).json({
                message: 'Update Exchange Reward failed ' + err.message
            })
        }
    }

    async getExchangeRewardById(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const exchangeReward = await this.exchangeRewardService.findExchangeRewardById(+id);
            if (!exchangeReward) return res.status(400).json({
                message: 'Exchange reward not found'
            })
            return res.status(200).json({
                message: 'Get exchange reward by id successfully',
                data: exchangeReward
            })

        } catch (err: any) {
            console.log("getExchangeRewardById error: ", err);
            return res.status(500).json({
                message: 'Get exchange Reward by id failed ' + err.message
            })
        }
    }

}
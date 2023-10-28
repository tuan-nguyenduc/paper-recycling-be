import ExchangeRewardService from "../service/ExchangeRewardService";
import {AuthenticatedRequest} from "../type";
import {Request, Response} from "express";
import {ExchangeReward} from "../entity/ExchangeReward";
import PostService from "../service/PostService";

export default class ExchangeRewardController {
    private readonly exchangeRewardService: ExchangeRewardService;
    private readonly postService: PostService;
    constructor() {
        this.exchangeRewardService = new ExchangeRewardService();
        this.postService = new PostService();
    }

    async createExchangeReward(req: AuthenticatedRequest, res: Response) {
        try {
            const {material, reward, postId} = req.body;
            if (!material || !reward || !postId) {
                return res.status(400).json({
                    message: "Material, reward are required"
                })
            }

            const post = await this.postService.findPostById(postId);
            if (!post) {
                return res.status(400).json({
                    message: 'Post not found'
                })
            }
            const exchangeReward = new ExchangeReward();
            exchangeReward.material = material;
            exchangeReward.reward = reward;
            exchangeReward.post = post
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

}
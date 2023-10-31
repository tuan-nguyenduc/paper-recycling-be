import PostService from "../service/PostService";
import {AuthenticatedRequest} from "../type";
import {Request, Response} from "express";
import {Post} from "../entity/Post";
import SchoolService from "../service/SchoolService";
import ExchangeRewardService from "../service/ExchangeRewardService";
import {CampaignStatus} from "../enum";

export default class PostController {
    private readonly postService: PostService;
    private readonly schoolService: SchoolService;
    private readonly exchangeRewardService: ExchangeRewardService

    constructor() {
        this.postService = new PostService();
        this.schoolService = new SchoolService();
        this.exchangeRewardService = new ExchangeRewardService()
    }

    async createPost(req: AuthenticatedRequest, res: Response) {
        try {
            const {name, description, images, schoolId} = req.body;
            console.log(name + description + images + schoolId);
            if (!name || !description || !schoolId || !images) {
                return res.status(400).json({
                    message: 'Name, description, school, images are required'
                })
            }
            const school = await this.schoolService.findSchoolById(schoolId);

            if (!school) {
                return res.status(400).json({
                    message: 'School not found'
                })
            }
            const post = new Post();
            post.name = name;
            post.description = description;
            post.images = images;
            post.school = school;
            const savedPost = await this.postService.createPost(post);
            return res.status(200).json({
                message: 'Create post success',
                data: savedPost
            })
        } catch (e: any) {
            return res.status(500).json({
                message: "Create post failed" + e.message
            })
        }
    }

    async getAllPost(req: Request, res: Response) {
        try {
            const params = req.query;
            const posts = await this.postService.findPostPagination(params);

            return res.status(200).json({
                message: "Get all posts success",
                data: posts
            })
        } catch (e: any) {
            return res.status(500).json({
                message: 'Get all posts failed' + e.message
            })
        }
    }

    async updatePost(req: AuthenticatedRequest, res: Response) {
        try {
            const id = req.params.id;
            const {name, description, images, status} = req.body;
            const existedPost = await this.postService.findPostById(+id);
            if (!existedPost) return res.status(400).json({
                message: 'Product not found'
            })
            if (name) existedPost.name = name;
            if (description) existedPost.description = description;
            if (images) existedPost.images = images;
            if (status) existedPost.status = status;
            const updatedProduct = await this.postService.updatePost(existedPost);
            return res.status(200).json({
                message: 'Update post success',
                data: updatedProduct
            });
        } catch (err: any) {
            return res.status(500).json({
                message: 'Update post failed ' + err.message
            })
        }
    }

    async deletePost(req: AuthenticatedRequest, res: Response) {
        try {
            const id = req.params.id;
            const existedPost = await this.postService.findPostById(+id);
            if (!existedPost) return res.status(400).json({
                message: 'Post not found'
            })
            await this.postService.deletePost(existedPost)
            const exchangeRewards = await this.exchangeRewardService.findExchangeRewardsByPostId(+id);
            for (const exchangeReward of exchangeRewards) {
                await this.exchangeRewardService.deleteExchangeReward(exchangeReward);
            }
            return res.status(200).json({
                message: 'Delete post success'
            })
        } catch (err: any) {
            return res.status(500).json({
                message: 'Delete post failed ' + err.message
            })
        }
    }

    async finish(req: AuthenticatedRequest, res: Response) {
        try {
            const {id} = req.params;
            const campaign = await this.postService.findPostById(+id);
            if (!campaign) {
                throw new Error('Campaign is not found');
            }
            campaign.status = CampaignStatus.COMPLETED;
            const finishData = await this.postService.updatePost(campaign);
            return res.status(200).json({
                message: 'Finished campaign successfully'
            })

        } catch (e) {
            return res.status(500).json({
                message: 'Finish campaign failed ' + e.message
            })
        }
    }

}

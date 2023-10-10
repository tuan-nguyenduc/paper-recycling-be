import ReviewService from "../service/ReviewService";
import {AuthenticatedRequest} from "../type";
import {Response} from "express";
import {Review} from "../entity/Review";

class ReviewController {
    private readonly reviewService: ReviewService;

    constructor() {
        this.reviewService = new ReviewService();
    }

    async createReview(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user.id;
            const {content, productId} = req.body;
            if (!content) {
                return res.status(400).json({
                    message: "Content is required!"
                });
            }
            const foundReview = await this.reviewService.findReviewByUserIdAndProductId(userId, productId);
            if (foundReview) {
                return res.status(400).json({
                    message: "Cannot create review. You reviewed this product before"
                });
            }
            const review = new Review();
            review.content = content;
            review.userId = userId;
            review.productId = productId;
            const savedReview = await this.reviewService.createReview(review)
            return res.status(200).json({
                message: 'Create review success',
                data: savedReview,
            })
        } catch (err: any) {
           return res.status(500).json({
               message: 'Create review failed' + err.message
           })
        }
    }
}

export default ReviewController
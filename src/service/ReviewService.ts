import {Repository} from "typeorm";
import {Review} from "../entity/Review";
import {AppDataSource} from "../data-source";

class ReviewService {
    private readonly reviewRepository: Repository<Review>

    constructor() {
        this.reviewRepository = AppDataSource.getRepository(Review);
    }

    async createReview(review: Review) {
        return this.reviewRepository.save(review);
    }

    async findReviewByUserIdAndProductId(userId: number, productId: number) {
        return await this.reviewRepository.findOne({
            where: {
                userId: userId,
                productId: productId
            }
        })
    }

}

export default ReviewService
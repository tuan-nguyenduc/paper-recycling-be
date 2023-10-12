import {Repository} from "typeorm";
import {Review} from "../entity/Review";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";
import {UserDTO} from "../dto/UserDTO";

class ReviewService {
    private readonly reviewRepository: Repository<Review>

    constructor() {
        this.reviewRepository = AppDataSource.getRepository(Review);
    }

    async createReview(review: Review) {
        return this.reviewRepository.save(review);
    }

    async findReviewByUserIdAndProductId(productId: number, userId: number) {
        return await this.reviewRepository.find({
            where: {
                productId: productId,
                userId: userId,
            },
        })
    }

    async findReviewPagination(params: any): Promise<Pagination<Review>> {
        const {
            page = 0,
            limit = 10,
            productId,
            userId,
        } = params;
        const baseQueryOptions: any = {
            where: {

            },
            skip: page * limit,
            take: limit,
            relations: ['user', 'product']
        }
        if (productId) {
            baseQueryOptions.where = {
                ...baseQueryOptions.where,
                productId
            }
        }
        if (userId) {
            baseQueryOptions.where = {
                ...baseQueryOptions.where,
                userId
            }
        }

        const list = await this.reviewRepository.find(baseQueryOptions);
        const total = await this.reviewRepository.count(baseQueryOptions);

        return {
            contents: list.map((item: any) => ({
                ...item,
                user: new UserDTO(item.user)
            })),
            currentPage: page,
            perPage: limit,
            totalPage: Math.ceil(total/limit),
            totalElements: total
        }
    }

}

export default ReviewService
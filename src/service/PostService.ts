import {Post} from "../entity/Post";
import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";
import ReviewController from "../controller/ReviewController";
import {Product} from "../entity/Product";
import {CampaignStatus, ProductStatus} from "../enum";

class PostService {
    private readonly postRepository: Repository<Post>

    constructor() {
        this.postRepository = AppDataSource.getRepository(Post);
    }

    async createPost(post: Post) {
        return this.postRepository.save(post);
    }

    async deletePost(post: Post) {
        post.status = CampaignStatus.DELETED;
        return await this.postRepository.save(post);
    }

    async updatePost(post: Post) {
        return await this.postRepository.save(post);
    }


    async findPostPagination(params: any): Promise<Pagination<Post>> {
        const {
            page = 0,
            limit = 10,
            schoolId,
        } = params;

        const baseQueryOptions: any = {
            where: {
                status: CampaignStatus.ONGOING || CampaignStatus.COMPLETED || CampaignStatus.CANCELLED

            },
            skip: page * limit,
            take: limit,
            relations: ['school', 'exchangeRewards']
        }

        if (schoolId) {
            baseQueryOptions.where = {
                ...baseQueryOptions.where,
                schoolId
            }
        }

        const list = await this.postRepository.find(baseQueryOptions);
        const total = await this.postRepository.count(baseQueryOptions);

        return {
            contents: list,
            currentPage: page,
            perPage: limit,
            totalPage: Math.ceil(total / limit),
            totalElements: total
        }
    }

    async findPostById(id: number) {
        return await this.postRepository.findOne({
            where: {
                id,
            },
        });
    }

}

export default PostService
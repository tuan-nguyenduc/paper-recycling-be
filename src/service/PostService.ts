import {Post} from "../entity/Post";
import {Like, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";
import {CampaignStatus} from "../enum";
import {query} from "express";

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
            status,
            q,
        } = params;

        let baseQueryOptions: any = {
            where: [
                {status: CampaignStatus.COMPLETED},
                {status: CampaignStatus.CANCELLED},
                {status: CampaignStatus.ONGOING}
            ],
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

        if (status) {
            baseQueryOptions.where = []
            baseQueryOptions.where = {
                ...baseQueryOptions.where,
                status
            }
        }
        if (q) {
            baseQueryOptions.where = baseQueryOptions.where.map(query => ({
                ...query,
                name: Like(`%${q}%`)
            }))
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
            relations: ['exchangeRewards', 'school']
        });
    }

}

export default PostService
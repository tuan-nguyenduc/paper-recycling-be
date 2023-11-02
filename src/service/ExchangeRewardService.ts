import {Like, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {ExchangeReward} from "../entity/ExchangeReward";
import {Pagination} from "../type";
import {CampaignStatus, ExchangeRewardStatus} from "../enum";
import {Post} from "../entity/Post";

export default class ExchangeRewardService {
    private readonly exchangeRewardRepository: Repository<ExchangeReward>

    constructor() {
        this.exchangeRewardRepository = AppDataSource.getRepository(ExchangeReward);

    }

    async createExchangeReward(exchangeReward: ExchangeReward) {
        return this.exchangeRewardRepository.save(exchangeReward);
    }

    async updateExchangeReward(exchangeReward: ExchangeReward) {
        return await this.exchangeRewardRepository.save(exchangeReward);
    }

    async deleteExchangeReward(exchangeReward: ExchangeReward) {
        exchangeReward.status = ExchangeRewardStatus.DELETED;
        return await this.exchangeRewardRepository.save(exchangeReward);
    }

    async findExChangeRewardPagination(params: any): Promise<Pagination<ExchangeReward>> {
        const {
            page = 0,
            limit = 10,
            postId,
            q = ""
        } = params

        const baseQueryOptions: any = {
            where: {
                status: ExchangeRewardStatus.ACTIVE
            },
            skip: page * limit,
            take: limit,
            relations: ['post']
        }

        if (postId) {
            baseQueryOptions.where = {
                ...baseQueryOptions.where,
                postId
            }
        }
        if (q) {
            baseQueryOptions.where = {
                ...baseQueryOptions.where,
                material: Like(`%${q}%`)
            }
        }

        const list = await this.exchangeRewardRepository.find(baseQueryOptions);
        const total = await this.exchangeRewardRepository.count(baseQueryOptions);

        return {
            contents: list,
            currentPage: page,
            perPage: limit,
            totalPage: Math.ceil(total/limit),
            totalElements: total
        }

    }

    async findExchangeRewardById(id: number) {
        return await this.exchangeRewardRepository.findOne({
            where: {
                id,
            },
        });
    }

    async findExchangeRewardsByPostId(id: number) {
        return await this.exchangeRewardRepository.find({
            where: {
                postId: id,
            },
        });
    }
}
import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {ExchangeReward} from "../entity/ExchangeReward";
import {Pagination} from "../type";
import {CampaignStatus} from "../enum";

export default class ExchangeRewardService {
    private readonly exchangeRewardRepository: Repository<ExchangeReward>

    constructor() {
        this.exchangeRewardRepository = AppDataSource.getRepository(ExchangeReward);

    }

    async createExchangeReward(exchangeReward: ExchangeReward) {
        return this.exchangeRewardRepository.save(exchangeReward);
    }

    async findExChangeRewardPagination(params: any): Promise<Pagination<ExchangeReward>> {
        const {
            page = 0,
            limit = 10,
            postId
        } = params

        const baseQueryOptions: any = {
            where: {
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
}
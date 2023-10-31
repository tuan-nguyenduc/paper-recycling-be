import {Repository} from "typeorm";
import MaterialCollectHistory from "../entity/MaterialCollectHistory";
import MaterialCollectDetail from "../entity/MaterialCollectDetail";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";

class MaterialCollectHistoryService {
    private readonly materialCollectHistoryRepository: Repository<MaterialCollectHistory>;
    private readonly materialCollectHistoryDetailRepository: Repository<MaterialCollectDetail>;

    constructor() {
        this.materialCollectHistoryRepository = AppDataSource.getRepository(MaterialCollectHistory);
        this.materialCollectHistoryDetailRepository = AppDataSource.getRepository(MaterialCollectDetail);
    }

    async createMaterialCollectHistory(materialCollectHistory: MaterialCollectHistory) {
        return this.materialCollectHistoryRepository.save(materialCollectHistory);
    }

    async updateMaterialCollectHistory(materialCollectHistory: MaterialCollectHistory) {
        return this.materialCollectHistoryRepository.save(materialCollectHistory);
    }

    async getMaterialCollectHistoryById(id: number) {
        return this.materialCollectHistoryRepository.findOne({
            where: {
                id
            }
        })
    }

    async getAllMaterialCollectHistoriesPaginated(params: any = {}): Promise<Pagination<MaterialCollectHistory>> {
        const {page = 0, limit = 10, status, sortDirection, sortBy, q = "", id} = params;
        const baseQueryOption: any = {
            where: {

            },
            skip: +page * +limit,
            take: +limit,
            relations: ['materialCollectDetails', 'schoolClass', 'post', 'schoolClass.school']
        }

        if (id) {
            baseQueryOption.where = {
                ...baseQueryOption.where,
                id
            }
        }
        if (status) {
            baseQueryOption.where = {
                ...baseQueryOption.where,
                status
            }
        }
        if (sortDirection && sortBy) {
            baseQueryOption.order = {
                [sortBy]: sortDirection
            }
        }

        const res = await this.materialCollectHistoryRepository.findAndCount(baseQueryOption);
        return {
            contents: res[0],
            currentPage: page,
            perPage: limit,
            totalPage: Math.ceil(res[1] / limit),
            totalElements: res[1]
        }
    }

    createMaterialCollectDetail(materialCollectDetail: MaterialCollectDetail) {
       return this.materialCollectHistoryDetailRepository.save(materialCollectDetail);
    }

    createMaterialCollectDetails(materialCollectDetails: MaterialCollectDetail[]) {
        return this.materialCollectHistoryDetailRepository.save(materialCollectDetails);
    }

    updateMaterialCollectDetail(materialCollectDetail: MaterialCollectDetail[]) {
        return this.materialCollectHistoryDetailRepository.save(materialCollectDetail);
    }

    findById(id: number) {
        return this.materialCollectHistoryRepository.findOne({
            where: {
                id
            },
            relations: ['materialCollectDetails']
        });
    }

    findDetailsById(id: number) {
        return this.materialCollectHistoryDetailRepository.find({
            where: {
                materialCollectHistoryId: id
            },
        });
    }
}

export default MaterialCollectHistoryService
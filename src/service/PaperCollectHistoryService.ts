import {Repository} from "typeorm";
import PaperCollectHistory from "../entity/PaperCollectHistory";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";
import {Product} from "../entity/Product";

class PaperCollectHistoryService {
  private readonly paperCollectHistoryRepository: Repository<PaperCollectHistory>;

  constructor() {
    this.paperCollectHistoryRepository = AppDataSource.getRepository(PaperCollectHistory);
  }

  create(paperCollectHistory: PaperCollectHistory) {
    return this.paperCollectHistoryRepository.save(paperCollectHistory);
  }

  async findAllPaginated(params: any): Promise<Pagination<PaperCollectHistory>> {
    const {page = 0, limit = 10, status, schoolClassId, sortBy = "", sortDirection = ""} = params;
    const baseQueryOptions: any = {
      where: {},
      skip: +page * +limit,
      take: +limit,
      relations: ['schoolClass', "schoolClass.school"]
    }
    if (status) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        status
      }
    }
    if (schoolClassId) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        schoolClassId
      }
    }
    if(sortDirection && sortBy) {
      baseQueryOptions.order = {
        [sortBy]: sortDirection.toUpperCase()
      }
    }
    const res = await this.paperCollectHistoryRepository.findAndCount(baseQueryOptions);
    return {
      contents: res[0],
      currentPage: page,
      perPage: limit,
      totalPage: Math.ceil(res[1] / limit),
      totalElements: res[1]
    }
  }

  findById(id: number) {
    return this.paperCollectHistoryRepository.findOne({
      where: {
        id
      }
    });
  }
}

export default PaperCollectHistoryService;

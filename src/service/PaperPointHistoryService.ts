import PaperPointHistory from "../entity/PaperPointHistory";
import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";

class PaperPointHistoryService {
  private readonly paperPointHistoryRepository: Repository<PaperPointHistory>;

  constructor() {
    this.paperPointHistoryRepository = AppDataSource.getRepository(PaperPointHistory);
  }

  async create(paperPointHistory: PaperPointHistory) {
    return await this.paperPointHistoryRepository.save(paperPointHistory);
  }
}

export default PaperPointHistoryService;

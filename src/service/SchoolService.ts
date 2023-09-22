import School from "../entity/School";
import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {SchoolStatus} from "../enum";
import {Pagination} from "../type";

export default class SchoolService {
  private readonly schoolRepository: Repository<School>;

  constructor() {
    this.schoolRepository = AppDataSource.getRepository(School);
  }

  public async findAllSchool(page: number, limit: number): Promise<Pagination<School>> {
    const list = await this.schoolRepository.find({
      where: {
        status: SchoolStatus.ACTIVE
      },
      skip: page * limit,
      take: limit
    });
    const total = await this.schoolRepository.count({
      where: {
        status: SchoolStatus.ACTIVE
      }
    });
    return {
      contents: list,
      currentPage: page,
      perPage: limit,
      totalPage: Math.ceil(total / limit),
      totalElements: total
    }

  }

  public async createSchool(school: School): Promise<School> {
    return await this.schoolRepository.save(school);
  }

  public async findSchoolById(id: number, withClass = false): Promise<School | undefined> {
    const condition: any = withClass ? {
      where: {
        id
      },
      relations: ['classes']
    } : {
      where: {
        id
      }
    }
    return await this.schoolRepository.findOne(condition);
  }

  public async updateSchool(school: School): Promise<School> {
    return await this.schoolRepository.save(school);
  }

  public async deleteSchool(id: number): Promise<void> {
    const school = await this.findSchoolById(id);
    if (!school) {
      throw new Error('School not found');
    }
    school.status = SchoolStatus.DELETED;
    await this.schoolRepository.save(school);
  }
}

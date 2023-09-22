import SchoolClass from "../entity/SchoolClass";
import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";
import {ClassStatus} from "../enum";

export default class ClassService {
  private readonly classRepository: Repository<SchoolClass>;

  constructor() {
    this.classRepository = AppDataSource.getRepository(SchoolClass);
  }

  public async findAllClass(page: number, limit: number, params = {}): Promise<Pagination<SchoolClass>> {
    const list = await this.classRepository.find({
      skip: page * limit,
      take: limit,
      where: {
        ...params,
        status: ClassStatus.ACTIVE
      },
      relations: ['school']
    });
    const total = await this.classRepository.count({
      where: {
        ...params
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

  public async createClass(schoolClass: SchoolClass): Promise<SchoolClass> {
    return await this.classRepository.save(schoolClass);
  }

  public async updateClass(schoolClass: SchoolClass): Promise<SchoolClass> {
    return await this.classRepository.save(schoolClass);
  }

  public async findClassById(id: number): Promise<SchoolClass | undefined> {
    return await this.classRepository.findOne({
      where: {
        id,
        status: ClassStatus.ACTIVE
      }
    });
  }

  async findClassBySchoolId(schoolId: number): Promise<SchoolClass[]> {
    return await this.classRepository.find({
      where: {
        schoolId
      }
    });
  }

  public async deleteClass(id: number): Promise<any> {
    const clazz = await this.findClassById(id);
    if (!clazz) {
      return {
        message: 'Class not found'
      }
    }
    clazz.status = ClassStatus.DELETED;
    return await this.classRepository.save(clazz);
    // return await this.classRepository.delete(id);
  }
}

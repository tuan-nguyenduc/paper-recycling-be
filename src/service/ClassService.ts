import SchoolClass from "../entity/SchoolClass";
import {Like, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";
import {ClassStatus} from "../enum";

export default class ClassService {
  private readonly classRepository: Repository<SchoolClass>;

  constructor() {
    this.classRepository = AppDataSource.getRepository(SchoolClass);
  }

  public async findAllClass(page: number, limit: number, params: any): Promise<Pagination<SchoolClass>> {
    const {
      q = "",
      schoolId = null,
    } = params;
    const baseQueryOptions: any = {
      skip: page * limit,
      take: limit,
      where: {
        status: ClassStatus.ACTIVE
      },
      relations: ['school']
    }

    if (schoolId) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        schoolId
      }
    }
    if (q) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        name: Like(`%${q}%`)
      }
    }

    const list = await this.classRepository.find(baseQueryOptions);
    const total = await this.classRepository.count(baseQueryOptions);

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

import {Like, Repository} from "typeorm";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";
import {UserDTO} from "../dto/UserDTO";

class UserService {
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUser(user: User): Promise<User> {
    const existUser = await this.userRepository.findOne({
      where: {
        email: user.email
      }
    })
    if (existUser) throw new Error('User already exist')
    return await this.userRepository.save(user)
  }

  async findUserById(id: number, withRelation = false): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id
      },
      relations: withRelation ? ['schoolClass', "schoolClass.school"] : []
    })
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        email
      }
    })
  }

  async findAllUsers(params: any): Promise<Pagination<UserDTO>> {
    const {page = 0, limit = 10, schoolId, schoolClassId, sortBy = "", sortDirection = "", q = ""} = params;

    const baseQueryOptions: any = {
      where: {},
      skip: +page * +limit,
      take: +limit,
      relations: ['schoolClass', "schoolClass.school"]
    }
    if (schoolId) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        schoolId
      }
    }
    if (schoolClassId) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        schoolClassId
      }
    }
    if (q) {

      baseQueryOptions.where = [
        {
          ...baseQueryOptions.where,
          name: Like(`%${q}%`)
        },
        {
          ...baseQueryOptions.where,
          email: Like(`%${q}%`)
        },
        {
          ...baseQueryOptions.where,
          studentId: Like(`%${q}%`)
        },
        {
          ...baseQueryOptions.where,
          phone: Like(`%${q}%`)
        }
      ]

    }
    if (sortDirection && sortBy) {
      baseQueryOptions.order = {
        [sortBy]: sortDirection.toUpperCase()
      }
    }
    const res = await this.userRepository.findAndCount(baseQueryOptions);
    return {
      contents: res[0].map((u: User) => new UserDTO(u)),
      currentPage: page,
      perPage: limit,
      totalPage: Math.ceil(res[1] / limit),
      totalElements: res[1]
    }
  }

  async findByStudentId(studentId: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        studentId
      }
    })
  }

  async updateUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async createUsers(users: User[]): Promise<User[]> {
    return await this.userRepository.save(users);
  }

}

export default UserService;

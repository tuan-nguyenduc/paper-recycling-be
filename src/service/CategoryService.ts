import {Like, Repository} from "typeorm";
import {Category} from "../entity/Category";
import {AppDataSource} from "../data-source";
import {CategoryStatus} from "../enum";

export class CategoryService {
  private readonly categoryRepository: Repository<Category>

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category)
  }

  async createCategory(category: Category): Promise<Category> {
    return await this.categoryRepository.save(category)
  }

  async findCategoryById(id: number): Promise<Category> {
    return await this.categoryRepository.findOne({
      where: {
        id
      }
    })
  }

  async findAllCategories(params: any): Promise<Category[]> {
    const {
      q = "",
    } = params;
    const baseQueryOptions: any = {
      where: {
        status: CategoryStatus.ACTIVE
      }
    }
    if (q) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        name: Like(`%${q}%`)
      }
    }
    return await this.categoryRepository.find(baseQueryOptions)
  }

  async updateCategory(category: Category): Promise<Category> {
    return await this.categoryRepository.save(category)
  }

  deleteCategory(category: Category): Promise<Category> {
    category.status = CategoryStatus.DELETED
    return this.categoryRepository.save(category)
  }
}

import {Between, In, LessThan, Like, MoreThan, Repository} from "typeorm";
import {Product} from "../entity/Product";
import {AppDataSource} from "../data-source";
import {ProductStatus} from "../enum";
import {Pagination} from "../type";

class ProductService {
  private readonly productRepository: Repository<Product>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
  }

  async createProduct(product: Product) {
    return await this.productRepository.save(product);
  }

  async findProductPagination(params: any): Promise<Pagination<Product>> {
    const {
      page = 0,
      limit = 10,
      categoryId,
      sortDirection,
      sortBy,
      q = "",
      startPrice = null,
      endPrice = null
    } = params;
    const baseQueryOptions: any = {
      where: {
        status: ProductStatus.ACTIVE
      },
      skip: page * limit,
      take: limit,
      relations: ['category']
    }
    if (categoryId) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        categoryId
      }
    }
    if (sortDirection && sortBy) {
      baseQueryOptions.order = {
        [sortBy]: sortDirection
      }
    }
    if (q) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        name: Like(`%${q}%`)
      }
    }
    if (startPrice !== null && endPrice !== null) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        price: Between(+startPrice, +endPrice)
      }
    } else if (startPrice !== null) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        price: MoreThan(+startPrice)
      }
    } else if (endPrice !== null) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        price: LessThan(+endPrice)
      }
    }

    const list = await this.productRepository.find(baseQueryOptions);
    const total = await this.productRepository.count(baseQueryOptions);
    return {
      contents: list,
      currentPage: page,
      perPage: limit,
      totalPage: Math.ceil(total / limit),
      totalElements: total
    }
  }

  async findProductById(id: number) {
    return await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['category']
    });
  }

  async deleteProduct(product: Product) {
    product.status = ProductStatus.DEACTIVE;
    return await this.productRepository.save(product);
  }

  async updateProduct(product: Product) {
    return await this.productRepository.save(product);
  }

  async findProductsByIds(ids: number[]) {
    return this.productRepository.find({
      where: {
        id: In(ids)
      }
    })
  }

  async getMaxPrice() {
    const res = await this.productRepository.createQueryBuilder('product')
      .select('MAX(product.price)', 'maxPrice')
      .getRawOne();
    return res.maxPrice;
  }

}

export default ProductService;

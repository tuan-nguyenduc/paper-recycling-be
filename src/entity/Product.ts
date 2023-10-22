import {Like, Repository} from "typeorm";
import Order from "../entity/Order";
import {AppDataSource} from "../data-source";
import {OrderStatus} from "../enum";
import OrderDetail from "../entity/OrderDetail";
import {Pagination} from "../type";

class OrderService {
  private readonly orderRepository: Repository<Order>
  private readonly orderDetailRepository: Repository<OrderDetail>

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderDetailRepository = AppDataSource.getRepository(OrderDetail);
  }

  async createOrder(order: Order) {
    return this.orderRepository.save(order);
  }

  async updateOrder(order: Order) {
    return this.orderRepository.save(order);
  }

  async getOrderById(id: number) {
    return this.orderRepository.findOne({
      where: {
        id
      }
    });
  }

  async getOrdersByUserId(userId: number) {
    return this.orderRepository.find({
      where: {
        userId,
      }
    });
  }

  async getOrdersByUserIdAndStatus(userId: number, status: OrderStatus) {
    return this.orderRepository.find({
      where: {
        userId,
        status
      }
    })
  }

  async getOrdersByUserIdAndStatusPaginated(userId: number, params: any): Promise<Pagination<Order>> {
    const {page = 0, limit = 10, status, sortDirection, sortBy, q = "", id} = params;
    const baseQueryOption: any = {
      where: {
        userId
      },
      skip: page * limit,
      take: limit,
      relations: ['orderDetails', "orderDetails.product", "user"]
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
    if (q) {
      baseQueryOption.where = {
        ...baseQueryOption.where,
        orderDetails: {
          product: {
            name: Like(`%${q}%`)
          }
        }
      }
    }
    const list = await this.orderRepository.find(baseQueryOption);
    const count = await this.orderRepository.count(baseQueryOption);

    return {
      contents: list,
      currentPage: page,
      perPage: limit,
      totalPage: Math.ceil(count / limit),
      totalElements: count
    }
  }

  async getOrdersPaginated(params: any = {}): Promise<Pagination<Order>> {
    const {page = 0, limit = 10, status, sortDirection, sortBy, q = "", id} = params;
    const baseQueryOption: any = {
      where: {},
      skip: page * limit,
      take: limit,
      relations: ['orderDetails', "orderDetails.product", "user"]
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
    if (q) {
      baseQueryOption.where = {
        ...baseQueryOption.where,
        orderDetails: {
          product: {
            name: Like(`%${q}%`)
          }
        }
      }
    }
    const list = await this.orderRepository.find(baseQueryOption);
    const count = await this.orderRepository.count(baseQueryOption);

    return {
      contents: list,
      currentPage: page,
      perPage: limit,
      totalPage: Math.ceil(count / limit),
      totalElements: count
    }


  }

  getOrderDetailByOrderIdAndProductId(orderId: number, productId: number) {
    return this.orderDetailRepository.findOne({
      where: {
        orderId,
        productId,
      }
    });
  }

  async getOrderDetailsByOrderId(orderId: number) {
    return this.orderDetailRepository.find({
      where: {
        orderId,
      }
    });
  }

  createOrderDetail(orderDetail: OrderDetail) {
    return this.orderDetailRepository.save(orderDetail);
  }

  updateOrderDetail(orderDetail: OrderDetail) {
    return this.orderDetailRepository.save(orderDetail);
  }

  deleteOrderDetail(orderDetailId: number) {
    return this.orderDetailRepository.delete(orderDetailId);
  }


}

export default OrderService;

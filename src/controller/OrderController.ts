import OrderService from "../service/OrderService";
import {AuthenticatedRequest} from "../type";
import {Response} from "express";
import {OrderStatus, PaperPointHistoryType, ProductStatus} from "../enum";
import Order from "../entity/Order";
import ProductService from "../service/ProductService";
import OrderDetail from "../entity/OrderDetail";
import UserService from "../service/UserService";
import {AppDataSource} from "../data-source";
import PaperPointHistory from "../entity/PaperPointHistory";
import PaperPointHistoryService from "../service/PaperPointHistoryService";

class OrderController {
  private readonly orderService: OrderService
  private readonly productService: ProductService
  private readonly userService: UserService
  private static _queryRunner: any = null;
  private readonly paperPointHistoryService: PaperPointHistoryService;

  constructor() {
    this.orderService = new OrderService();
    this.productService = new ProductService();
    this.userService = new UserService();
    this.paperPointHistoryService = new PaperPointHistoryService();
  }

  async searchOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const params = req.query;
      const orders = await this.orderService.getOrdersPaginated(params)
      return res.status(200).json({
        message: 'Search order success',
        data: orders
      });
    } catch (err: any) {
      console.log("searchOrder error: ", err);
      return res.status(500).json({
        message: 'Search order failed ' + err.message
      });
    }
  }

  async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;

      const {productId, quantity} = req.body;
      if (!productId || !quantity) {
        return res.status(400).json({
          message: 'productId and quantity are required'
        })
      }
      const product = await this.productService.findProductById(productId);
      if (!product) {
        return res.status(400).json({
          message: 'Product not found'
        })
      }
      if (product.status != ProductStatus.ACTIVE) {
        return res.status(400).json({
          message: 'Product is not available'
        })
      }
      if (product.quantity < quantity) {
        return res.status(400).json({
          message: 'Product quantity is not enough'
        })
      }

      const userNewOrders = await this.orderService.getOrdersByUserIdAndStatus(userId, OrderStatus.CREATED);
      if (userNewOrders.length === 0) {
        //create new
        const newOrder = new Order();
        newOrder.userId = userId;
        newOrder.status = OrderStatus.CREATED;
        const savedOrder = await this.orderService.createOrder(newOrder);
        //create order detail
        const orderDetail = new OrderDetail();
        orderDetail.orderId = savedOrder.id;
        orderDetail.productId = productId;
        orderDetail.quantity = quantity;
        orderDetail.price = product.price;
        await this.orderService.createOrderDetail(orderDetail);
        return res.status(200).json({
          message: 'Create order success',
          data: savedOrder
        });
      }
      const userOrder = userNewOrders[0];
      let userOrderUpdated = userOrder;
      const existedOrderDetail = await this.orderService.getOrderDetailByOrderIdAndProductId(userOrder.id, productId);
      if (!existedOrderDetail) {
        //create new order detail
        const orderDetail = new OrderDetail();
        orderDetail.orderId = userOrder.id;
        orderDetail.productId = productId;
        orderDetail.quantity = quantity;
        orderDetail.price = product.price;
        await this.orderService.createOrderDetail(orderDetail);
      } else {
        //update existed order detail
        existedOrderDetail.quantity += quantity;
        existedOrderDetail.price = product.price;
        await this.orderService.updateOrderDetail(existedOrderDetail);
      }
      return res.status(200).json({
        message: 'Create order success',
        data: userOrderUpdated
      });
    } catch (err: any) {
      console.log("createOrder error: ", err);
      return res.status(500).json({
        message: 'Create order failed ' + err.message
      })
    }
  }

  async getUserOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const params = req.query;
      const resPaginated = await this.orderService.getOrdersByUserIdAndStatusPaginated(user.id, params)
      return res.status(200).json({
        message: 'Get user orders success',
        data: resPaginated
      })
    } catch (err: any) {
      console.log("getUserOrders error: ", err);
      return res.status(500).json({
        message: 'Get user orders failed ' + err.message
      })
    }
  }

  async updateOrderProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;
      const {productId, quantity} = req.body;
      if (!productId || quantity === undefined || quantity === null) {
        return res.status(400).json({
          message: 'productId and quantity are required'
        })
      }
      const order = await this.orderService.getOrderById(+orderId);
      if (!order) {
        return res.status(400).json({
          message: 'Order not found'
        })
      }
      if (order.status != OrderStatus.CREATED) {
        return res.status(400).json({
          message: 'Order is processing'
        })
      }
      if (order.userId != userId) {
        return res.status(400).json({
          message: 'You are not owner of this order'
        })
      }
      const product = await this.productService.findProductById(productId);
      if (!product) {
        return res.status(400).json({
          message: 'Product not found'
        })
      }
      if (product.status != ProductStatus.ACTIVE) {
        return res.status(400).json({
          message: 'Product is not available'
        })
      }
      if (product.quantity < quantity) {
        return res.status(400).json({
          message: 'Product quantity is not enough'
        })
      }
      const orderDetail = await this.orderService.getOrderDetailByOrderIdAndProductId(+orderId, productId);
      if (!orderDetail) {
        return res.status(400).json({
          message: 'This product is not in order'
        })
      }

      if (quantity === 0) {
        await this.orderService.deleteOrderDetail(orderDetail.id);
        return res.status(200).json({
          message: 'Delete order product success'
        });
      }

      orderDetail.quantity = quantity;
      orderDetail.price = product.price;
      await this.orderService.updateOrderDetail(orderDetail);
      return res.status(200).json({
        message: 'Update order product success',
        data: orderDetail
      });
    } catch (err: any) {
      console.log("updateOrderProduct error: ", err);
      return res.status(500).json({
        message: 'Update order product failed ' + err.message
      })
    }
  }

  async purchaseOrder(req: AuthenticatedRequest, res: Response) {
    let queryRunner = OrderController._queryRunner;
    if (!queryRunner) {
      console.log('create query runner');
      OrderController._queryRunner = AppDataSource.createQueryRunner();
      queryRunner = OrderController._queryRunner;
    }
    await queryRunner.startTransaction();
    try {
      const orderId = req.params.id;
      const userId = req.user.id;
      const order = await this.orderService.getOrderById(+orderId);
      if (!order) {
        return res.status(400).json({
          message: 'Order not found'
        })
      }
      if (order.status != OrderStatus.CREATED) {
        return res.status(400).json({
          message: 'Order is processing'
        })
      }
      if (order.userId != userId) {
        return res.status(400).json({
          message: 'You are not owner of this order'
        })
      }
      const orderDetails = await this.orderService.getOrderDetailsByOrderId(+orderId);
      if (orderDetails.length === 0) {
        return res.status(400).json({
          message: 'Order is empty'
        })
      }
      const products = await this.productService.findProductsByIds(orderDetails.map(od => od.productId));
      let totalAmount = 0;
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const orderDetail = orderDetails.find(od => od.productId === product.id);
        if (product.quantity < orderDetail.quantity) {
          return res.status(400).json({
            message: 'Product quantity is not enough'
          })
        }
        //update order detail price at the time of purchase
        orderDetail.price = product.price;
        await OrderController._queryRunner.manager.save(orderDetail);
        totalAmount += product.price * orderDetail.quantity;
      }
      const user = await this.userService.findUserById(userId);
      if (!user) {
        return res.status(400).json({
          message: 'User not found'
        })
      }
      if (user.paperPoint < totalAmount) {
        return res.status(400).json({
          message: 'Paper point is not enough'
        })
      }
      //purchase order
      user.paperPoint -= totalAmount;
      await OrderController._queryRunner.manager.save(user);
      //update order
      order.status = OrderStatus.SHIPPING;
      order.amount = totalAmount;
      order.updatedAt = new Date();
      await OrderController._queryRunner.manager.save(order);
      //update product quantity
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const orderDetail = orderDetails.find(od => od.productId === product.id);
        product.quantity -= orderDetail.quantity;
        await OrderController._queryRunner.manager.save(product);
      }
      //save transaction
      const paperPointTransaction = new PaperPointHistory();
      paperPointTransaction.user = user;
      paperPointTransaction.amount = totalAmount;
      paperPointTransaction.type = PaperPointHistoryType.PURCHASE;
      paperPointTransaction.referenceId = order.id;
      paperPointTransaction.isAdd = false;
      const tx = await OrderController._queryRunner.manager.save(paperPointTransaction);
      await queryRunner.commitTransaction();
      return res.status(200).json({
        message: 'Purchase order success',
        data: tx
      });

    } catch (err: any) {
      console.log("purchaseOrder error: ", err);
      await queryRunner.rollbackTransaction();
      return res.status(500).json({
        message: 'Purchase order failed ' + err.message
      })
    } finally {
      await queryRunner.release();
      OrderController._queryRunner = null;
      console.log('release query runner')
    }
  }

  async confirmOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;
      const order = await this.orderService.getOrderById(+orderId);
      if (!order || order.status != OrderStatus.SHIPPING) {
        return res.status(400).json({
          message: 'Order not found or not in shipping status'
        })
      }
      if (order.userId != userId) {
        return res.status(400).json({
          message: 'You are not owner of this order'
        })
      }
      order.status = OrderStatus.COMPLETED;
      order.updatedAt = new Date();
      const updated = await this.orderService.updateOrder(order);
      return res.status(200).json({
        message: 'Confirm order success',
        data: updated
      });
    } catch (err: any) {
      console.log("confirmOrder error: ", err);
      return res.status(500).json({
        message: 'Confirm order failed ' + err.message
      });
    }
  }

  async cancelOrder(req: AuthenticatedRequest, res: Response) {
    let queryRunner = OrderController._queryRunner;
    if (!queryRunner) {
      console.log('create query runner');
      OrderController._queryRunner = AppDataSource.createQueryRunner();
      queryRunner = OrderController._queryRunner;
    }
    await queryRunner.startTransaction();
    try {
      const orderId = req.params.id;
      const userId = req.user.id;
      const order = await this.orderService.getOrderById(+orderId);
      if (!order || order.status != OrderStatus.SHIPPING) {
        return res.status(400).json({
          message: 'Order not found or not in shipping status'
        })
      }
      if (order.userId != userId) {
        return res.status(400).json({
          message: 'You are not owner of this order'
        })
      }
      //refund paper point
      const user = await this.userService.findUserById(userId);
      if (!user) {
        return res.status(400).json({
          message: 'User not found'
        })
      }

      user.paperPoint += order.amount;
      await OrderController._queryRunner.manager.save(user);
      //update product quantity
      const orderDetails = await this.orderService.getOrderDetailsByOrderId(+orderId);
      const products = await this.productService.findProductsByIds(orderDetails.map(od => od.productId));
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const orderDetail = orderDetails.find(od => od.productId === product.id);
        product.quantity += orderDetail.quantity;
        await OrderController._queryRunner.manager.save(product);
      }
      //update order
      order.status = OrderStatus.CANCELLED;
      order.updatedAt = new Date();
      const updated = await OrderController._queryRunner.manager.save(order);
      //save transaction
      const paperPointTransaction = new PaperPointHistory();
      paperPointTransaction.user = user;
      paperPointTransaction.amount = order.amount;
      paperPointTransaction.type = PaperPointHistoryType.REFUND;
      paperPointTransaction.referenceId = order.id;
      paperPointTransaction.isAdd = true;
      const tx = await OrderController._queryRunner.manager.save(paperPointTransaction);
      await queryRunner.commitTransaction();
      return res.status(200).json({
        message: 'Cancel order success',
        data: tx
      });
    } catch (err: any) {
      console.log("cancelOrder error: ", err);
      await queryRunner.rollbackTransaction();
      return res.status(500).json({
        message: 'Cancel order failed ' + err.message
      })
    } finally {
      await queryRunner.release();
      OrderController._queryRunner = null;
      console.log('release query runner')
    }
  }

}

export default OrderController;

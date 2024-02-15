import ProductService from "../service/ProductService";
import {AuthenticatedRequest} from "../type";
import {Request, Response} from "express";
import {Product} from "../entity/Product";
import {CategoryService} from "../service/CategoryService";
// import MinioService from "../service/MinioService";
import S3Service from "../service/S3Service";

export default class ProductController {
  private readonly productService: ProductService;
  private readonly categoryService: CategoryService;
  private readonly s3Service: S3Service;

  constructor() {
    this.productService = new ProductService();
    this.categoryService = new CategoryService();
    this.s3Service = new S3Service();
  }

  async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const {name, price, description, images, quantity, categoryId} = req.body;
      if (!name || !price || !quantity || !categoryId || !images) {
        return res.status(400).json({
          message: 'Name, price, quantity, categoryId, images are required'
        })
      }
      const category = await this.categoryService.findCategoryById(categoryId);
      if (!category) {
        return res.status(400).json({
          message: 'Category not found'
        })
      }
      const product = new Product();
      product.name = name;
      product.price = price;
      product.description = description;
      product.images = images;
      product.quantity = quantity;
      product.category = category;
      const savedProduct = await this.productService.createProduct(product)
      return res.status(200).json({
        message: 'Create product success',
        data: savedProduct
      })
    } catch (err: any) {
      console.log("createProduct error: ", err);
      return res.status(500).json({
        message: 'Create product failed ' + err.message
      })
    }
  }

  async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id;
      const {name, price, description, images, quantity, categoryId} = req.body;
      const existedProduct = await this.productService.findProductById(+id);
      if (!existedProduct) return res.status(400).json({
        message: 'Product not found'
      })
      if (name) existedProduct.name = name;
      if (price) existedProduct.price = price;
      if (description) existedProduct.description = description;
      if (images) existedProduct.images = images;
      if (quantity) existedProduct.quantity = quantity;
      if (categoryId) {
        const category = await this.categoryService.findCategoryById(categoryId);
        if (!category) {
          return res.status(400).json({
            message: 'Category not found'
          })
        }
        existedProduct.category = category;
      }
      const updatedProduct = await this.productService.updateProduct(existedProduct);
      return res.status(200).json({
        message: 'Update product success',
        data: updatedProduct
      });
    } catch (err: any) {
      console.log("updateProduct error: ", err);
      return res.status(500).json({
        message: 'Update product failed ' + err.message
      })
    }
  }

  async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id;
      const existedProduct = await this.productService.findProductById(+id);
      if (!existedProduct) return res.status(400).json({
        message: 'Product not found'
      })
      await this.productService.deleteProduct(existedProduct)
      return res.status(200).json({
        message: 'Delete product success'
      })
    } catch (err: any) {
      console.log("deleteProduct error: ", err);
      return res.status(500).json({
        message: 'Delete product failed ' + err.message
      })
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const params = req.query;
      const products = await this.productService.findProductPagination(params)

      return res.status(200).json({
        message: 'Get all products success',
        data: products
      })

    } catch (err: any) {
      console.log("getAllProducts error: ", err);
      return res.status(500).json({
        message: 'Get all products failed ' + err.message
      })
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const product = await this.productService.findProductById(+id);
      if (!product) return res.status(400).json({
        message: 'Product not found'
      })
      return res.status(200).json({
        message: 'Get product by id success',
        data: product
      })

    } catch (err: any) {
      console.log("getProductById error: ", err);
      return res.status(500).json({
        message: 'Get product by id failed ' + err.message
      })
    }
  }

  async getMaxPrice(req: Request, res: Response) {
    try {
      const maxPrice = await this.productService.getMaxPrice();
      return res.status(200).json({
        message: 'Get max price success',
        data: maxPrice
      })
    } catch (err: any) {
      console.log("getMaxPrice error: ", err);
      return res.status(500).json({
        message: 'Get max price failed ' + err.message
      })
    }
  }

}

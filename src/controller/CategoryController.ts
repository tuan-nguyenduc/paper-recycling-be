import {CategoryService} from "../service/CategoryService";
import {AuthenticatedRequest} from "../type";
import {Request, Response} from "express";
import {Category} from "../entity/Category";
import {log} from "util";

class CategoryController {
  private readonly categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const {name, description, image} = req.body;
      if (!name) return res.status(400).json({
        message: 'Name is required'
      })
      const category = new Category();
      category.name = name;
      category.description = description;
      category.image = image;
      const savedCategory = await this.categoryService.createCategory(category)
      return res.status(200).json({
        message: 'Create category success',
        data: savedCategory
      })
    } catch (err: any) {
      console.log("createCategory error: ", err);
      return res.status(500).json({
        message: 'Create category failed ' + err.message
      })
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const params = req.query;
      const categories = await this.categoryService.findAllCategories(params);
      return res.status(200).json({
        message: 'Get all categories success',
        data: categories
      });
    } catch (err: any) {
      return res.status(500).json({
        message: 'Get all categories failed ' + err.message
      })
    }
  }

  async updateCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id;
      const {name, description, image} = req.body;
      const existedCategory = await this.categoryService.findCategoryById(+id);
      if (!existedCategory) return res.status(400).json({
        message: 'Category not found'
      })
      if (name) existedCategory.name = name;
      if (description) existedCategory.description = description;
      if (image) existedCategory.image = image;
      existedCategory.updatedAt = new Date();
      const updatedCategory = await this.categoryService.updateCategory(existedCategory);
      return res.status(200).json({
        message: 'Update category success',
        data: updatedCategory
      })


    } catch (err: any) {
      console.log("updateCategory error: ", err)
      return res.status(500).json({
        message: 'Update category failed ' + err.message
      })
    }
  }

  async deleteCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id;
      const existedCategory = await this.categoryService.findCategoryById(+id);
      if (!existedCategory) return res.status(400).json({
        message: 'Category not found'
      })
      await this.categoryService.deleteCategory(existedCategory);
      return res.status(200).json({
        message: 'Delete category success',
      })
    } catch (err: any) {
      console.log("deleteCategory error: ", err)
      return res.status(500).json({
        message: 'Delete category failed ' + err.message
      })
    }
  }
}

export default CategoryController;

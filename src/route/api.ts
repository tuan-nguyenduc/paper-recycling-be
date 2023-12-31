import * as express from "express"
import UserController from "../controller/UserController";
import AuthController from "../controller/AuthController";
import roleMiddleware from "../middleware/role";
import {AppRole} from "../enum";
import CategoryController from "../controller/CategoryController";
import ProductController from "../controller/ProductController";
import OrderController from "../controller/OrderController";
import SchoolController from "../controller/SchoolController";
import ClassController from "../controller/ClassController";
import UploadController from "../controller/UploadController";
import PaperCollectHistoryController from "../controller/PaperCollectHistoryController";
import ReviewController from "../controller/ReviewController";
import PostController from "../controller/PostController";
import ExchangeRewardController from "../controller/ExchangeRewardController";
import MaterialCollectHistoryController from "../controller/MaterialCollectHistoryController";


const router = express.Router()
//import controller
const userController = new UserController();
const authController = new AuthController();
const categoryController = new CategoryController();
const productController = new ProductController();
const orderController = new OrderController();
const schoolController = new SchoolController();
const classController = new ClassController();
const uploadController = new UploadController();
const reviewController = new ReviewController();
const postController = new PostController();
const exchangeRewardController = new ExchangeRewardController();
const paperCollectHistoryController = new PaperCollectHistoryController();
const materialCollectHistoryController = new MaterialCollectHistoryController();


router.post(`/auth/login`, authController.login.bind(authController));
router.post(`/auth/register`, authController.register.bind(authController));
router.get(`/users/me`, [roleMiddleware([AppRole.USER])], userController.me.bind(userController));
router.get(`/users`, [roleMiddleware([AppRole.ADMIN])], userController.getAllUsers.bind(userController));
router.put(`/users/me`, [roleMiddleware([AppRole.USER])], userController.updateProfile.bind(userController));
router.post("/users/register-students", [roleMiddleware([AppRole.CLASS_MONITOR])], userController.registerStudents.bind(userController));
router.get("/users/:id", [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], userController.getUserDetail.bind(userController));
router.put("/users/:id", [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], userController.updateUser.bind(userController));

router.get(`/categories`, categoryController.getAllCategories.bind(categoryController));
router.post(`/categories`, [roleMiddleware([AppRole.ADMIN])], categoryController.createCategory.bind(categoryController));
router.put(`/categories/:id`, [roleMiddleware([AppRole.ADMIN])], categoryController.updateCategory.bind(categoryController));
router.delete(`/categories/:id`, [roleMiddleware([AppRole.ADMIN])], categoryController.deleteCategory.bind(categoryController));

router.get(`/products/max-price`, productController.getMaxPrice.bind(productController));
router.get(`/products`, productController.getAllProducts.bind(productController));
router.get(`/products/:id`, productController.getProductById.bind(productController));
router.post(`/products`, [roleMiddleware([AppRole.ADMIN])], productController.createProduct.bind(productController));
router.put(`/products/:id`, [roleMiddleware([AppRole.ADMIN])], productController.updateProduct.bind(productController));
router.delete(`/products/:id`, [roleMiddleware([AppRole.ADMIN])], productController.deleteProduct.bind(productController));


router.post(`/orders`, [roleMiddleware([AppRole.USER])], orderController.createOrder.bind(orderController));
router.get(`/orders`, [roleMiddleware([AppRole.ADMIN])], orderController.searchOrder.bind(orderController));
router.get(`/orders/mine`, [roleMiddleware([AppRole.USER])], orderController.getUserOrders.bind(orderController));
router.put(`/orders/:id`, [roleMiddleware([AppRole.USER])], orderController.updateOrderProduct.bind(orderController));
router.post(`/orders/:id/purchase`, [roleMiddleware([AppRole.USER])], orderController.purchaseOrder.bind(orderController));
router.post(`/orders/:id/cancel`, [roleMiddleware([AppRole.USER])], orderController.cancelOrder.bind(orderController));
router.post(`/orders/:id/confirm`, [roleMiddleware([AppRole.USER])], orderController.confirmOrder.bind(orderController));

router.get(`/schools`, [roleMiddleware([AppRole.ADMIN])], schoolController.findAllSchool.bind(schoolController));
router.get(`/schools/:id`, [roleMiddleware([AppRole.ADMIN])], schoolController.findSchoolById.bind(schoolController));
router.post(`/schools`, [roleMiddleware([AppRole.ADMIN])], schoolController.createSchool.bind(schoolController));
router.put(`/schools/:id`, [roleMiddleware([AppRole.ADMIN])], schoolController.updateSchool.bind(schoolController));
router.delete(`/schools/:id`, [roleMiddleware([AppRole.ADMIN])], schoolController.deleteSchool.bind(schoolController));

router.get(`/classes`, [roleMiddleware([AppRole.ADMIN])], classController.getAllClass.bind(classController));
router.get(`/classes/:id`, [roleMiddleware([AppRole.ADMIN])], classController.getClassById.bind(classController));
router.post(`/classes`, [roleMiddleware([AppRole.ADMIN])], classController.createClass.bind(classController));
router.put(`/classes/:id`, [roleMiddleware([AppRole.ADMIN])], classController.updateClass.bind(classController));
router.delete(`/classes/:id`, [roleMiddleware([AppRole.ADMIN])], classController.deleteClass.bind(classController));
router.post('/classes/create-bulk', [roleMiddleware([AppRole.ADMIN])], classController.createClasses.bind(classController));
router.post('/classes/:id/distribute-paper-point', [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], classController.distributePaperPoint.bind(classController));

router.post(`/upload`, [roleMiddleware([AppRole.ADMIN])], uploadController.uploadFile.bind(uploadController));

router.get(`/paper-collect-histories`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], paperCollectHistoryController.findAllPaginated.bind(paperCollectHistoryController));
router.post(`/paper-collect-histories`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], paperCollectHistoryController.create.bind(paperCollectHistoryController));
router.put(`/paper-collect-histories/:id`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], paperCollectHistoryController.update.bind(paperCollectHistoryController));
router.post(`/paper-collect-histories/:id/confirm`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], paperCollectHistoryController.confirm.bind(paperCollectHistoryController));
router.post(`/paper-collect-histories/:id/cancel`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], paperCollectHistoryController.cancel.bind(paperCollectHistoryController));

router.post(`/reviews`, [roleMiddleware([AppRole.ADMIN])], reviewController.createReview.bind(reviewController));
router.get(`/reviews`, reviewController.getAllReviews.bind(reviewController));

router.get('/posts', postController.getAllPost.bind(postController));
router.post('/posts', [roleMiddleware([AppRole.ADMIN])], postController.createPost.bind(postController))
router.delete('/posts/:id', [roleMiddleware([AppRole.ADMIN])], postController.deletePost.bind(postController))
router.put(`/posts/:id`, [roleMiddleware([AppRole.ADMIN])], postController.updatePost.bind(postController));
router.post(`/posts/:id/confirm`, [roleMiddleware([AppRole.ADMIN])], postController.finish.bind(postController));
router.get(`/posts/:id`, postController.getPostById.bind(postController));

router.get('/exchange-rewards', exchangeRewardController.getAllExchangeRewards.bind(exchangeRewardController));
router.post('/exchange-rewards', [roleMiddleware([AppRole.ADMIN])], exchangeRewardController.createExchangeReward.bind(exchangeRewardController))
router.delete('/exchange-rewards/:id', [roleMiddleware([AppRole.ADMIN])], exchangeRewardController.deleteExchangeReward.bind(exchangeRewardController))
router.put(`/exchange-rewards/:id`, [roleMiddleware([AppRole.ADMIN])], exchangeRewardController.updateExchangeReward.bind(exchangeRewardController));
router.get(`/exchange-rewards/:id`, exchangeRewardController.getExchangeRewardById.bind(exchangeRewardController));

router.get('/material-collect-histories', materialCollectHistoryController.findAllPaginated.bind(materialCollectHistoryController));
router.post(`/material-collect-histories`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], materialCollectHistoryController.createMaterialCollectHistory.bind(materialCollectHistoryController));
router.post(`/material-collect-histories/:id/confirm`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], materialCollectHistoryController.confirmMaterialCollect.bind(materialCollectHistoryController));
router.post(`/material-collect-histories/:id/cancel`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], materialCollectHistoryController.cancelMaterialCollect.bind(materialCollectHistoryController));
router.put(`/material-collect-histories/:id`, [roleMiddleware([AppRole.CLASS_MONITOR, AppRole.TEACHER])], materialCollectHistoryController.updateMaterialCollect.bind(materialCollectHistoryController));

export default router;

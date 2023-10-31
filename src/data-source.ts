import "reflect-metadata"
import {DataSource} from "typeorm"
import {User} from "./entity/User"
import 'dotenv/config';
import {Category} from "./entity/Category";
import {Product} from "./entity/Product";
import {DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME} from "./constant";
import Order from "./entity/Order";
import OrderDetail from "./entity/OrderDetail";
import PaperPointHistory from "./entity/PaperPointHistory";
import SchoolClass from "./entity/SchoolClass";
import School from "./entity/School";
import SeedHistory from "./entity/SeedHistory";
import PaperCollectHistory from "./entity/PaperCollectHistory";
import {Review} from "./entity/Review";
import {Post} from "./entity/Post";
import {ExchangeReward} from "./entity/ExchangeReward";
import MaterialCollectHistory from "./entity/MaterialCollectHistory";
import MaterialCollectDetail from "./entity/MaterialCollectDetail";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: +DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  schema: "public",
  synchronize: true,
  logging: false,
  entities: [User, Category, Product, Order, OrderDetail, PaperPointHistory, SchoolClass, School, SeedHistory, PaperCollectHistory, Review, Post, ExchangeReward, MaterialCollectHistory, MaterialCollectDetail],
  migrations: [],
  subscribers: [],
})
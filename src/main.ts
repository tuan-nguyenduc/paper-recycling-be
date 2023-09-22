import {AppDataSource} from "./data-source";
import * as express from "express"
import * as cors from "cors"
import apiRoute from "./route/api";
import 'dotenv/config';
import "reflect-metadata"
import * as Minio from "minio";
import MinioService from "./service/MinioService";
//connect db
AppDataSource.initialize()
  .then(() => {
    console.log('Connected to database')
  })
  .catch((error) => {
    console.log('Connect db error: ' + error)
  });
//init express app
const app = express();
app.use(express.json());

//for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));

//open cors
app.use(cors())

// public resources
app.use("/uploads", express.static('uploads'));

//load api routes
app.use('/api/v1', apiRoute);

app.listen(process.env.PORT || 3000, function () {
  console.log("Example app listening on: " + "http://localhost:" + process.env.PORT || 3000);
});

const minioService = new MinioService();
// minioService.getPresignedUrl("test3.jpg").then((url) => {
//   console.log(url)
// }).catch(console.log)
//
// // minioService.getDownloadUrl("test3.jpg").then((url) => {
// //   console.log(url)
// // }).catch(console.log)


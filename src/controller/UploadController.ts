import {AuthenticatedRequest} from "../type";
import {Response} from "express";
import MinioService from "../service/MinioService";
import uploadFileMiddleware from "../middleware/upload";
import {validateImage} from "../util";
import * as fs from "fs";
import {S3Client} from "@aws-sdk/client-s3";
import S3Service from "../service/S3Service";

class UploadController {
  private readonly s3Client: S3Service

  constructor() {
    this.s3Client = new S3Service();
  }

  async uploadFile(req: AuthenticatedRequest, res: Response) {
    try {
      await uploadFileMiddleware(req, res);
      const file = req.file;
      validateImage(file);
      const url = await this.s3Client.putObject(file);
      console.log(url)
      //remove file in server
      fs.unlinkSync(file.path);
      return res.status(200).json({
        message: 'Upload file success',
        data: url
      });
    } catch (err: any) {
      console.log(err.message)
      return res.status(500).json({
        message: 'Upload file failed' + err.message
      })
    }
  }
}

export default UploadController;

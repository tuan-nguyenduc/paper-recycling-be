import {AuthenticatedRequest} from "../type";
import {Response} from "express";
import MinioService from "../service/MinioService";
import uploadFileMiddleware from "../middleware/upload";
import {validateImage} from "../util";
import * as fs from "fs";

class UploadController {
  private readonly minioService: MinioService

  constructor() {
    this.minioService = new MinioService();
  }

  async uploadFile(req: AuthenticatedRequest, res: Response) {
    try {
      await uploadFileMiddleware(req, res);
      const file = req.file;
      validateImage(file);
      const url = await this.minioService.putObject(file);
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

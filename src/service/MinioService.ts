import {Client} from "minio"
import {MINIO_ACCESS_KEY, MINIO_BUCKET_NAME, MINIO_CLIENT, MINIO_PORT, MINIO_PRIVATE_KEY} from "../constant";
import "dotenv/config"

class MinioService {
  private readonly minioClient: Client
  private readonly expiry = 60 * 60 * 24 * 7 // 7 days

  constructor() {
    this.minioClient = new Client({
      endPoint: MINIO_CLIENT,
      port: MINIO_PORT,
      useSSL: false,
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_PRIVATE_KEY
    });
  }

  async getPresignedUrl(objectName) {
    return new Promise((resolve, reject) => {
      this.minioClient.presignedPutObject(MINIO_BUCKET_NAME, objectName, this.expiry, function (e, presignedUrl) {
        if (e) {
          console.log(e)
          reject(e)
        }
        resolve(presignedUrl)
      })
    })
  }

  async getDownloadUrl(objectName) {
    return new Promise((resolve, reject) => {
      this.minioClient.presignedGetObject(MINIO_BUCKET_NAME, objectName, this.expiry, function (e, presignedUrl) {
        if (e) {
          reject(e)
        }
        resolve(presignedUrl)
      })
    })
  }

  async putObject(file: any) {
    return new Promise((resolve, reject) => {
      this.minioClient.fPutObject(MINIO_BUCKET_NAME, file.filename, file.path, {
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
      }, function (e) {
        if (e) {
          reject(e)
        }
        if (+MINIO_PORT === 80) {
          const objectUrl = `https://${MINIO_CLIENT}/${MINIO_BUCKET_NAME}/${file.filename}`
          resolve(objectUrl);
        }
        const objectUrl = `http://${MINIO_CLIENT}:${MINIO_PORT}/${MINIO_BUCKET_NAME}/${file.filename}`
        resolve(objectUrl);
      })
    })
  }

  async downloadFile(objectName: string, filePath: string) {
    return new Promise((resolve, reject) => {
      this.minioClient.fGetObject(
        MINIO_BUCKET_NAME,
        objectName,
        filePath,
        function (e) {
          if (e) {
            reject(e)
            return
          }
          resolve(true)
        },
      )
    })
  }
}

export default MinioService

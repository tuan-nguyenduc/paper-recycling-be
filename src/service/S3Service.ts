import "dotenv/config"
import {S3Client, ListBucketsCommand, GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {AWS_ACCESS_KEY, AWS_SECRET_KEY, MINIO_BUCKET_NAME, MINIO_CLIENT, S3_BUCKET_NAME, S3_REGION} from "../constant";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";
import {Readable} from "stream";


class S3Service {
    private readonly s3Client: S3Client
    private readonly expiry = 60 * 60 * 24 * 7 // 7 days

    constructor() {
        this.s3Client = new S3Client({
            region: S3_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY,
                secretAccessKey: AWS_SECRET_KEY
            }
        })
    }

    async getPresignedUrl(objectName) {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: objectName
        });
        return await getSignedUrl(this.s3Client, command, { expiresIn: 60 })


    }

    async getDownloadUrl(objectName) {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: objectName
        });
        return await getSignedUrl(this.s3Client, command, { expiresIn: 60 })
    }

    async putObject(file: any) {
        const readStream = fs.createReadStream(file.path)
        const readable = Readable.from(readStream)
        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Body: readable,
            Key: file.filename,
            ContentType: file.mimetype,
            ContentLength: file.size
        }
        try {
            await this.s3Client.send(new PutObjectCommand(uploadParams));
        } catch (e) {
            throw new Error(e.message)
        }
        return `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${file.filename}`
    }

    async downloadFile(objectName: string, filePath: string) {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: objectName,
        });

        try {
            const response = await this.s3Client.send(command);
            // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
            const str = await response.Body.transformToString();
            console.log(str);
        } catch (err) {
            console.error(err);
        }
    }
}

export default S3Service

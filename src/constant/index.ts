import "dotenv/config"

const isProduction = process.env.NODE_ENV === 'production'

console.log('isProduction: ' + isProduction)
export const DB_HOST = isProduction ? process.env.DB_HOST : process.env.LOCAL_DB_HOST

export const DB_PORT = isProduction ? process.env.DB_PORT : process.env.LOCAL_DB_PORT

export const DB_USERNAME = isProduction ? process.env.DB_USERNAME : process.env.LOCAL_DB_USERNAME

export const DB_PASSWORD = isProduction ? process.env.DB_PASSWORD : process.env.LOCAL_DB_PASSWORD

export const DB_NAME = isProduction ? process.env.DB_NAME : process.env.LOCAL_DB_NAME

export const MINIO_CLIENT = process.env.MINIO_CLIENT;

export const MINIO_PORT = +process.env.MINIO_PORT

export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY

export const MINIO_PRIVATE_KEY = process.env.MINIO_PRIVATE_KEY

export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME

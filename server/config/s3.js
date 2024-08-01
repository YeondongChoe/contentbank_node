import dotenv from 'dotenv';

dotenv.config();

export const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "ap-northeast-2",
};

export const bucketName = process.env.S3_BUCKET_NAME || "itex-dev-image";

// S3 설정 사용 가능 여부를 나타내는 플래그
export let isS3Configured = true;

// 설정값 검증
if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
    console.warn('AWS credentials are not properly set in the environment variables.');
    console.warn('S3 functionality will be disabled.');
    console.warn('To enable S3, make sure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in your .env file.');
    isS3Configured = false;
}

if (!bucketName) {
    console.warn('S3 bucket name is not set in the environment variables.');
    console.warn('S3 functionality will be disabled.');
    console.warn('To enable S3, make sure S3_BUCKET_NAME is set in your .env file.');
    isS3Configured = false;
}

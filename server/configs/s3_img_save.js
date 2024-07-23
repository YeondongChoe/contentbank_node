// s3 변수 설정 env 사용시 process.env.~ 사용하거나 직접 "~"안에 값을 넣어 사용
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  region: process.env.AWS_REGION || "",
};

const bucketName = process.env.S3_BUCKET_NAME || "";

module.exports = { s3Config, bucketName };

import fs from "fs";
import path from "path";
import FTPClient from "ftp";
import AWS from "aws-sdk";
import { ftpConfig, isFtpConfigured } from "../config/ftp.js";
import { s3Config, bucketName } from "../config/s3.js";

const saveImageLocally = (savePath, fileBuffer) => {
  fs.mkdirSync(path.dirname(savePath), { recursive: true });
  fs.writeFileSync(savePath, fileBuffer);
};

const saveImageToFTP = (savePath, fileBuffer) => {
  const client = new FTPClient();
  client.on("ready", () => {
    client.put(fileBuffer, savePath, (err) => {
      if (err) console.error("Error uploading file via FTP:", err);
      else console.log("File uploaded via FTP.");
      client.end();
    });
  });
  client.connect(ftpConfig);
};

const saveImageToS3 = (key, fileBuffer) => {
  const s3 = new AWS.S3(s3Config);
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ACL: "public-read",
  };
  s3.upload(params, (err, data) => {
    if (err) console.error("Error uploading file to S3:", err);
    else console.log("File uploaded to S3:", data.Location);
  });
};

const FTP_URL = ftpConfig.host;
const S3_URL = `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/`;

export { saveImageLocally, saveImageToFTP, saveImageToS3, FTP_URL, S3_URL };

const fs = require("fs");
const path = require("path");
const FTPClient = require("ftp");
const AWS = require("aws-sdk");
const { ftpConfig, isFtpConfigured } = require("../config/ftp_img_save.js");
const { s3Config, bucketName } = require("../config/s3_img_save.js");

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

module.exports = {
  saveImageLocally,
  saveImageToFTP,
  saveImageToS3,
  FTP_URL: ftpConfig.host,
  S3_URL: `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/`,
};

import fs from 'fs/promises';
import path from 'path';
import FTPClient from 'ftp';
import AWS from 'aws-sdk';

/**
 * Save image file locally
 * @param {string} savePath - Path to save the file
 * @param {Buffer} fileBuffer - File buffer to save
 */
export const saveImageLocally = async (savePath, fileBuffer) => {
    try {
        await fs.mkdir(path.dirname(savePath), {recursive: true});
        await fs.writeFile(savePath, fileBuffer);
        console.log('File saved locally:', savePath);
    } catch (error) {
        console.error('Error saving file locally:', error);
        throw error;
    }
};

/**
 * Save image file to FTP server
 * @param {Object} ftpConfig - FTP configuration
 * @param {string} savePath - Path to save the file on FTP server
 * @param {Buffer} fileBuffer - File buffer to save
 */
export const saveImageToFTP = (ftpConfig, savePath, fileBuffer) => {
    return new Promise((resolve, reject) => {
        const client = new FTPClient();

        client.on('ready', () => {
            client.put(fileBuffer, savePath, (err) => {
                if (err) {
                    console.error('FTP upload error:', err);
                    client.end();
                    reject(err);
                } else {
                    console.log('File uploaded to FTP:', savePath);
                    client.end();
                    resolve();
                }
            });
        });

        client.on('error', (err) => {
            console.error('FTP connection error:', err);
            reject(err);
        });

        client.connect(ftpConfig);
    });
};

/**
 * Save image file to AWS S3
 * @param {Object} s3Config - AWS S3 configuration
 * @param {string} bucketName - S3 bucket name
 * @param {string} key - S3 object key
 * @param {Buffer} fileBuffer - File buffer to save
 */
export const saveImageToS3 = (s3Config, bucketName, key, fileBuffer) => {
    return new Promise((resolve, reject) => {
        const s3 = new AWS.S3(s3Config);
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ACL: 'public-read',
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file to S3:', err);
                reject(err);
            } else {
                console.log('File uploaded to S3:', data.Location);
                resolve(data.Location);
            }
        });
    });
};



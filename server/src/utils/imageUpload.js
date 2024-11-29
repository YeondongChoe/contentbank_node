import fs from 'fs/promises';
import path from 'path';
import FTPClient from 'ftp';
import AWS from 'aws-sdk';
import {v4 as uuidv4} from "uuid";

/**
 * Save image file locally
 *
 * @param {string} savePath - Path to save the file
 * @param {Buffer} fileBuffer - File buffer to save
 * @returns {Promise<void>}
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
 *
 * @param {Object} ftpConfig - FTP configuration
 * @param {string} savePath - Path to save the file on FTP server
 * @param {Buffer} fileBuffer - File buffer to save
 * @returns {Promise<unknown>}
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
 * Create directory structure in S3
 *
 * @param {AWS.S3} s3 - S3 instance
 * @param {string} bucketName - S3 bucket name
 * @param {string} dirPath - Directory path to create
 * @returns {Promise<void>}
 */
export const createS3Directory = async (s3, bucketName, dirPath) => {
    const params = {
        Bucket: bucketName,
        Key: `${dirPath}/`, // Add trailing slash to indicate directory
        Body: '' // Empty content for directory marker
    };

    try {
        await s3.putObject(params).promise();
        console.log(`Directory created in S3: ${dirPath}`);
    } catch (error) {
        console.error('Error creating directory in S3:', error);
        throw error;
    }
};


/**
 * Save image file to AWS S3 with directory structure
 *
 * @param {Object} s3Config - AWS S3 configuration
 * @param {string} bucketName - S3 bucket name
 * @param {string} key - S3 object key
 * @param {Buffer} fileBuffer - File buffer to save
 * @returns {Promise<string>} - Returns the URL of the uploaded file
 */
export const saveImageToS3 = async (s3Config, bucketName, key, fileBuffer) => {
    const s3 = new AWS.S3(s3Config);

    try {
        // Create directory structure first
        const dirPath = key.split('/').slice(0, -1).join('/');
        if (dirPath) {
            await createS3Directory(s3, bucketName, dirPath);
        }

        // Upload the file
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ACL: 'public-read',
            ContentType: 'image/jpeg' // Adjust based on file type if needed
        };

        const data = await s3.upload(params).promise();
        console.log('File uploaded to S3:', data.Location);
        return data.Location;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
};

/**
 * 다중 파일을 S3에 업로드하는 함수
 * @param {Array} files - 업로드할 파일 배열
 * @param {Object} s3Config - S3 설정 객체
 * @param {string} bucketName - S3 버킷 이름
 * @returns {Promise<Array>} 업로드 결과 배열
 */
export const saveMultiToS3 = async (files, s3Config, bucketName) => {
    const s3 = new AWS.S3(s3Config);
    const [year, month, day] = new Date().toISOString().split('T')[0].split('-');

    const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'video/mp4': '.mp4',
        'video/webm': '.webm',
        'video/quicktime': '.mov',
        'audio/mpeg': '.mp3',
        'audio/wav': '.wav',
        'audio/ogg': '.ogg',
        'audio/mp4': '.m4a'
    };

    const uploadPromises = files.map(async (file) => {
        const imgUUID = uuidv4();
        const contentType = file.mimetype;

        // mimetype을 기반으로 확장자 결정
        const fileExtension = mimeToExt[contentType] || '.bin';

        const savePath = `report/${year}/${month}/${day}/${imgUUID}`;

        try {
            const dirPath = savePath.split('/').slice(0, -1).join('/');
            if (dirPath) {
                await createS3Directory(s3, bucketName, dirPath);
            }

            const cacheControl = contentType.startsWith('video/')
                ? 'max-age=31536000'
                : 'max-age=86400';

            const isViewableType =
                contentType.startsWith('image/') ||
                contentType.startsWith('video/') ||
                contentType.startsWith('audio/');

            const params = {
                Bucket: bucketName,
                Key: savePath,
                Body: file.buffer,
                ACL: 'public-read',
                ContentType: contentType,
                ContentDisposition: isViewableType
                    ? 'inline'
                    : `attachment; filename="${encodeURIComponent(file.originalname + fileExtension)}"`,
                CacheControl: cacheControl,
                Metadata: {
                    'Content-Type': contentType,
                    'original-filename': encodeURIComponent(file.originalname + fileExtension)
                }
            };

            const data = await s3.upload(params).promise();

            return {
                originalName: file.originalname + fileExtension,
                savedPath: savePath,
                url: data.Location,
                mimeType: contentType,
                success: true
            };
        } catch (error) {
            console.error(`Error uploading file ${file.originalname}:`, error);
            return {
                originalName: file.originalname,
                error: error.message,
                success: false
            };
        }
    });

    return Promise.all(uploadPromises);
};
import {saveImageLocally, saveImageToFTP, saveImageToS3} from "./imageUpload.js";
import path from "path";
import {ftpConfig, isFtpConfigured} from "../../config/ftp.js";
import {bucketName, isS3Configured, s3Config} from "../../config/s3.js";


const handleStorageType = async (imgSaveTypeInt, savePath, buffer) => {
    switch (imgSaveTypeInt) {
        case 1:
            await saveImageLocally(path.join(process.cwd(), 'images', savePath), buffer);
            return `/images/${savePath}`;
        case 2:
            if (isFtpConfigured) {
                await saveImageToFTP(ftpConfig, savePath, buffer);
                return `ftp://${ftpConfig.host}/${savePath}`;
            }
            await saveImageLocally(path.join(process.cwd(), 'images', savePath), buffer);
            return `/images/${savePath}`;
        case 3:
            if (isS3Configured) {
                const s3Path = savePath.split(path.sep).join('/');
                return await saveImageToS3(s3Config, bucketName, s3Path, buffer);
            }
            await saveImageLocally(path.join(process.cwd(), 'images', savePath), buffer);
            return `/images/${savePath}`;
        default:
            throw new Error('Invalid save type');
    }
};

const getActualStorageType = (imgSaveTypeInt) => {
    switch (imgSaveTypeInt) {
        case 1:
            return 'local';
        case 2:
            return isFtpConfigured ? 'ftp' : 'local (FTP fallback)';
        case 3:
            return isS3Configured ? 's3' : 'local (S3 fallback)';
        default:
            return 'unknown';
    }
};


export { handleStorageType, getActualStorageType };
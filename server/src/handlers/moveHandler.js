import AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';

const getActualStorageType = (type) => {
    switch (type) {
        case 1:
            return 'local';
        case 2:
            return 'ftp';
        case 3:
            return 's3';
        default:
            return 'local';
    }
};

export const handleLocalMove = async (img_data) => {
    throw new Error("Local storage move not implemented");
};

export const handleFtpMove = async (img_data) => {
    throw new Error("FTP move not implemented");
};

// S3 디렉토리 생성 함수 추가
const createS3Directory = async (s3, bucketName, dirPath) => {
    try {
        await s3.putObject({
            Bucket: bucketName,
            Key: `${dirPath}/`,
            Body: ""
        }).promise();
        console.log(`Directory created in S3: ${dirPath}`);
    } catch (error) {
        console.error("Error creating directory in S3:", error);
        throw error;
    }
};

// S3 객체 존재 여부 확인 함수
const checkS3ObjectExists = async (s3, bucketName, key) => {
    try {
        await s3.headObject({
            Bucket: bucketName,
            Key: key
        }).promise();
        return true;
    } catch (error) {
        if (error.code === 'NotFound' || error.code === 'NoSuchKey') {
            return false;
        }
        throw error;
    }
};

export const moveImageInS3 = async (s3Config, bucketName, sourceUrl) => {
    const s3 = new AWS.S3(s3Config);

    try {
        // URL에서 키 추출
        const urlPath = new URL(sourceUrl.trim()).pathname;
        const sourceKey = urlPath.substring(1);

        // 파일 존재 여부 확인
        const exists = await checkS3ObjectExists(s3, bucketName, sourceKey);
        if (!exists) {
            throw new Error(`File not found in S3: ${sourceUrl}`);
        }

        // 원본 경로에서 필요한 정보 추출
        const keyParts = sourceKey.split('/');
        const fileName = keyParts[keyParts.length - 1];
        const [year, month, day] = keyParts.slice(-4, -1);

        // 새로운 경로 생성
        const destinationKey = `upload/${year}/${month}/${day}/${fileName}`;

        // 디렉토리 구조 생성
        const dirPath = destinationKey.split("/").slice(0, -1).join("/");
        if (dirPath) {
            await createS3Directory(s3, bucketName, dirPath);
        }

        // 객체 복사
        await s3.copyObject({
            Bucket: bucketName,
            CopySource: encodeURIComponent(`${bucketName}/${sourceKey}`),
            Key: destinationKey,
            ACL: 'public-read',
            MetadataDirective: 'COPY'
        }).promise();

        // 원본 객체 삭제
        await s3.deleteObject({
            Bucket: bucketName,
            Key: sourceKey
        }).promise();

        return `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/${destinationKey}`;

    } catch (error) {
        console.error("Error moving file in S3:", error);
        throw error;
    }
};

export const handleS3MoveList = async (s3Config, bucketName, imgData) => {
    const results = [];

    await Promise.allSettled(
        imgData.map(async (imageUrl) => {
            try {
                const newUrl = await moveImageInS3(s3Config, bucketName, imageUrl);
                results.push({
                    imgUUID: uuidv4(),
                    imgURL: newUrl,
                    actualStorage: getActualStorageType(3)
                });
            } catch (error) {
                console.error(`Failed to process image ${imageUrl}:`, error);
            }
        })
    );

    if (results.length === 0) {
        throw new Error('No images were successfully processed');
    }

    return results;
};

export const handleS3Move = async (s3Config, bucketName, img_data) => {
    const movedUrls = [];
    let hasError = false;
    let firstError = null;

    try {
        for (const imageUrl of img_data) {
            try {
                const newUrl = await moveImageInS3(s3Config, bucketName, imageUrl);
                movedUrls.push(newUrl);
            } catch (error) {
                hasError = true;
                firstError = firstError || error;
                console.error(`Failed to move file ${imageUrl}:`, error);
            }
        }

        if (hasError) {
            // 에러가 있더라도 성공한 이동 결과는 반환
            return {
                imgUUID: uuidv4(),
                imgURL: movedUrls.join(','),
                message: "Some files failed to move",
                actualStorage: getActualStorageType(3),
                error: firstError?.message || "Unknown error occurred"
            };
        }

        return {
            imgUUID: uuidv4(),
            imgURL: movedUrls.join(','),
            message: "Images moved successfully",
            actualStorage: getActualStorageType(3)

        };

    } catch (error) {
        console.error("Error in handleS3Move:", error);
        throw error;
    }
};
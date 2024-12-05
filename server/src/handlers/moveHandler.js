import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const getActualStorageType = (type) => {
    switch(type) {
        case 1: return 'local';
        case 2: return 'ftp';
        case 3: return 's3';
        default: return 'local';
    }
};

export const handleLocalMove = async (img_data) => {
    throw new Error("Local storage move not implemented");
};

export const handleFtpMove = async (img_data) => {
    throw new Error("FTP move not implemented");
};

export const moveImageInS3 = async (s3Config, bucketName, sourceUrl) => {
    const s3 = new AWS.S3(s3Config);

    try {
        // URL에서 키 추출
        const urlPath = new URL(sourceUrl.trim()).pathname;
        const sourceKey = urlPath.substring(1);

        // 원본 경로에서 필요한 정보 추출
        const keyParts = sourceKey.split('/');
        const fileName = keyParts[keyParts.length - 1];
        const [year, month, day] = keyParts.slice(-4, -1);  // 날짜 정보 추출

        // 새로운 경로 생성
        const destinationKey = `move/${year}/${month}/${day}/${fileName}`;

        // 디렉토리 구조 생성
        const dirPath = destinationKey.split("/").slice(0, -1).join("/");
        if (dirPath) {
            await createS3Directory(s3, bucketName, dirPath);
        }

        // 객체 복사
        await s3.copyObject({
            Bucket: bucketName,
            CopySource: `${bucketName}/${sourceKey}`,
            Key: destinationKey,
            ACL: 'public-read'
        }).promise();

        // 원본 객체 삭제
        await s3.deleteObject({
            Bucket: bucketName,
            Key: sourceKey
        }).promise();

        // 새로운 URL 반환
        return `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/${destinationKey}`;

    } catch (error) {
        console.error("Error moving file in S3:", error);
        throw error;
    }
};

// S3 디렉토리 생성 함수
export const createS3Directory = async (s3, bucketName, dirPath) => {
    const params = {
        Bucket: bucketName,
        Key: `${dirPath}/`,
        Body: "",
    };

    try {
        await s3.putObject(params).promise();
        console.log(`Directory created in S3: ${dirPath}`);
    } catch (error) {
        console.error("Error creating directory in S3:", error);
        throw error;
    }
};

export const handleS3Move = async (s3Config, bucketName, img_data) => {

        const movedUrls = [];
        const moveResults = [];

        for (const imageUrl of img_data) {
            try {
                const { imgUUID, imgURL } = await moveImageInS3(s3Config, bucketName, imageUrl);
                movedUrls.push(imgURL);
                moveResults.push({
                    success: true,
                    imgURL
                });

            } catch (error) {
                console.error(`Error moving file ${imageUrl}:`, error);
                moveResults.push({
                    success: false,
                    error: error.message
                });
            }
        }

        // 모든 이동이 성공했는지 확인
        const allSuccessful = moveResults.every(result => result.success);

        if (!allSuccessful) {
            throw new Error('Some files failed to move');
        }

        return {
            imgUUID: uuidv4(), // 전체 작업에 대한 단일 UUID
            imgURL: movedUrls.join(','), // 모든 URL을 콤마로 구분하여 결합
            message: "Images moved successfully",
            actualStorage: "s3"
        };
    };
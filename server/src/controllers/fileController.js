import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { generatePDF } from "../utils/pdfGenerator.js";
import { saveMultiToS3 } from "../utils/imageUpload.js";
import {
  getActualStorageType,
  handleStorageType,
} from "../utils/storageUtils.js";
import { bucketName, s3Config } from "../../config/s3.js";
import {
  handleFtpMove,
  handleLocalMove,
  handleS3Move,
  handleS3MoveList,
} from "../handlers/moveHandler.js";

export const handleGetPdf = async (req, res) => {
  try {
    const { title, content, column, uploadDir, fileName } = req.body;
    const data = { title, content, column, uploadDir, fileName };

    await fs.mkdir(uploadDir, { recursive: true });
    const pdfBuffer = await generatePDF(data);
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, pdfBuffer);
    res.send("File saved successfully");
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).send("Error saving file");
  }
};

// 임시저장
export const handleImageUpload = async (req, res) => {
  try {
    let { img_save_type } = req.body;

    if (!img_save_type || !req.file) {
      img_save_type = 1;
    }

    const imgSaveTypeInt = parseInt(img_save_type, 10);
    const imgUUID = uuidv4();
    const [year, month, day] = new Date()
      .toISOString()
      .split("T")[0]
      .split("-");
    const fileExtension = path.extname(req.file.originalname);

    const savePath = path.posix.join(
      year,
      month,
      day,
      `${imgUUID}${fileExtension}`
    );
    let imgURL = await handleStorageType(
      imgSaveTypeInt,
      savePath,
      req.file.buffer
    );

    res.json({
      imgUUID,
      imgURL,
      message: "Image uploaded successfully",
      actualStorage: getActualStorageType(imgSaveTypeInt),
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({
      error: "Error processing upload",
      details: error.message,
    });
  }
};

export const handleTinyMceUpload = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("File is missing");
    }
    console.log("");
    const imgUUID = uuidv4();
    const file_name = imgUUID + path.extname(req.file.originalname);
    const year = new Date().getFullYear().toString();
    const month = `0${new Date().getMonth() + 1}`.slice(-2);
    const day = `0${new Date().getDate()}`.slice(-2);
    const saveDir = path.join(process.cwd(), "upload_img", year, month, day);

    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    const savePath = path.join(saveDir, file_name);
    fs.writeFileSync(savePath, req.file.buffer);

    res.json({ imgURL: `/upload_img/${year}/${month}/${day}/${file_name}` });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).send("Error processing upload");
  }
};

// 신고 파일 업로드
export const handleReportUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new Error("No files were uploaded");
    }

    const results = await saveMultiToS3(req.files, s3Config, bucketName);

    res.json({
      message: "Files processed",
      totalFiles: req.files.length,
      results,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({
      error: "Error processing upload",
      details: error.message,
    });
  }
};

// upload_img 로 올린 이미지를 최종 저장시 데이터를 옮기는 역활
export const handleImageUploadMove = async (req, res) => {
  try {
    const img_save_type = req.body.img_save_type;
    if (!img_save_type) {
      throw new Error("img_save_type is missing");
    }

    const img_data = req.body.img_data.split(",").map((url) => url.trim());
    let moveResult;

    switch (parseInt(img_save_type)) {
      case 1:
        moveResult = await handleLocalMove(img_data);
        break;
      case 2:
        moveResult = await handleFtpMove(img_data);
        break;
      case 3:
        moveResult = await handleS3MoveList(s3Config, bucketName, img_data);
        break;
      default:
        throw new Error(`Invalid img_save_type: ${img_save_type}`);
    }

    if (!moveResult) {
      throw new Error("Move operation failed");
    }

    res.json(moveResult);
  } catch (error) {
    console.error("Error processing move request:", error);
    res.status(500).json({
      error: "Error processing move request",
      details: error.message,
    });
  }
};

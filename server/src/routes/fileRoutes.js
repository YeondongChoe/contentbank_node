import express from 'express';
import { upload } from '../middlewares/multer.js';
import {
    handleGetPdf,
    handleImageUpload,
    handleTinyMceUpload,
    handleReportUpload,
    handleImageUploadMove
} from '../controllers/fileController.js';

const router = express.Router();

router.post('/get-pdf', handleGetPdf);
router.post('/upload_img', upload.single('file'), handleImageUpload);
router.post('/upload_img', upload.single('file'), handleTinyMceUpload);
router.post('/uploadImage', upload.single('file'), handleImageUploadMove);
router.post('/upload_report', upload.array('file', 10), handleReportUpload);

export default router;
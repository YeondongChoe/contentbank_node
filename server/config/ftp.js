import dotenv from "dotenv";

dotenv.config();

const ftpConfig = {
  host: process.env.FTP_HOST || null,
  user: process.env.FTP_USER || null,
  password: process.env.FTP_PASSWORD || null,
};

// FTP 설정 사용 가능 여부를 나타내는 플래그
let isFtpConfigured = true;

// 설정값 검증
if (!ftpConfig.host || !ftpConfig.user || !ftpConfig.password) {
  console.warn(
    "FTP configuration is not properly set in the environment variables."
  );
  console.warn("FTP functionality will be disabled.");
  console.warn(
    "To enable FTP, make sure FTP_HOST, FTP_USER, and FTP_PASSWORD are set in your .env file."
  );
  isFtpConfigured = false;
}

export { ftpConfig, isFtpConfigured };

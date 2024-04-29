const fs = require("fs");
const keys_dir = "config/secure/"; // 키 파일이 위치
const ca = fs.readFileSync(keys_dir + "csr.pem"); // CSR 파일을 CA 파일로 사용할 수도 있습니다.
const key = fs.readFileSync(keys_dir + "key.pem");
const cert = fs.readFileSync(keys_dir + "cert.pem"); // 생성된 CRT 파일을 사용합니다.

module.exports.options = {
  key,
  cert,
  ca,
};

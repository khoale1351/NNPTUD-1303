const crypto = require('crypto');
const fs = require('fs');

// Tạo cặp khóa RSA 2048 bit
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki', // Chuẩn Public Key
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8', // Chuẩn Private Key
        format: 'pem'
    }
});

// Lưu ra file
fs.writeFileSync('jwtRS256.key', privateKey);
fs.writeFileSync('jwtRS256.key.pub', publicKey);

console.log("Đã tạo xong cặp khóa RS256!");
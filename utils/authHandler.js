let jwt = require('jsonwebtoken');
let userController = require('../controllers/users');
const fs = require('fs');
const path = require('path');

module.exports = {
    checkLogin: async function (req, res, next) {
        let token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(403).send("Bạn chưa đăng nhập");
        }
        token = token.split(" ")[1];
        try {
            // Đọc public key
            let publicKey = fs.readFileSync(path.join(__dirname, '../jwtRS256.key.pub'), 'utf8');
            
            // Verify với RS256
            let result = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            
            let user = await userController.FindById(result.id);
            if (!user) {
                return res.status(403).send("Người dùng không tồn tại");
            } else {
                req.user = user;
                next();
            }
        } catch (error) {
            return res.status(403).send("Token không hợp lệ hoặc đã hết hạn");
        }
    }
}
const fs = require('fs');
const path = require('path');

var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let { RegisterValidator, handleResultValidator, changePasswordValidator } = require('../utils/validatorHandler')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let {checkLogin} = require('../utils/authHandler')
/* GET home page. */
router.post('/register', RegisterValidator, handleResultValidator, async function (req, res, next) {
    let newUser = userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        "69aa8360450df994c1ce6c4c"
    );
    await newUser.save()
    res.send({
        message: "dang ki thanh cong"
    })
});
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let getUser = await userController.FindByUsername(username);
    if (!getUser) {
        res.status(403).send("tai khoan khong ton tai")
    } else {
        if (getUser.lockTime && getUser.lockTime > Date.now()) {
            res.status(403).send("tai khoan dang bi ban");
            return;
        }
        if (bcrypt.compareSync(password, getUser.password)) {
            await userController.SuccessLogin(getUser);
            let privateKey = fs.readFileSync(path.join(__dirname, '../jwtRS256.key'), 'utf8');
            let token = jwt.sign(
                { id: getUser._id }, 
                privateKey, 
                { algorithm: 'RS256', expiresIn: '30d' }
            );
            res.send({ token: token });
        } else {
            await userController.FailLogin(getUser);
            res.status(403).send("thong tin dang nhap khong dung")
        }
    }

});

router.post('/change-password', checkLogin, changePasswordValidator, handleResultValidator, async function (req, res, next) {
    let { oldpassword, newpassword } = req.body;
    let user = req.user; // Lấy từ middleware checkLogin

    // Kiểm tra mật khẩu cũ
    if (!bcrypt.compareSync(oldpassword, user.password)) {
        return res.status(400).send("Mật khẩu cũ không chính xác");
    }

    // Gán mật khẩu mới. Hook pre('save') trong schemas/users.js sẽ tự động mã hóa nó.
    user.password = newpassword;
    await user.save();

    res.send({ message: "Đổi mật khẩu thành công" });
});

router.get('/me',checkLogin,function(req,res,next){
    res.send(req.user)
})

module.exports = router;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 文件上传的临时目录
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now()/*+ '-' + Math.round(Math.random() * 1E9)*/;
        const fileExtension = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExtension, '');
        cb(null, fileName + '-' + uniqueSuffix + fileExtension);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
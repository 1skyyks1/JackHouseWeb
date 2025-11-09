const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/tebi");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');

async function uploadToStorage(file) {
    try {
        const fileBuffer = fs.readFileSync(file.path);
        const upload_data = await s3Client.send(
            new PutObjectCommand({
                Bucket: "maps",
                Key: file.filename,
                Body: fileBuffer,
                ContentType: file.mimetype,
            })
        );
        console.log("upload_result:", upload_data);
        return upload_data;
    } catch (err) {
        console.error("uploadToStorage error:", err);
        throw err;
    }
}

async function preSign(key){
    const encodedKey = encodeURIComponent(key);
    const object = new GetObjectCommand({
        Bucket: "maps",
        Key: key,
        ResponseContentDisposition: `attachment; filename="${encodedKey}"`
    });
    return await getSignedUrl(s3Client, object, { expiresIn: 3600 })
}

module.exports = { uploadToStorage, preSign };
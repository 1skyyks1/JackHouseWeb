const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    endpoint: "https://s3.tebi.io",
    region: "global",
    credentials: {
        accessKeyId: process.env.TEBI_KEY,
        secretAccessKey: process.env.TEBI_SECRET
    }
});

module.exports = s3Client;

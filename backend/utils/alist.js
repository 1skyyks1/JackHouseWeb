const fetch = require('node-fetch');

const URL = process.env.ALIST_URL;
const USERNAME = process.env.ALIST_USERNAME;
const PASSWORD = process.env.ALIST_PASSWORD;

async function getToken(){
    const response = await fetch(`${URL}/auth/login`, {
        method: 'POST',
        body: new URLSearchParams({
            username: USERNAME,
            password: PASSWORD,
        }),
    });
    return response.data.token;
}

async function upload(token, file, fileContents){
    const response = await fetch(`${URL}/fs/put`, {
        method: 'PUT',
        headers: {
            'File-Path': encodeURIComponent('/postFile/' + file.name),
            'Content-Type': 'application/octet-stream',
            'Authorization': token
        }
    })
}
import express from 'express'
import http from 'http'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser'
import route from './routes/route.js';
import fileUpload from "express-fileupload";
import cors from "cors"

const app = express()

const __dirname = dirname(fileURLToPath(import.meta.url));

export { __dirname }

app.use(express.static(join(__dirname, '..', 'public')))

/* 
convert file
*/
app.use(fileUpload())

/* 
* convert data form (POST) to req.body
*/
app.use(express.urlencoded({
   extended: true
}))
app.use(express.json())
app.use(bodyParser.json())

//apply reatjs post
// app.use(cors({
//    origin: "https://webapp2-abcbd.web.app"
// }))
app.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
   res.setHeader('Access-Control-Allow-Credentials', true);
   next();});

// route(app)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
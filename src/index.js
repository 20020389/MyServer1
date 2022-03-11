import express from 'express'
import http from 'http'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser'
import route from './routes/route.js';
import fileUpload from "express-fileupload";
import cors from "cors"

const app = express()
const port = 3001

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
app.use(cors())
/* app.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
   res.setHeader('Access-Control-Allow-Credentials', true);
   next();}); */

route(app)

const server = http.createServer(app)

server.listen(port, () => {
   // fbListen.start()
   console.log(`listening ${port}...`);
})
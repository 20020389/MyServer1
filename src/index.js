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
app.use(cors({
   origin: "https://20020389.github.io",
   credentials: "true"
}))

route(app)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
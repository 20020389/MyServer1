import appController from "../controller/maincontroller/appController.js"
import mainRT from "./router/mainRT.js"
import messengerRT from "./router/messengerRT.js"
import searchRT from "./router/searchRT.js"
/**
 * @typedef {import("express").Express} Express 
 */


/**
 * @param {Express} app 
 */
const route = app => {
   app.use('/getdata/', mainRT)
   app.use('/messenger/', messengerRT)
   app.use('/search', searchRT)
   app.post('/user/setonline', appController.setOnline)
}

export default route
import mainController from "../../controller/maincontroller/firebase/firebaseController.js";
import express from 'express'

const mainRT = express()
mainRT.get('/user', mainController.loadUserData)
mainRT.get('/listzoom', mainController.loadZoomData)


export default mainRT
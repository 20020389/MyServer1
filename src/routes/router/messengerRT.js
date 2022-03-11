import express from 'express'
import MessengerController from '../../controller/maincontroller/firebase/MessengerController.js'

const messengerRT = express()
messengerRT.get('/listen', MessengerController.listenMessengerChange)
messengerRT.post('/send', MessengerController.sendMessage)
messengerRT.get('/get', MessengerController.getMessenger)
messengerRT.post('/getlistchat', MessengerController.convertListZoom)
messengerRT.post('/setseen', MessengerController.setSeenZoom)
messengerRT.post('/settyping', MessengerController.setTyping)
messengerRT.post('/getfakezoom', MessengerController.getFakeZoom)
messengerRT.post('/createzoom', MessengerController.createZoom)
messengerRT.post('/emoticonupdate', MessengerController.emoticonUpdate)

export default messengerRT
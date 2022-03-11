import { fStore } from "./firebase/firebaseConfig.js"

function getTime(lowerTime) {
   let d = new Date();
   if (lowerTime) {
      d = new Date(d.getTime() + lowerTime * 60000)
   }
   return `${d.getHours()}:${d.getMinutes()} ${d.getDate()}/${
      d.getMonth() + 1
   }/${d.getFullYear()}`;
}

function getTimeNow(lowerTime) {
   let d = new Date();
   if (lowerTime) {
      d = new Date(d.getTime() + lowerTime * 60000)
   }
   return d.getTime()
}


const listTask = {}

class AppController{

   async setOnline(req, res) {
      const uid = req.body.useruid
      const setOnline = req.body.online

      if (listTask[uid]) {
         clearTimeout(listTask[uid])
         listTask[uid] = undefined
      }
      const docRef = fStore.doc(`users/${uid}`)

      if (setOnline) {
         docRef.update({
            online: setOnline,
            lastOnline: "Active now"
         })
      }
      if (!res.finished) {
         res.json({
            status: 'online'
         })
      }
      
      
      const task = setTimeout(() => {
         docRef.update({
            online: false,
            lastOnline: getTimeNow(-1)
         })
      }, 60000);

      listTask[uid] = task
   }
}

export default new AppController
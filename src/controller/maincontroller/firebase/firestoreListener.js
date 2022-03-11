import { fStore } from "./firebaseConfig.js";

class FSListener{
   constructor() {
      this.listRes = []
      
   }

   check(id, data) {
      for (let i = 0; i < this.listRes.length; i++) {
         if (this.listRes[i].path === id) {
            this.listRes[i].task()
            try {
               this.listRes[i].res.json({
                  status: 'done',
                  data: data
               })
            } catch (error) {
               /* console.log(error); */
            }
         }
      }
   }

   start() {
      fStore.collection('messagezoom').onSnapshot(snapshot => {
         let data = snapshot.docChanges()
         for (let i = 0; i < data.length; i++) {
            this.check(data[i].doc.id, data[i].doc.data())
         }
      })
   }

   addResponse(res, path, task) {
      this.listRes.push({res, path, task})
   }
}

const fbListen = new FSListener
export default fbListen
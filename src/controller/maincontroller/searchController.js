import { fStore, fStorage } from "./firebase/firebaseConfig.js";


function removeAccents(str) {
   var AccentsMap = [
     "aàảãáạăằẳẵắặâầẩẫấậ",
     "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
     "dđ", "DĐ",
     "eèẻẽéẹêềểễếệ",
     "EÈẺẼÉẸÊỀỂỄẾỆ",
     "iìỉĩíị",
     "IÌỈĨÍỊ",
     "oòỏõóọôồổỗốộơờởỡớợ",
     "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
     "uùủũúụưừửữứự",
     "UÙỦŨÚỤƯỪỬỮỨỰ",
     "yỳỷỹýỵ",
     "YỲỶỸÝỴ"    
   ];
   for (var i=0; i<AccentsMap.length; i++) {
     var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
     var char = AccentsMap[i][0];
     str = str.replace(re, char);
   }
   return str.toLowerCase();
}

async function getFileURL(link, id) {
   const projectID = "webapp2-abcbd";
   let fileUrl = "";
   if (!id) {
      const res = await fStorage
      .bucket(`gs://webapp2-abcbd.appspot.com`)
      .file(link)
      .getMetadata();
      id = res[0].metadata.firebaseStorageDownloadTokens;
   }
   link = link.replaceAll("/", "%2F");
   fileUrl = `https://firebasestorage.googleapis.com/v0/b/${projectID}.appspot.com/o/${link}?alt=media&token=${id}`;
   return fileUrl;
}


class SearchController{

   async search(req, res) {
      const text = removeAccents(req.query.p)
      const list = []
      const userList = (await fStore.collection('users').get()).docs
      for (let i in userList) {
         const user = userList[i].data()
         const name = removeAccents(user.name)
         if (name.indexOf(text) !== -1) {
            user.avatar = await getFileURL(user.avatar)
            list.push({
               uid: userList[i].id,
               avatar: user.avatar,
               name: user.name
            })
         }
      }
      res.json({
         list: list
      })
   }

   async searchZoom(req, res) {
      const friendId = req.query.fi
      const currentUser = req.query.cui

      const docRef = fStore.doc(`users/${currentUser}/messengerlist/data`)
      const doc = (await docRef.get())
      if (!doc.exists) {
         res.json({
            exits: false
         })
         return
      }
      const listZoom = doc.get('listzoom')
      for (let i in listZoom) {
         if (listZoom[i].data.user === friendId) {
            res.json({
               exits: true,
               id: listZoom[i].id
            })
            return
         }
      }
      res.json({
         exits: false
      })
   }
}

export default new SearchController
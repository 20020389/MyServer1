import randomkey from "../../randomkey.js";
import { fStore, fStorage, fAuth } from "./firebaseConfig.js";

function NewUser(email) {
   const name = email.split("@")[0];
   if (name === undefined) {
      name = "user";
   }
   return {
      name: name,
      avatar: "users/default.jpg",
      birthday: "01/01/2002",
      online: true,
      lastOnline: "now"
   };
}

async function getFileURL(link) {
   const projectID = "webapp2-abcbd";
   let fileUrl = "";
   const res = await fStorage
      .bucket(`gs://webapp2-abcbd.appspot.com`)
      .file(link)
      .getMetadata();
   let id = res[0].metadata.firebaseStorageDownloadTokens;
   link = link.replaceAll("/", "%2F");
   fileUrl = `https://firebasestorage.googleapis.com/v0/b/${projectID}.appspot.com/o/${link}?alt=media&token=${id}`;
   return fileUrl;
}

class MainController {
   /**
    * lấy data user
    * @param {*request} req
    *  => get
    *  => query {
    *        uid (string)
    *     }
    * @param {*response} res
    *  => json
    *  => data {
    *        userdata (Object)
    *     }
    *  #nếu người dùng chưa có csdl => tạo csdl mới cho người dùng (NewUser)
    */
   async loadUserData(req, res) {
      /*       fbFirestore.collection('test').doc('check').onSnapshot(onNext => {
         console.log('change');
      }) */
      const uid = req.query.uid;
      console.log("uid", uid);
      try {
         const data = (await fStore.doc(`users/${uid}`).get()).data();
         data.avatar = await getFileURL(data.avatar);
         res.json({
            userdata: data,
         });
      } catch (error) {
         const userData = await fAuth.getUser(uid);
         const data = NewUser(userData.email);
         fStore.doc(`users/${uid}`).set(data);
         fStore.doc(`users/${uid}/messengerlist/data`).set({listzoom: []});
         data.avatar = await getFileURL(data.avatar);
         res.json({
            userdata: data,
         });
      }
   }


   /* bản thay thế ở trong MessengerController.getListZoom */
   async loadZoomData(req, res) {
      const id = req.query.id;
      const uid = req.query.uid;
      const listUser = (await fStore.doc(`messagezoom/${id}`).get()).get(
         "members"
      );
      const listData = [];
      for (let i in listUser) {
         if (listUser[i] === uid) {
            continue
         }
         const dataRef = (await fStore.doc(`users/${listUser[i]}`).get());
         const name = dataRef.get('name') 
         const avatar = await getFileURL(dataRef.get('avatar'));
         listData.push({name, avatar})
         break
      }
      res.json({
         listzoom: listData
      })
   }
}

export default new MainController();

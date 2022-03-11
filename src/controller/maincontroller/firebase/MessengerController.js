import randomkey from "../../randomkey.js";
import { fStore, fStorage } from "./firebaseConfig.js";
import userConfig from "../userConfig.js";
import fbListen from "./firestoreListener.js";
import { v4 as uuid } from "uuid";
import { join } from 'path'
import { __dirname } from "../../../index.js";

function getStickerUrl(link) {
   return (join(__dirname, '..', 'public') + link)
}

function convertTimeDate(timeData, online) {
   if (online) {
      return timeData
   }
   const time = new Date(timeData)

   const timeNow = new Date()
   
   let differentTime = Math.floor((timeNow.getTime() - time.getTime()) / (60000))

   if (differentTime < 60) {
      return `Active ${differentTime} minute${differentTime > 1 ? "s" : ""} ago`
   } else {
      differentTime = Math.floor(differentTime / 60)
      if (differentTime < 24) {
         return `Active ${differentTime} hour${differentTime > 1 ? "s" : ""} ago`
      } else {
         differentTime = Math.floor(differentTime / 24)
         if (differentTime < 30) {
            return `Active ${differentTime} day${differentTime > 1 ? "s" : ""} ago`
         } else {
            differentTime = Math.floor(differentTime / 30)
            if (differentTime < 12) {
               return `Active ${differentTime} month${differentTime > 1 ? "s" : ""} ago`
            } else {
               differentTime = Math.floor(differentTime / 12)
               return `Active ${differentTime} year${differentTime > 1 ? "s" : ""} ago`
            }
         }
      }
   }
}

function getTime() {
   let d = new Date();
   return `${d.getHours()}:${d.getMinutes()} ${d.getDate()}/${
      d.getMonth() + 1
   }/${d.getFullYear()}`;
}

function getTimeNow() {
   let d = new Date();
   return d.getTime()
}

function getNameFile(file) {
   const name = file.name.split(".");
   if (name.length === 0) {
      return "";
   }
   return `.${name[name.length - 1]}`;
}

class Message {
   constructor(text, user, type, link) {
      this.text = text;
      this.user = user;
      this.time = getTimeNow();
      this.seen = [user];
      (this.type = type ? type : "text"), (this.link = link ? link : undefined);
   }

   data() {
      if (this.type === "text") {
         return {
            text: this.text,
            user: this.user,
            time: this.time,
            seen: this.seen,
            type: this.type,
         };
      } /* if (this.type === 'image')  */ else {
         return {
            user: this.user,
            time: this.time,
            seen: this.seen,
            type: this.type,
            link: this.link,
         };
      }
   }
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


/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Request
 */
class MessengerController {

   /**
    *  lấy data zoom chat
    * @param {Request} req
    *  => get
    *  => query {
    *        id (string)
    *     }
    * @param {Response} res
    *  => json
    *  => data {
    *        data (Object)
    *     }
    *
    */
   getMessenger(req, res) {
      const id = req.query.zoomid;
      fStore
         .doc(`messagezoom/${id}`)
         .get()
         .then((snap) => {
            res.json({
               data: snap.data(),
            });
         });
   }

   /**
    *  gửi tin nhắn
    * @param {*request} req
    *  => post
    *  => body {
    *        user (uid: string)
    *        zoomid
    *        text
    *     }
    * @param {*response} res
    *  => json
    *  => data {
    *        userdata (Object)
    *     }
    *  # sau khi gửi xong up zoom chat vs người đó lên đầu tiên
    */

   async sendMessage(req, res) {
      const text = req.body.text;
      const user = req.body.user;
      const zoomId = req.body.zoomid;
      const type = req.body.type;
      let file = undefined;
      console.log("body", req.body);
      if (req.files && type === "image") {
         file = req.files.file;
      } else if (type === "sticker") {
         file = req.body.file
      }

      console.log('file', file);

      await fStore
         .runTransaction((transaction) => {
            const zoomRef = fStore.doc(`messagezoom/${zoomId}/typing/list`);
            return transaction.get(zoomRef).then((doc) => {
               if (doc.exists) {
                  let data = doc.get("data");
                  if (data === undefined) {
                     data = [];
                  }
                  const index = data.indexOf(user);
                  if (index !== -1) {
                     data.splice(index, 1);
                  }
                  transaction.update(zoomRef, {
                     data: data,
                  });
               } else {
                  let data = []
                  transaction.set(zoomRef, {
                     data: data,
                  });
               }
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.end();
            }
            return;
         });

      const listUser = [];
      const listRef = [];

      //update zoom
      await fStore
         .runTransaction(async (transaction) => {
            const zoomRef = fStore.doc(`messagezoom/${zoomId}`);
            return await transaction.get(zoomRef).then(async (doc) => {
               if (type === "text") {
                  const message = new Message(text, user);
                  const data = doc.get("members");
                  listUser.push(...data);
                  transaction.update(zoomRef, {
                     chat: [message.data(), ...doc.get("chat")],
                  });
               } else if (type === "image") {
                  let link = `chat/${zoomId}/${
                     randomkey(10) + getNameFile(file)
                  }`;
                  const data = doc.get("members");
                  const uuidToken = uuid();
                  console.log("uuid", uuidToken);
                  await fStorage
                     .bucket("gs://webapp2-abcbd.appspot.com/")
                     .file(link)
                     .save(file.data, {
                        metadata: {
                           metadata: {
                              firebaseStorageDownloadTokens: uuidToken,
                           },
                        },
                     });
                  link = await getFileURL(link, uuidToken);
                  const message = new Message(text, user, type, link);
                  console.log(message);
                  transaction.update(zoomRef, {
                     chat: [message.data(), ...doc.get("chat")],
                  });
                  listUser.push(...data);
               } else {
                  const data = doc.get("members");
                  const message = new Message(text, user, type, file.name);
                  console.log(message);
                  transaction.update(zoomRef, {
                     chat: [message.data(), ...doc.get("chat")],
                  });
                  listUser.push(...data);
               }
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.json({ status: "failed" });
            }
            return;
         });

      for (let i = 0; i < listUser.length; i++) {
         listRef.push(fStore.doc(`users/${listUser[i]}/messengerlist/data`));
      }

      //update user's zoom
      fStore
         .runTransaction((transaction) => {
            return transaction.getAll(...listRef).then((docs) => {
               for (let i = 0; i < listUser.length; i++) {
                  let data = docs[i].get("listzoom");
                  for (let j = 0; j < data.length; j++) {
                     if (data[j].id === zoomId) {
                        data.splice(j, 1);
                     }
                  }
                  const userid = i === 0 ? listUser[1] : listUser[0];
                  console.log(listUser[i], user);
                  let textLast = text;
                  if (type === 'image') {
                     textLast = "send an image" 
                  } else if (type === 'sticker') {
                     textLast = "send a sticker"
                  }
                  let listzoom = [
                     {
                        id: zoomId,
                        seen: listUser[i] === user,
                        data: { user: userid },
                        last: {
                           text: textLast,
                           user: user,
                        },
                     },
                     ...data,
                  ];
                  transaction.update(listRef[i], { listzoom: listzoom });
               }
               if (!res.finished) {
                  res.json({ status: "done" });
               }
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.json({ status: "failed" });
            }
            return;
         });
   }

   /**
    *
    * @param {*} req
    * đầu vào query: {
    *    uid: mã uid người dùng
    * }
    * @param {*} res
    * đầu ra json{
    *    data: [] list zoom chat
    * }
    */
   getListZoom(req, res) {
      const uid = req.query.uid;
      console.log(`users/${uid}/messengerlist/data`);
      fStore
         .doc(`users/${uid}/messengerlist/data`)
         .get()
         .then(async (snap) => {
            const data = snap.get("listzoom");
            console.log(data);
            if (data) {
               for (let i = 0; i < data.length; i++) {
                  const id = data[i].data.user;
                  const currentUser = await fStore.doc(`users/${id}`).get();
                  const avatar = await getFileURL(currentUser.get("avatar"));
                  data[i].data.name = currentUser.get("name");
                  data[i].data.avatar = avatar;
               }
               res.json({
                  data: data,
               });
            } else {
               res.json({
                  status: "error",
               });
            }
         });
   }

   async convertListZoom(req, res) {
      const data = req.body.data.listzoom;
      // console.log(data);
      if (data) {
         for (let i = 0; i < data.length; i++) {
            const id = data[i].data.user;
            const currentUser = await fStore.doc(`users/${id}`).get();
            const avatar = await getFileURL(currentUser.get("avatar"));
            let online = currentUser.get("online")
            let lastOnline = currentUser.get("lastOnline")
            data[i].data.name = currentUser.get("name");
            data[i].data.avatar = avatar;
            data[i].data.online = online;
            data[i].data.lastOnline = convertTimeDate(lastOnline, online);
         }
         // console.log(data);
         res.json({
            data: data,
         });
      } else {
         res.json({
            status: "error",
         });
      }
   }

   async setTyping(req, res) {
      const zoomid = req.body.id;
      const uid = req.body.user;
      const addTyping = req.body.typing;

      if (userConfig.listTaskSeen) {
         const task = userConfig.listTaskSeen[uid]
         if (task) {
            clearTimeout(task)
            userConfig.listTaskSeen[uid] = undefined
         }
      }

      await fStore
         .runTransaction((transaction) => {
            const zoomRef = fStore.doc(`messagezoom/${zoomid}/typing/list`);
            return transaction.get(zoomRef).then((doc) => {
               let data = doc.get("data");
               if (data === undefined) {
                  data = [];
               }
               const index = data.indexOf(uid);
               if (addTyping) {
                  if (index === -1) {
                     data.push(uid);
                  }
               } else {
                  if (index !== -1) {
                     data.splice(index, 1);
                  }
               }
               transaction.update(zoomRef, {
                  data: data,
               });
               if (!res.finished) {
                  res.end();
               }
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.end();
            }
            return;
         });

      const taskend = setTimeout(async () => {
         await fStore
         .runTransaction((transaction) => {
            const zoomRef = fStore.doc(`messagezoom/${zoomid}/typing/list`);
            return transaction.get(zoomRef).then((doc) => {
               let data = doc.get("data");
               if (data === undefined) {
                  data = [];
               }
               const index = data.indexOf(uid);
               if (index !== -1) {
                  data.splice(index, 1);
               }
               transaction.update(zoomRef, {
                  data: data,
               });
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.end();
            }
            return;
         });
      }, 10000);
      userConfig.listTaskSeen[uid] = taskend
   }

   async setSeenZoom(req, res) {
      const zoomid = req.body.id;
      const uid = req.body.user;
      const docRef = fStore.doc(`users/${uid}/messengerlist/data`);
      await fStore
         .runTransaction((transaction) => {
            const zoomRef = fStore.doc(`messagezoom/${zoomid}`);
            return transaction.get(zoomRef).then((doc) => {
               const data = doc.get("chat");
               if (data.length > 0) {
                  if (data[0].seen.indexOf(uid) === -1) {
                     data[0].seen.push(uid);
                  }
               }
               transaction.update(zoomRef, {
                  chat: [...data],
                  members: doc.get("members"),
               });
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.send({ status: "failed" });
            }
            return;
         });
      fStore
         .runTransaction((transaction) => {
            return transaction.get(docRef).then((r) => {
               const listzoom = r.get("listzoom");
               if (listzoom) {
                  for (let i in listzoom) {
                     if ((listzoom[i].id = zoomid)) {
                        listzoom[i].seen = true;
                        break;
                     }
                  }
                  console.log(listzoom);
                  transaction.update(docRef, { listzoom: listzoom });
                  if (!res.finished) {
                     res.json({ status: "done" });
                  }
               }
            });
         })
         .catch((error) => {
            console.log(error);
            if (!res.finished) {
               res.send({ status: "failed" });
            }
         });
   }

   /**
    *
    * @param {*} req
    * @param {*} res
    * trả về một zoom giả với id mà người dùng gửi
    */
   async getFakeZoom(req, res) {
      const zoomId = req.body.zoomid;
      const friendId = req.body.friendid;
      const currentUser = req.body.friendid;

      const friendData = await fStore.doc(`users/${friendId}`).get();
      const avatar = await getFileURL(friendData.get("avatar"));
      const data = {
         avatar: avatar,
         name: friendData.get("name"),
         user: friendId,
      };
      res.json({
         data: data,
         id: zoomId,
         seen: true,
      });
   }

   /**
    *
    * @param {*} req
    * @param {*} res
    * sau khi người dùng nhắn tin trong zoom giả
    * - server update zoom giả vào database user
    * - client => navigate đến zoom mới được server tạo
    */
   async createZoom(req, res) {
      const text = req.body.text;
      const user = req.body.user;
      const friendId = req.body.friendid;
      const zoomId = req.body.zoomid;
      const type = req.body.type;
      
      let file = undefined;
      if (req.files && type === "image") {
         file = req.files.file;
      } else if (type === "sticker") {
         file = req.body.file
      }

      await fStore
         .runTransaction((transaction) => {
            const zoomRef = fStore.doc(`messagezoom/${zoomId}/typing/list`);
            return transaction.get(zoomRef).then((doc) => {
               transaction.set(zoomRef, {
                  data: [],
               });
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.end();
            }
            return;
         });

      const listUser = [];
      const listRef = [];

      //update zoom
      await fStore
         .runTransaction(async (transaction) => {
            const zoomRef = fStore.doc(`messagezoom/${zoomId}`);
            return await transaction.get(zoomRef).then(async (doc) => {
               if (type === "text") {
                  const message = new Message(text, user);
                  const data = [user, friendId];
                  listUser.push(...data);
                  transaction.set(zoomRef, {
                     chat: [message.data()],
                     members: data
                  });
               } else if (type === "image") {
                  let link = `chat/${zoomId}/${
                     randomkey(10) + getNameFile(file)
                  }`;
                  const data = [user, friendId];
                  const uuidToken = uuid();
                  console.log("uuid", uuidToken);
                  await fStorage
                     .bucket("gs://webapp2-abcbd.appspot.com/")
                     .file(link)
                     .save(file.data, {
                        metadata: {
                           metadata: {
                              firebaseStorageDownloadTokens: uuidToken,
                           },
                        },
                     });
                  link = await getFileURL(link, uuidToken);
                  const message = new Message(text, user, type, link);
                  console.log(message);
                  transaction.set(zoomRef, {
                     chat: [message.data()],
                     members: data
                  });
                  listUser.push(...data);
               } else {
                  const data = [user, friendId];
                  const message = new Message(text, user, type, file.name);
                  console.log(message);
                  transaction.set(zoomRef, {
                     chat: [message.data()],
                     members: data
                  });
                  listUser.push(...data);
               }
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.json({ status: "failed" });
            }
            return;
         });

      for (let i = 0; i < listUser.length; i++) {
         listRef.push(fStore.doc(`users/${listUser[i]}/messengerlist/data`));
      }

      //update user's zoom
      fStore
         .runTransaction((transaction) => {
            return transaction.getAll(...listRef).then((docs) => {
               for (let i = 0; i < listUser.length; i++) {
                  let data = docs[i].get("listzoom");
                  for (let j = 0; j < data.length; j++) {
                     if (data[j].id === zoomId) {
                        data.splice(j, 1);
                     }
                  }
                  const userid = i === 0 ? listUser[1] : listUser[0];
                  console.log(listUser[i], user);
                  let textLast = text;
                  if (type === 'image') {
                     textLast = "send an image" 
                  } else if (type === 'sticker') {
                     textLast = "send a sticker"
                  }
                  let listzoom = [
                     {
                        id: zoomId,
                        seen: listUser[i] === user,
                        data: { user: userid },
                        last: {
                           text: textLast,
                           user: user,
                        },
                     },
                     ...data,
                  ];
                  transaction.update(listRef[i], { listzoom: listzoom });
               }
               if (!res.finished) {
                  res.json({ status: "done" });
               }
            });
         })
         .catch((err) => {
            console.log(err);
            if (!res.finished) {
               res.json({ status: "failed" });
            }
            return;
         });
   }

   async emoticonUpdate(req, res) {
      const zoomId = req.body.zoomid
      const data = req.body.data
      const docRef = fStore.doc(`messagezoom/${zoomId}`)
      await fStore.runTransaction((transaction) => {
         return transaction.get(docRef).then(doc => {
            transaction.update(docRef, {
               chat: data
            })
         })
      })
      res.json({
         status: "done"
      })
   }

   /**
    * listen message
    * @param {*} req
    * @param {*} res
    * when page change send a res to client
    */
   listenMessengerChange(req, res) {
      const id = req.query.id;
      const limit = req.query.timeout;
      if (limit === undefined) {
         limit = 20000;
      }
      const timeout = setTimeout(() => {
         res.send({
            status: "time out!!!",
         });
      }, limit);
      fbListen.addResponse(res, id, () => {
         clearTimeout(timeout);
      });
   }
}

export default new MessengerController();

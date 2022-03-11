import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const key = {
   type: "service_account",
   project_id: "webapp2-abcbd",
   private_key_id: "9f5358827a617a5031852cdcbed6bd0339452b1d",
   private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCzpHFenk/8/L1I\n9eERPZQMhVgxpbyyEuusoIaU98RNTXWj5tApIc635c+rUCD5h/6Tlad9Cob/+m2f\nf1cSpM5QIHBArAC5L7zpRlZoHntgFuswLFsT0l4IeEDbyJwUtC4iAfcWACOuAMtT\nAVs2z2giAR1qlcHDDyugBXr9bzhNStCci+VmTH597siw42PI3VuePZoQuXyFlrou\nURqq1bKZseMGMgJVUMKQCSlMJ/2qQ7eMcGNqAGuPGizNYpm/XEE5vjDYBoV+duF3\nsNKZeI1bvbXV+0qWdrhL4cImRMEacsearN3ln1sBf7Yne9VfPuQfo74Gd3e+6u3/\nvV5mTP6PAgMBAAECggEAM28Ftp2FMV37pAQiKJmE5gDXu39Eg4e/SnG7lrNJ1Qg0\ngnT3bI9tbGG0D8ylZEx3qzHR/o8hD/FXqa7/8yqUl4RyH1If8uWkJPYqjy0LDfwB\n4o0QlqBIpAwqJcNOTO85tirx366yiINZs65Tu2Gu4u2GypmOHJcfWnW3PRC3AgnK\nzrfagAvSvIji/cQpHfquenjrPNdgPjbu2BJyTPscWGvfqxcpn+ho7dG3AO5Oe1JW\n/BMAF+zgUi8hSsgQASlkU9Pp4nBPrMsvi+GT8WeR4LazXnnM64h1qzVm2wyOb8Gr\neBrdrHFKrpK86eDAXIpq08gA82dbGPBvI89cSNptIQKBgQDcvkwqKCQYxRufDtkn\ncbHSr5hcY0uifTSCOQVOo5ZqcNQYmIEKx7UjmkKJYggZNVB+dpkA8nO+nrDDKtxx\n0ljbpQyZBR6mzsHJKDNsD3OZIY/l4N1lj/PLrZmcIlWc7M+MeS3VLFwl8rMUGNE3\nAGouYpD1urr7PVIJ+HrUDkcXOwKBgQDQVZ4SH6yyqhhr9QB7gaFZ0gDKV3EOgodC\nSTYLcxA44rzT4jg+INElLZ9EQEbdgP/aNInjp6tXi7ubKSLZtOTC4iEBxY9g/ZkY\nNs7FSoDl7OVyrUiGKPuDaCiTzyukXXEW3tTMREXkrJqY03yxShwncBZfzCQx2M+E\nTgGm/dUIvQKBgQCMOPorAWrErVk5dfYt30RFgLP5ZD4kjwJvAofDh5lCLkAdC6tV\nTL1dS12e5b4dPUfPvci92EX8PdQtdimoyCUYCcVx4tWwwsBI5xebOkmFadN+BJS/\nMm184d8lVo4p7Ch/pG6f7tjuZjipuIYWOVY59vT8k8y5Uh+uI8DqudMhBwKBgBe5\nWDnKH5ls40EP8lEeLuiSkIJ6OKalWI/E1IGzRaqkr0oVnb/9brOkIVndU/SPZxNL\nHlStWEas491EbvKJte83XvjbrXsnBdMLErrGxCzqsCpB71tPuWx6ZPyH//lEpscq\n8uKb97WVrjkvBCkQPmqDShj4nzqJ7P+s/mUszKClAoGBAK1yuatYffitZTMTrTFu\nLpYrSIz0WctHzg1/ADKjFpdej3l1GEW2hu4jQknoy9ibT8Ae3jQGL1S02K7RL6Ua\nuqVQlTclkxVxEFoeuWSz7+vR3dfstaNQ6O+YvXDJoQ88FD49u1zptneMT8Xwxiyc\nUIS0jpRqUlOzCe/crXlSTB5s\n-----END PRIVATE KEY-----\n",
   client_email: "firebase-adminsdk-bkktl@webapp2-abcbd.iam.gserviceaccount.com",
   client_id: "116014250243033568314",
   auth_uri: "https://accounts.google.com/o/oauth2/auth",
   token_uri: "https://oauth2.googleapis.com/token",
   auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
   client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-bkktl%40webapp2-abcbd.iam.gserviceaccount.com"
 }
 

const app = admin.initializeApp({
   credential: admin.credential.cert(key)
})

const fStore = getFirestore(app)
const fStorage = getStorage(app)
const fAuth = getAuth(app)
const FirebaseFirestore = admin.firestore

export { fStore, fStorage, fAuth, FirebaseFirestore }


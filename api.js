var express = require('express');
var app = express();
var cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
require('moment-timezone');
app.use(bodyParser.json());
app.use(cors());

app.listen(5555, function () {
  console.log("Server is running ...");
});

//Firebase
const { db } = require('./config/admin');
const { admin } = require('./config/admin');
app.get("/counters", async (req, res) => {
  const cRef = db.collection('Counters');
  try {
    cRef.get().then((snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("get thanh cong");
      console.log(items);
      res.status(200).json(items);
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
app.get("/messages", async (req, res) => {
  const cRef = db.collection('Messages');
  try {
    cRef.get().then((snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("get thanh cong");
      console.log(items);
      res.status(200).json(items);
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
function pushNoti(registrationToken)
{
  const message = {
    // data: {
    //   // Add your custom data here
    //   key1: 'value1',
    //   key2: 'value2',
    // },
    notification: {
      title: 'Bạn có tin nhắn mới',
      body: 'New messages arrived',
    },
    token: registrationToken,
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.error('Error sending message:', error);
    });
};
//add more messages with default field 
app.post('/addmessages', async (req, res) => {

  const { UserIdTo, UserIdFrom, content, status } = req.body;
  try {
    const counterRef = db.collection('Counters').doc('messagesCounter');
    const counterDoc = await counterRef.get();
    const currentCount = counterDoc.exists ? counterDoc.data().count : 0;
    const currentTime = admin.firestore.Timestamp.now().toDate();
    console.log(currentTime);
    const formattedTime = moment(currentTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss.SSSSSSS');
    console.log(formattedTime);
    const c = db.collection('Messages').doc();
    const item = {
      UserIdTo: UserIdTo,
      UserIdFrom: UserIdFrom,
      content: content,
      status: status,
      timeSent: formattedTime,
      messagesId: currentCount + 1
    };
    console.log('add done', item);
    await counterRef.set({ count: currentCount + 1 });
    c.set(item);
    

    const query = db.collection("Device")
    .where('userId', '==', UserIdTo);
  query.get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      // Access the deviceToken field in each document
      const deviceToken = doc.data().deviceToken;
      console.log(deviceToken);
      pushNoti(deviceToken);
    res.status(200).send({
      status: 'success',
      message: 'item added successfully,'+deviceToken,
      data: item,
    });
    });
  })
  .catch(error => {
    console.error('Error getting documents: ', error);
  });
    
    
  } catch (error) {
    res.status(500).json(error.message);
  }
});



app.post("/add_device_token", async (req, res) => {
  try {
    const { deviceToken, userId } = req.body;

    // Check if document with userId exists
    const existingDoc = await db.collection('Device').where('userId', '==', userId).get();

    if (existingDoc.empty) {
      // If no document found, create a new one
      const cRef = db.collection('Device').doc();
      const item = {
        deviceToken: deviceToken,
        userId: userId
      };
      await cRef.set(item);
      res.status(200).send({
        status: 'success',
        message: 'device token added successfully',
        data: item,
      });
    } else {
      // If document found, update the existing one
      const docId = existingDoc.docs[0].id;
      const updateItem = {
        deviceToken: deviceToken,
      };
      await db.collection('Device').doc(docId).update(updateItem);

      res.status(200).send({
        status: 'success',
        message: 'device token updated successfully',
        data: updateItem,
      });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});




// app.post("/pushNoti", async (req, res) => {
//   const peerUserId = req.body;



//   const registrationToken = req.body;
//   // const registrationToken = 
//   // 'dZGpuzXETGi_7CfNt3Awiv:APA91bE77HBtPpue-wE9vn8zTLj8vbNZLxWRUg2KIvJW8DbBsPL7S3L8Aw-QMHNMexoUOzUBheot9lgNkuWju_aw5BfcvdzNMi9rGJ56uhkbOVzGMizTGxYonH1utr7VhXW0_3TdJmNe';
//   //const registrationToken = 'e5HTyY3fRySu2zX19NDaxH:APA91bGdLWrMCKlz_AI55UnqBj2BTxjl8ecDS8f_7_04w2nmRI4E_bpYSy_4-9asc617jefPC5P8FNz7I6gCTXFVWq6ViI99eCuF_MgDDFX_URmCcyrEYWLpE_ZGH5g3IwNhE3nG7pEJ';

  
// });

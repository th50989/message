var express = require('express');
var app = express();
var cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
require('moment-timezone');
app.use(bodyParser.json());
app.use(cors());
app.listen(5555, function(){
  console.log("Server is running ...");
});

//Firebase
const { db } = require('./config/admin');
const {admin}=require('./config/admin');

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

//add more messages with default field 
app.post('/addmessages', async (req, res) => {
    
    const { UserIdTo, UserIdFrom,content,status} = req.body;
    try {
        const counterRef = db.collection('Counters').doc('messagesCounter');
        const counterDoc = await counterRef.get();
        const currentCount = counterDoc.exists ? counterDoc.data().count : 0;
        
        const currentTime = admin.firestore.Timestamp.now().toDate();
        const formattedTime = moment(currentTime).tz('UTC+7').format('YYYY-MM-DD HH:mm:ss.SSSSSSS');
        const c = db.collection('Messages').doc();
        const item = {
            UserIdTo: UserIdTo,
            UserIdFrom: UserIdFrom,
            content:content,
            status:status,
            timeSent:formattedTime,
            messagesId:currentCount+1
      };
      console.log('add done', item);
      await counterRef.set({ count: currentCount + 1 });
      c.set(item);
      res.status(200).send({
        status: 'success',
        message: 'item added successfully',
        data: item,
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  });
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

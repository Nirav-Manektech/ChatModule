const StreamChat = require('stream-chat').StreamChat;
const ACCOUNT_ID = ''
const ACCCOUNT_SECRET = ''
const client = StreamChat.getInstance(ACCOUNT_ID,ACCOUNT_SECRET);
const firebase = require("firebase-admin");
const serviceAccount = require("./firebase-demo.json")

firebase.initializeApp({credential:firebase.credential.cert(serviceAccount)})



const express = require('express');
const { title } = require('process');

const app = express()

app.use(express.json())
app.post('/', async function (req, res) {
    // await client.connectUser({
    //     id: "withered-thunder-0",
    //     name: "withered",
    //     image: "https://bit.ly/2u9Vc0r",
    // }, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoid2l0aGVyZWQtdGh1bmRlci0wIiwiZXhwIjoxNzE4MTk2NTM3fQ.ZduHjhlaY3imAnE6DqMr9x0qZ9uz0AitW5NudugZ0n8"); // token generated server side
    console.log("req", req.body);
    console.log("sender", req.body.user)
    const receiver = req?.body?.channel?.members?.filter((member) => member.user_id !== req.body.user.id)
    console.log("receiver",receiver)
    if (receiver?.[0]?.user?.book) {
        let msg = {
            token: receiver?.[0]?.user?.book,
            notification: {
                title: req.body.user.id,
                body: req.body.message.text
            }
        }
        const response = await firebase.messaging().send(msg)
        console.log("Successfully sent message:", response);
    }
    res.send('Hello World')
})

app.post("/insertUser", async function (req, res) { 
    const updateResponse = await client.upsertUser({
        id: req.body.userId,
        role: 'admin',
        book: req.body.book,
        deviceId: req.body.token
    })
    console.log("updateResponse", updateResponse)
    return res.status(200).json({ success: true, updateResponse })
})
app.post("/generateToken",async function (req, res) { 
    // const updateResponse = await client.upsertUser({
    //     id: req.body.userId,
    //     role: 'admin',
    //     book: 'dune'
    // })
    // console.log("updateResponse", updateResponse)
    token = client.createToken(req.body.userName)
    return res.status(200).json({success:true,token:token})
})

app.post("/sendMessage", async function (req, res) { 

    const channel = client.channel('messaging', req.body.id, {
        name: "Private Chat About the Kingdom",
        image: "https://bit.ly/2F3KEoM",
        members: ["withered-thunder-0"],
        session: 8 // custom field, you can add as many as you want
    });
    await channel.watch();

    const message = await channel.sendMessage({
        text: req.body.message,
    });

    //To add reaction on message

    /** const messageId = "110d39b1-5d0d-4c2c-af11-7e8281e57e56";

    const reaction = await channel.sendReaction(messageId, {
        type: "love"
    });**/

    //Add reply on thread
    /**const parent = await channel.sendMessage({
     text: 'Episode 1 just blew my mind!',
    });

    const reply = await channel.sendMessage({
    text: "Stop it, no spoilers please!",
    parent_id: parent.message.id,
    customField: 123, // custom field, you can add as many as you want
    }); */
    //getting response send to user
    channel.on("message.new", event => {
        console.log("event.new", event)
    });
    return res.status(200).json(message);

    // console.log("channel", channel)
    // console.log("message", message)
})


app.post("/channelCreate", async function (req, res) {
    client.channel('messaging', "", {
        name: "Private Chat About the Kingdom",
        image: "https://bit.ly/2F3KEoM",
        members: req.body.memberList,
        session: 8 
    })
    await channel.watch();

})


// await channel.sendMessage({
//     text: "What is the medieval equivalent of tabs vs spaces?",
// });

app.get("/sendNotification", async (req, res) => {
    console.log('req.params.token',req.query.token)
    let msg = {
        token: req.query.token,
        notification: {
            title: "Test Notification",
            body: "This is a test notification",
        }
    }
    const response = await firebase.messaging().send(msg)
    console.log("Successfully sent message:", response);
    return res.status(200).json({ success: true, response })
})

app.listen(5000, () => {
    console.log("listen on port",5000)
})
   




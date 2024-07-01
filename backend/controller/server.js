const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const url = 'mongodb://localhost:27017';
const dbName = 'VideoKeyframeDB';

let db, gfsBucket;

// Verbindung zur MongoDB herstellen und GridFS initialisieren
mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
    gfsBucket = new GridFSBucket(conn.db, { bucketName: 'fs' });
    db = conn.db;
    console.log(`Connected to database: ${dbName}`);
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/searchID', async (req, res) => {
    let videoID = String(req.body.VideoID);
    try {
        const videoData = await db.collection('videos').findOne({ VideoID: videoID });
        console.log(`Database query result: ${JSON.stringify(videoData)}`); // Debugging-Information
        if (!videoData) {
            return res.status(404).send({ error: 'Video not found' });
        }
        console.log(videoData);

        const frames = await Promise.all(videoData.Frames.map(async frame => {
            const file = await db.collection('fs.files').findOne({ filename: `${frame.FrameID}.jpg` });
            if (!file) {
                throw new Error(`Keyframe image not found: ${frame.FrameID}.jpg`);
            }
            const readstream = gfsBucket.openDownloadStreamByName(file.filename);
            let chunks = [];
            for await (const chunk of readstream) {
                chunks.push(chunk);
            }
            frame.KeyframeImage = Buffer.concat(chunks).toString('base64');
            return frame;
        }));

        videoData.Frames = frames;
        res.status(200).send(videoData);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while retrieving the video data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

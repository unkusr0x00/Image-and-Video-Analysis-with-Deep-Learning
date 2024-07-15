const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const url = 'mongodb://localhost:27017';
const dbName = 'VideoKeyframeDB';

// Replace the following path with the path to your conda executable
const condaPath = 'C:/Users/Aron/miniconda3/Scripts/conda.exe';

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

app.post('/clip-search', async (req, res) => {
    const query = req.body.query;

    exec(`"${condaPath}" run -n dl python clip_search.py "${query}"`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Server Error');
        }

        const clipResults = JSON.parse(stdout);
        const videoIDs = clipResults.map(result => result[0].split(path.sep)[1]);

        try {
            const videoDataArray = await db.collection('videos').find({ VideoID: { $in: videoIDs } }).toArray();

            const videoMap = new Map();

            for (const videoData of videoDataArray) {
                const processedFrames = new Set();

                const frames = await Promise.all(videoData.Frames.map(async (frame) => {
                    const frameFileName = path.join(videoData.VideoID, `${frame.FrameID}.jpg`).replace(/\\/g, '/');
                    const isMatch = clipResults.some(result => {
                        const resultPath = result[0].replace(/\\/g, '/').replace(/_+\.jpg$/, '.jpg');
                        const expectedPath = `keyframes/${frameFileName}`;
                        return resultPath === expectedPath;
                    });

                    if (!processedFrames.has(frame.FrameID)) {
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
                        frame.isMatch = isMatch;
                        processedFrames.add(frame.FrameID);
                        return frame;
                    } else {
                        return null;  // Skip if frame is already processed
                    }
                }));

                videoData.Frames = frames.filter(frame => frame !== null);  // Remove null frames

                // Add or update video in the map
                videoMap.set(videoData.VideoID, videoData);
            }

            // Convert the map to an array and return it
            const flaggedVideos = Array.from(videoMap.values());
            res.status(200).send(flaggedVideos);
        } catch (dbError) {
            console.error(`Database error: ${dbError}`);
            res.status(500).send('Database Error');
        }
    });
});

app.post('/get-video', async (req, res) => {
    const videoID = req.body.videoID;

    if (!videoID) {
        return res.status(400).send({ error: 'VideoID is required' });
    }

    const videoDir = path.join(__dirname, 'V3C1-100', videoID);
    const videoPath = path.join(videoDir, `${videoID}.mp4`);

    if (fs.existsSync(videoPath)) {
        res.setHeader('Content-Type', 'video/mp4');
        res.sendFile(videoPath, err => {
            if (err) {
                console.error(`Error sending file: ${err}`);
                res.status(500).send({ error: 'Error sending the video file' });
            }
        });
    } else {
        res.status(404).send({ error: 'Video not found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

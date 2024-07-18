const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

const url = 'mongodb://localhost:27017';
const dbName = 'VideoKeyframeDB';
const yoloDbName = 'YOLOKeyframeDB';

// Replace the following path with the path to your conda executable
const condaPath = 'C:/Users/Aron/miniconda3/Scripts/conda.exe';

let db, gfsBucket;
let yoloDb, yoloGfsBucket;

const objectClasses = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    4: "airplane",
    5: "bus",
    6: "train",
    7: "truck",
    8: "boat",
    9: "traffic light",
    10: "fire hydrant",
    11: "stop sign",
    12: "parking meter",
    13: "bench",
    14: "bird",
    15: "cat",
    16: "dog",
    17: "horse",
    18: "sheep",
    19: "cow",
    20: "elephant",
    21: "bear",
    22: "zebra",
    23: "giraffe",
    24: "backpack",
    25: "umbrella",
    26: "handbag",
    27: "tie",
    28: "suitcase",
    29: "frisbee",
    30: "skis",
    31: "snowboard",
    32: "sports ball",
    33: "kite",
    34: "baseball bat",
    35: "baseball glove",
    36: "skateboard",
    37: "surfboard",
    38: "tennis racket",
    39: "bottle",
    40: "wine glass",
    41: "cup",
    42: "fork",
    43: "knife",
    44: "spoon",
    45: "bowl",
    46: "banana",
    47: "apple",
    48: "sandwich",
    49: "orange",
    50: "broccoli",
    51: "carrot",
    52: "hot dog",
    53: "pizza",
    54: "donut",
    55: "cake",
    56: "chair",
    57: "couch",
    58: "potted plant",
    59: "bed",
    60: "dining table",
    61: "toilet",
    62: "tv",
    63: "laptop",
    64: "mouse",
    65: "remote",
    66: "keyboard",
    67: "cell phone",
    68: "microwave",
    69: "oven",
    70: "toaster",
    71: "sink",
    72: "refrigerator",
    73: "book",
    74: "clock",
    75: "vase",
    76: "scissors",
    77: "teddy bear",
    78: "hair drier",
    79: "toothbrush"
};

// Verbindung zur MongoDB herstellen und GridFS initialisieren
mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
    gfsBucket = new GridFSBucket(conn.db, { bucketName: 'fs' });
    db = conn.db;
    console.log(`Connected to database: ${dbName}`);
});

// Connection to YOLOKeyframeDB
const yoloConn = mongoose.createConnection(`${url}/${yoloDbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
yoloConn.on('error', console.error.bind(console, 'connection error:'));
yoloConn.once('open', () => {
    yoloGfsBucket = new GridFSBucket(yoloConn.db, { bucketName: 'fs' });
    yoloDb = yoloConn.db;
    console.log(`Connected to database: ${yoloDbName}`);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/searchID', async (req, res) => {
    let videoID = String(req.body.VideoID);
    try {
        const videoData = await db.collection('videos').findOne({ VideoID: videoID });
        if (!videoData) {
            return res.status(404).send({ error: 'Video not found' });
        }

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

    exec(`"${condaPath}" run -n clip_env python clip_search.py "${query}"`, async (error, stdout, stderr) => {
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

// New endpoint for image upload and processing
app.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No image uploaded' });
    }
    console.log('working');

    const imagePath = req.file.path;

    exec(`"${condaPath}" run -n clip_env python blip_caption.py "${imagePath}"`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Server Error');
        }

        const description = stdout.trim();
        console.log(`Generated description: ${description}`);

        // Perform /clip-search with the generated description
        exec(`"${condaPath}" run -n clip_env python clip_search.py "${description}"`, async (clipError, clipStdout, clipStderr) => {
            if (clipError) {
                console.error(`exec error: ${clipError}`);
                return res.status(500).send('Server Error');
            }

            const clipResults = JSON.parse(clipStdout);
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
});

function extractKeywords(query) {
    const keywords = [];
    for (const key in objectClasses) {
        const keyword = objectClasses[key];
        if (query.toLowerCase().includes(keyword)) {
            keywords.push(keyword);
        }
    }
    return keywords;
}

app.post('/search-by-query', async (req, res) => {
    const query = req.body.query;
    const keywords = extractKeywords(query);

    try {
        const videoDataArray = await yoloDb.collection('videos').find({
            $or: [
                { 'Frames.Objects_e': { $in: keywords } },
                { 'Frames.Objects_c': { $in: keywords } }
            ]
        }).toArray();

        const videoScores = videoDataArray.map(videoData => {
            let matchCount = 0;
            for (const frame of videoData.Frames) {
                if (frame.Objects_e.some(obj => keywords.includes(obj)) || frame.Objects_c.some(obj => keywords.includes(obj))) {
                    matchCount++;
                }
            }
            return { videoData, matchCount };
        });

        videoScores.sort((a, b) => b.matchCount - a.matchCount);
        const topVideos = videoScores.slice(0, 15).map(videoScore => videoScore.videoData);

        const processedVideos = await Promise.all(topVideos.map(async (videoData) => {
            const processedFrames = new Set();

            const frames = await Promise.all(videoData.Frames.map(async (frame) => {
                if (!processedFrames.has(frame.FrameID)) {
                    try {
                        const file = await yoloDb.collection('fs.files').findOne({ filename: `${frame.FrameID}.jpg` });
                        if (!file) {
                            console.warn(`Keyframe image not found: ${frame.FrameID}.jpg`);
                            return null;  // Skip this frame
                        }

                        const readstream = yoloGfsBucket.openDownloadStreamByName(file.filename);
                        let chunks = [];
                        for await (const chunk of readstream) {
                            chunks.push(chunk);
                        }
                        const imageData = Buffer.concat(chunks);
                        console.log(`Processing frame: ${frame.FrameID}, Image size: ${imageData.length} bytes`);

                        frame.KeyframeImage = imageData.toString('base64');
                        frame.isMatch = keywords.some(keyword => frame.Objects_e.includes(keyword) || frame.Objects_c.includes(keyword));
                        processedFrames.add(frame.FrameID);
                        return frame;
                    } catch (error) {
                        console.error(`Error processing frame ${frame.FrameID}: ${error}`);
                        return null;  // Skip this frame on error
                    }
                } else {
                    return null;  // Skip if frame is already processed
                }
            }));

            videoData.Frames = frames.filter(frame => frame !== null);  // Remove null frames
            return videoData;
        }));

        res.status(200).send(processedVideos);
    } catch (dbError) {
        console.error(`Database error: ${dbError}`);
        res.status(500).send('Database Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

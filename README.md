# Content-Based Video Retrieval System by Aron Wedam and Alexander Neben

[YOLOv9](https://github.com/WongKinYiu/yolov9)\
[YOLOv9 output number to object name](https://github.com/WongKinYiu/yolov9/blob/main/data/coco.yaml)\
[CLIP-ODS](https://github.com/shonenkov/CLIP-ODS)

This documentation and setup guide is written for a Windows System using a conda environment.
It is also necessary to install Node.js (min. version 16) and a compatible Angular version

To get started clone the git repository

```bash
git clone https://github.com/unkusr0x00/Image-and-Video-Analysis-with-Deep-Learning.git 
```

Download the V3C1-100 Dataset and put it into the `backend/controller` directory

Download the `Keyframes, shot_boundaries and converted shot_boundaries_converted`

https://drive.google.com/file/d/11g2qKGvvtYjPtT3__PF2r8pEOIylL6CQ/view?usp=sharing

Extract all 3 folders into the `Image-and-Video-Analysis-with-Deep-Learning` root directory

Copy *just* the `keyframes` folder also to the `backend/controller` directory

Download and install MongoDB (recommended to also install MongoDB Compass)

If you don't have `Anaconda` installed on your system, download it here: https://docs.anaconda.com/miniconda/

Set up an anaconda environment and install the following packages:

```bash
conda install torch torchvision torchaudio -c pytorch
conda install opencv pymongo
```

```bash
pip install openai-clip pillow transformers
pip install opencv-python
```

Install Detectron2 for `Image Analysis and Description using Detectron2 and Vision-Transformer Models` via pip:
```bash
pip3 install 'git+https://github.com/facebookresearch/detectron2.git' 
```

Execute the `database_setup.ipynb` Notebook with the created environment , the MongoDB Database and collections will be created.

Download the folder YOLO (Link below) and extract it into the root directory. Navigate to the folder `YOLO` and execute `database_setup_with_yolo_integrated.ipynb`
https://drive.google.com/file/d/1xhJlAl4JrQ35i5C6UyB_9p4l5LDnNDrB/view?usp=sharing

Navigate to the `backend/controller` directory and execute `precompute_features.py` to create the image features (`image_features.npy`) to query the keyframes faster will be created.

Alternatively you can also download the file here and put it into the `backend/controller` directory:
https://drive.google.com/file/d/1leremg2UQJbtQHbgXuACMVuE2edGEFGP/view?usp=sharing

Next, open the Image-and-Video-Analysis-with-Deepl-Learning directory with an IDE of choice. E.g. IntelliJ

**Backend:**

Navigate to the `backend/controller` directory and execute
```bash
npm i
```
Then you should be able to start the server backend with
```bash
node server.js
```

**Frontend:**

Navigate to the `frontend` directory in a separate command prompt and execute
```bash
npm i
```
Then you should be able to start the server backend with
```bash
ng serve --open
```

**Using the App:**

You can use the text-input field to type in text queries that you want to find in the video.
You can either use CLIP (Search with CLIP), the results of YOLO (Search with CNN results) or just search for one Video using the VideoID (Search with videoID)
It is also possible to upload an image and search for similar scenes.
When hinting `Enter` or pressing the search button. The System will search for Matching Scenes from Videos. (This may take longer - depending on your setup, also, only when performing the first search, it will take significantly longer as model weights need to be downloaded.)
You can then browse the resulting scenes as well as other scenes of the matching videos.
Matching scenes will be marked in red, but also other scenes can be marked by `left-clicking` them.

Frames can be inspected via `right-clicking` them. Here the start- and end-time of a frame is also shown.
By clicking on the `play icon`, a video-player will open, if you open it from a frame the video-player will immediately jump to the timestamp of the scene after hitting play once.
You can see the current and overall time of the video beneath the video-player.
Clicking the up and down arrows in the field of the current-time will jump one frame forward or backward.
Clicking on Submit will submit the current video with the current video time as starttime and the current video time + 1ßsec. as end time.
Submitting is also possible from the video browser `(upload icon)` and completely manual ``(! button on the bottom right corner)``

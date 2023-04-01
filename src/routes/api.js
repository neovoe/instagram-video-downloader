import axios from "axios";
import { load } from "cheerio";
import { Router } from "express";

const router = Router();

const formatVideoInfo = (videoObj) => {
  const height = videoObj.height;
  const width = videoObj.width;
  const resolution = `${width}x${height}`;
  const formattedInfo = {
    caption: videoObj.caption,
    description: videoObj.description,
    resolution: resolution,
    uploadDate: videoObj.uploadDate,
    thumbnail: videoObj.thumbnailUrl,
    url: videoObj.contentUrl,
  };

  return formattedInfo;
};

const formatResponse = (postID, json) => {
  const username = json.author.identifier.value;
  const videoList = json.video;
  const formattedVideoList = [];

  for (let video of videoList) {
    let videoObj = formatVideoInfo(video);
    formattedVideoList.push(videoObj);
  }

  const result = {
    id: postID,
    username: username,
    videos: formattedVideoList,
  };

  return result;
};

const fetchPostJson = async (postID) => {
  const instaPostUrl = "https://www.instagram.com/p/" + postID;
  const response = await axios.get(instaPostUrl);
  const $ = load(response.data);
  const dataText = $("script[type='application/ld+json']").text();
  const json = JSON.parse(dataText);
  return json;
};

router.get("/", async (req, res, next) => {
  const postID = req.query.id;
  if (!postID) {
    const error = new Error("Please provide an instagram post ID");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const json = await fetchPostJson(postID);
    const response = formatResponse(postID, json);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

export default router;
import { openDB } from "idb";

const DATABASE_NAME = "story-orang-db";
const DATABASE_VERSION = 3; 
const OBJECT_STORE_NAME = "story-marks";
const PENDING_STORE_NAME = "pending-stories";
const TOKEN_STORE_NAME = "auth-token"; 

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
    }
    if (oldVersion < 2) {
      db.createObjectStore(PENDING_STORE_NAME, { keyPath: "id" });
    }
    if (oldVersion < 3) {
      db.createObjectStore(TOKEN_STORE_NAME);
    }
  },
});

const DbHelper = {
  async getStory(id) {
    if (!id) return null;
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async putStory(story) {
    if (!story.id) return null;
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async deleteStory(id) {
    if (!id) return null;
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  async addPendingStory(storyData) {
    return (await dbPromise).put(PENDING_STORE_NAME, storyData);
  },
  async getAllPendingStories() {
    return (await dbPromise).getAll(PENDING_STORE_NAME);
  },
  async deletePendingStory(id) {
    return (await dbPromise).delete(PENDING_STORE_NAME, id);
  },

  async putToken(token) {
    return (await dbPromise).put(TOKEN_STORE_NAME, token, "authToken");
  },
  async getToken() {
    return (await dbPromise).get(TOKEN_STORE_NAME, "authToken");
  },
  async deleteToken() {
    return (await dbPromise).delete(TOKEN_STORE_NAME, "authToken");
  },
};

export default DbHelper;

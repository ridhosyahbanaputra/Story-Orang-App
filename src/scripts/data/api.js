import CONFIG from "../config";
import Auth from "../utils/auth";

const MOCK_STORIES = [];

const API_ENDPOINT = {
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories?location=1`,
  GET_STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
};

const ApiSource = {
  async getAllStories() {
    try {
      const token = Auth.getToken();
      if (!token) {
        throw new Error("401 (Unauthorized)");
      }

      const response = await fetch(API_ENDPOINT.GET_ALL_STORIES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "reload", 
      });

      if (!response.ok) {
        throw new Error(response.status);
      }

      const responseJson = await response.json();

      return { isMock: false, data: responseJson.listStory };
    } catch (error) {
      console.error("Error fetching stories:", error.message);
      if (error.message.includes("401")) {
        console.warn(
          "Token tidak valid atau tidak ada. Menggunakan mock data."
        );
      } else {
        console.error("Gagal memuat.");
      }

      return { isMock: true, data: MOCK_STORIES };
    }
  },

  async addNewStory(storyData) {
    const token = Auth.getToken();
    if (!token) {
      throw new Error("401 (Unauthorized)");
    }

    const response = await fetch(API_ENDPOINT.ADD_NEW_STORY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: storyData,
    });

    const responseJson = await response.json();
    if (response.status >= 400) {
      throw new Error(
        responseJson.message || `HTTP error! status: ${response.status}`
      );
    }
    return responseJson;
  },

  async getStoryDetail(id) {
    try {
      const token = Auth.getToken();
      if (!token) {
        throw new Error("401 (Unauthorized)");
      }

      const response = await fetch(API_ENDPOINT.GET_STORY_DETAIL(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "reload",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseJson = await response.json();
      return responseJson.story;
    } catch (error) {
      console.error(`Error fetching story detail for ${id}:`, error.message);
      return {
        name: "Error",
        author: "System",
        description: "Gagal memuat detail cerita.",
        lat: 0,
        lon: 0,
      };
    }
  },

  async register(userData) {
    const response = await fetch(API_ENDPOINT.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async login(userData) {
    const response = await fetch(API_ENDPOINT.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

export default ApiSource;

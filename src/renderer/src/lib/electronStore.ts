const getItem = async (key: string): Promise<string | null> => {
  try {
    return await window.electronAPI.storage.getItem(key);
  } catch (error) {
    console.error("Error getting item from electron storage:", error);
    return null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  try {
    const success = await window.electronAPI.storage.setItem(key, value);
    if (!success) {
      throw new Error("Failed to set item in electron storage");
    }
  } catch (error) {
    console.error("Error setting item in electron storage:", error);
    throw error;
  }
};

const removeItem = async (key: string): Promise<void> => {
  try {
    const success = await window.electronAPI.storage.removeItem(key);
    if (!success) {
      throw new Error("Failed to remove item from electron storage");
    }
  } catch (error) {
    console.error("Error removing item from electron storage:", error);
    throw error;
  }
};

export const jsonStorage = {
  getItem: (key: string) => getItem(key),
  setItem: (key: string, value: string) => setItem(key, value),
  removeItem: (key: string) => removeItem(key),
};

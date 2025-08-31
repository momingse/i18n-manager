// main.ts or main/index.ts
import { handleIPC, StorageIPCChannel } from ".";
import { storeGetItem, storeRemoveItem, storeSetItem } from "../helper/storage";

export const setupStorageIPCHandler = () => {
  // Get item from storage
  handleIPC(StorageIPCChannel.getItem, async (_, key) => {
    return await storeGetItem(key);
  });

  // Set item in storage
  handleIPC(StorageIPCChannel.setItem, async (_, key, value) => {
    return await storeSetItem(key, value);
  });

  // Remove item from storage
  handleIPC(StorageIPCChannel.removeItem, async (_, key) => {
    return await storeRemoveItem(key);
  });
};

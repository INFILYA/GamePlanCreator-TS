import { ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { storage } from "../config/firebase";

export default function SendStatistic() {
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  async function uploadFile() {
    if (!fileUpload) return;
    const filesFolderRef = ref(storage, `Statistic/${fileUpload.name}`);
    try {
      await uploadBytes(filesFolderRef, fileUpload);
    } catch (e) {
      console.error(e);
    }
    console.log("done");
  }
  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          setFileUpload(e.target.files![0]);
        }}
      />
      <button onClick={uploadFile}>Upload statistic</button>
    </div>
  );
}

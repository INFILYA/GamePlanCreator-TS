import { ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { storage } from "../config/firebase";
import { RegularButton } from "../css/Button.styled";
import SectionWrapper from "../wrappers/SectionWrapper";

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
    <SectionWrapper>
      <div className="sendStatisticPanel">
        <input
          className="choose-file"
          type="file"
          onChange={(e) => {
            setFileUpload(e.target.files![0]);
          }}
        />
        <RegularButton onClick={uploadFile} $color="black" $background="#ffd700" type="button">
          Upload statistic
        </RegularButton>
      </div>
    </SectionWrapper>
  );
}

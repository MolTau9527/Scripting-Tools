import { Button } from "scripting";
import { dismissApp } from "../utils";

const CloseButton = () => {
  return <Button title="" systemImage="xmark" action={dismissApp.current} />;
};

export default CloseButton;

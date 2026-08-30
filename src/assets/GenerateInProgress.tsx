import { ShapeLine } from "../components/icons/AppleIcons";
import IconInProgress from "./IconInProgress";

function GenerateInProgress(props: any) {
  return (
    <IconInProgress {...props} icon={<ShapeLine></ShapeLine>}></IconInProgress>
  );
}
export default GenerateInProgress;

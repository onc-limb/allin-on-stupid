import { Title } from "@solidjs/meta";
import ScrollTrialGame from "../components/ScrollTrialGame";
import "./scroll-trial.css";

export default function ScrollTrial() {
  return (
    <main class="scroll-trial-container">
      <Title>スクロールタイムアタック - All In On Stupid</Title>

      <ScrollTrialGame />
    </main>
  );
}

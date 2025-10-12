import s from "./ki.module.scss";

function KI() {
  return (
    <div className={s.page}>
      <h1>KI Werkzeuge</h1>
      <div className={s.tools}>
        <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer">
          ChatGPT
        </a>
        <a href="https://chat.deepseek.com/" target="_blank" rel="noopener noreferrer">
          DeepSeek
        </a>
        <a href="https://aitester.de/" target="_blank" rel="noopener noreferrer">
          AITester
        </a>
      </div>
      <h1>Die Seite befindet sich derzeit im Aufbau.😁</h1>
    </div>
  );
}

export default KI;

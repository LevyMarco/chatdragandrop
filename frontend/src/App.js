  // src/App.js
  import React, { useState, useEffect } from "react";
  import FlowEditor from "./FlowEditor"; // Importando o FlowEditor

  function App() {
    const [elements, setElements] = useState([]); // Estado para armazenar os elementos

    // Inicializa os elementos com um nó de exemplo
    useEffect(() => {
      const initialElements = [
        { id: "1", type: "message", data: { label: "Escolha o setor" }, position: { x: 100, y: 100 } },
        { id: "2", type: "message", data: { label: "Mensagem de resposta" }, position: { x: 300, y: 100 } },
        { id: "e1-2", source: "1", target: "2", animated: true },  // Conectando os nós
      ];
      setElements(initialElements); // Atualizando o estado com os elementos iniciais
    }, []);

    return (
      <div style={{ height: "100vh" }}>
        <FlowEditor elements={elements} setElements={setElements} />
      </div>
    );
  }

  export default App;
// src/StartChat.js
import React from "react";

const StartChat = ({ onStart }) => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Comece o seu chat de atendimento!</h1>
      <p style={styles.subtitle}>Clique abaixo para começar a editar o seu fluxo</p>
      <button onClick={onStart} style={styles.button}>
        Iniciar Chat
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    margin: "50px auto",
  },
  title: {
    fontSize: "24px",
    color: "#333",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: "10px 0",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default StartChat;
import axios from "axios";

// A URL base do seu backend, que pode ser configurada via variável de ambiente ou diretamente.
// Lembre-se de atualizar esta URL se o ngrok mudar.
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://chat1-coral.vercel.app/";

// Função para salvar o fluxo
export const saveFlow = async (flowData) => {
  try {
    // Enviar o fluxo de dados para o backend, garantindo Content-Type: application/json
    const response = await axios.post(
      `${BASE_URL}/api/save_flow`,
      flowData,
      {
        headers: {
          "Content-Type": "application/json", // Importante para o Flask processar como JSON
        },
      }
    );
    
    // Retornar a resposta do backend
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar fluxo", error);
    throw new Error("Não foi possível salvar o fluxo. Tente novamente mais tarde.");
  }
};

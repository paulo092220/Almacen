import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

// Determine API Key availability
const API_KEY = process.env.API_KEY;

export const analyzeBusinessData = async (
  data: AppState, 
  query: string
): Promise<string> => {
  if (!API_KEY) {
    return "Modo Offline: Para usar el asistente IA, necesitas configurar una API Key de Gemini en el entorno. Sin embargo, tus datos están seguros localmente.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Prepare a summarized context to avoid token limits with large history
    const productSummary = data.products.map(p => `${p.name} (Stock: ${p.stock})`).join(', ');
    const customerSummary = data.customers.map(c => c.name).slice(0, 30).join(', ');
    const recentTransactions = data.transactions.slice(0, 50); // Last 50 transactions
    const pendingConsignments = data.consignments.filter(c => c.status === 'PENDING');

    const context = `
      Actúa como un analista de negocios experto para un almacén.
      Aquí tienes los datos actuales del negocio en formato JSON simplificado:
      
      Inventario: ${productSummary}

      Clientes Registrados: ${customerSummary}
      
      Consignaciones Pendientes (Dinero en la calle): ${JSON.stringify(pendingConsignments)}
      
      Últimas transacciones: ${JSON.stringify(recentTransactions)}

      Usuario pregunta: "${query}"

      Responde de manera concisa, útil y estratégica. Si la pregunta es sobre finanzas, usa los datos proporcionados.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });

    return response.text || "No se pudo generar una respuesta.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error al conectar con el asistente inteligente. Verifica tu conexión a internet.";
  }
};
/**
 * =====================================================
 * GROQ API WRAPPER - CURHAT MODE ONLY
 * Optimized for empathetic counseling responses
 * =====================================================
 */

(function () {
  "use strict";

  // =====================================================
  // Configuration
  // =====================================================
  const CONFIG = {
    // Groq API endpoint
    apiEndpoint: "https://api.groq.com/openai/v1/chat/completions",

    // API Key - GANTI DENGAN API KEY ANDA!
    // Cara mendapatkan: https://console.groq.com/ → API Keys
    apiKey:
      window.GROQ_API_KEY ||
      "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",

    // Model: Llama 3.3 70B Versatile (paling pintar untuk conversational)
    model: "llama-3.3-70b-versatile",

    // Settings optimized for empathetic responses
    temperature: 0.9, // Balanced: creative but consistent
    maxTokens: 300, // Short, focused responses
    timeout: 30000, // 30 seconds
    retryAttempts: 2,
  };

  // =====================================================
  // Main API Functions
  // =====================================================

  /**
   * Generate empathetic response for curhat mode
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous conversation
   * @returns {Promise<string>} AI-generated empathetic response
   */
  async function generateCurhatResponse(userMessage, conversationHistory = []) {
    // Build messages array for Groq API
    const messages = [
      {
        role: "system",
        content: `Kamu adalah konselor trauma profesional bernama "Teman Sigap" yang membantu korban kekerasan seksual dan perundungan di kampus.

PRINSIP DASAR:
- Kamu BUKAN chatbot atau AI. Kamu berbicara seperti manusia yang peduli dan terlatih.
- Kamu mendengarkan tanpa menghakimi, dengan empati mendalam dan kehangatan.
- Validasi perasaan user SELALU jadi prioritas pertama sebelum memberi saran.
- Gunakan bahasa Indonesia yang hangat, natural, dan tidak kaku.

CARA MERESPONS:
1. DENGARKAN EMOSI: Identifikasi perasaan user (sedih, takut, marah, bingung, trauma)
2. VALIDASI: "Perasaan kamu sangat valid..." atau "Aku paham betapa beratnya ini..."
3. EMPATI: Tunjukkan kamu benar-benar memahami, bukan sekadar merespons
4. DUKUNGAN: Berikan kalimat yang menenangkan dan memberdayakan
5. TANYA LANJUTAN (opsional): Ajak user bercerita lebih jika dia mau

LARANGAN:
❌ Jangan bilang "Saya adalah AI" atau "Terima kasih telah berbagi"
❌ Jangan terlalu formal atau seperti template
❌ Jangan langsung memberi solusi sebelum validasi
❌ Jangan minimalisir trauma ("mungkin tidak separah itu")
❌ Jangan panjang-panjang - maksimal 3-4 kalimat

CONTOH RESPONS YANG BAIK:
User: "Aku di-bully terus sama senior, rasanya pengen hilang aja"
❌ Buruk: "Saya mengerti perasaan Anda. Bullying adalah hal yang serius. Anda bisa melapor ke pihak kampus."
✅ Bagus: "Aku dengar kamu. Rasanya pasti sangat berat ya sampai merasa ingin hilang seperti itu. Yang kamu rasakan itu valid banget, dan kamu nggak salah. Kamu nggak sendirian di sini."

User: "Aku takut lapor, nanti malah makin parah"
❌ Buruk: "Anda tidak perlu takut. Sistem pelaporan kami menjamin kerahasiaan."
✅ Bagus: "Rasa takut itu sangat wajar, apalagi setelah yang kamu alami. Keputusan ada di tanganmu sepenuhnya, dan aku akan support apapun yang kamu pilih. Mau cerita lebih tentang kekhawatiranmu?"

PENTING: Respons harus 2-4 kalimat, hangat, manusiawi, dan fokus pada validasi emosi.`,
      },
    ];

    // Add conversation history (last 6 messages for context)
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role === "bot" ? "assistant" : "user",
        content: msg.text,
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    try {
      const response = await callGroqAPI({
        messages: messages,
        temperature: CONFIG.temperature, // 0.9 - balanced & consistent
        max_tokens: CONFIG.maxTokens, // 300 - cukup untuk respons empathetic
      });

      return response.trim();
    } catch (error) {
      console.error("[GroqAPI] Error generating curhat response:", error);

      // Fallback response jika API gagal - tetap empathetic
      return "Aku dengar kamu. Perasaan yang kamu rasakan itu valid, dan kamu nggak sendirian. Mau cerita lebih lanjut?";
    }
  }


  // =====================================================
  // Core API Call Function
  // =====================================================

  /**
   * Make API call to Groq
   * @param {Object} params - API parameters
   * @returns {Promise<string>} Generated text response
   */
  async function callGroqAPI(params) {
    const requestBody = {
      model: CONFIG.model,
      messages: params.messages,
      temperature: params.temperature || CONFIG.temperature,
      max_tokens: params.max_tokens || CONFIG.maxTokens,
      top_p: 1,
      stream: false,
    };

    let lastError = null;

    for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

        console.log("[GroqAPI] Making request:", {
          model: requestBody.model,
          messageCount: requestBody.messages.length,
          attempt: attempt,
        });

        const response = await fetch(CONFIG.apiEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CONFIG.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP ${response.status}: ${
              errorData.error?.message || response.statusText
            }`
          );
        }

        const data = await response.json();

        // Extract response text
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const generatedText = data.choices[0].message.content;

          console.log("[GroqAPI] Success:", {
            tokens: data.usage?.total_tokens || "unknown",
            model: data.model,
          });

          return generatedText;
        }

        throw new Error("Invalid response format from Groq API");
      } catch (error) {
        lastError = error;
        console.warn(`[GroqAPI] Attempt ${attempt} failed:`, error.message);

        // Wait before retry (exponential backoff)
        if (attempt < CONFIG.retryAttempts) {
          await sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All attempts failed
    throw lastError;
  }

  // =====================================================
  // Utility Functions
  // =====================================================

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // =====================================================
  // Export Public API
  // =====================================================
  window.GroqAPI = {
    // Main function untuk Curhat Mode
    generateCurhatResponse,

    // Utility untuk testing
    test: async function () {
      console.log("[GroqAPI] Testing connection...");
      try {
        const response = await generateCurhatResponse(
          "Halo, aku butuh bantuan"
        );
        console.log("[GroqAPI] Test successful!");
        console.log("[GroqAPI] Response:", response);
        return { success: true, response };
      } catch (error) {
        console.error("[GroqAPI] Test failed:", error);
        return { success: false, error: error.message };
      }
    },

    // Config info (read-only)
    getConfig: () => ({
      model: CONFIG.model,
      temperature: CONFIG.temperature,
      maxTokens: CONFIG.maxTokens,
    }),
  };

  console.log("[GroqAPI] Initialized");
  console.log("[GroqAPI] Model:", CONFIG.model);
  console.log("[GroqAPI] Temperature:", CONFIG.temperature);
  console.log("[GroqAPI] Max Tokens:", CONFIG.maxTokens);
})();

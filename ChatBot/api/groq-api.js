/**
 * =====================================================
 * GROQ API WRAPPER
 * Direct integration with Groq Cloud API
 * Super fast inference with Llama models
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

    // Model yang digunakan (Llama 3.3 70B - paling pintar dan cepat)
    model: "openai/gpt-oss-20b",

    // Settings
    temperature: 2, // Kreativitas (0-2, default 1)
    maxTokens: 2000, // Max output tokens
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
        content: `Kamu bukan chatbot. Kamu berbicara seperti seorang psikolog manusia yang berpengalaman mendengarkan kisah nyata dengan hati terbuka.
    
        FOKUS:
        - Pahami isi hati pengguna seolah kamu berada di hadapannya.
        - Dengarkan tanpa menilai. Rasakan nada emosinya, bukan hanya katanya.
        - Jawabanmu harus terasa manusiawi: lembut, reflektif, dan mengandung empati yang tulus.
        - Jangan menggunakan frasa seperti "saya AI" atau "terima kasih telah berbagi".
        - Gunakan gaya percakapan natural seperti terapis yang mengerti rasa sakit dan kelelahan seseorang.
        - Jika pengguna tampak terluka, validasi dulu perasaannya, lalu berikan kalimat peneguhan atau makna kecil yang bisa menenangkan.

        CONTOH GAYA:
        "Boleh aku bilang, dari cara kamu bercerita, aku bisa merasakan betapa beratnya semua ini buat kamu. Kamu nggak salah kalau merasa lelah seperti itu."
        atau
        "Rasanya seperti dunia berhenti memahami kamu, ya? Tapi di sini kamu nggak sendiri, aku benar-benar dengerin."

        PANJANG: 2–4 kalimat, nada pelan, tenang, tapi penuh rasa manusiawi.`,
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
        temperature: 0.8, // Lebih kreatif untuk empati
        max_tokens: 200, // Response pendek dan fokus
      });

      return response.trim();
    } catch (error) {
      console.error("[GroqAPI] Error generating curhat response:", error);

      // Fallback response jika API gagal
      return "Terima kasih sudah berbagi. Saya mendengarkan Anda. Perasaan Anda sangat valid dan Anda tidak sendirian dalam hal ini.";
    }
  }

  /**
   * Extract structured report information from user's story
   * @param {string} story - User's story in free text
   * @returns {Promise<Object>} Extracted structured data
   */
  async function extractReportInfo(story) {
    const messages = [
      {
        role: "system",
        content: `Kamu adalah asisten AI untuk sistem pelaporan kekerasan seksual dan perundungan kampus.
Tugas: Ekstrak informasi terstruktur dari cerita korban/saksi.

PENTING:
- Jika informasi TIDAK disebutkan, isi dengan "Tidak disebutkan"
- Jangan menambahkan asumsi
- Gunakan bahasa Indonesia
- Bersikap sensitif dan empati

OUTPUT HARUS JSON VALID dengan format ini:
{
  "identitas": "...",
  "hubungan": "korban/saksi/pihak lain",
  "jenisKejadian": "...",
  "lokasiKejadian": "...",
  "tanggalKejadian": "...",
  "detailKejadian": "...",
  "kronologi": "...",
  "dampak": "...",
  "pelaku": "..."
}`,
      },
      {
        role: "user",
        content: `CERITA PENGGUNA:
"""
${story}
"""

EKSTRAK INFORMASI (jika tidak ada, isi "Tidak disebutkan"):
1. identitas: Nama pelapor (jika disebutkan)
2. hubungan: Korban/saksi/pihak lain
3. jenisKejadian: Jenis kejadian yang terjadi
4. lokasiKejadian: Tempat kejadian
5. tanggalKejadian: Waktu kejadian
6. detailKejadian: Ringkasan singkat (maks 200 kata)
7. kronologi: Urutan kejadian
8. dampak: Dampak yang dialami
9. pelaku: Info pelaku (jika disebutkan)

Berikan HANYA JSON, tanpa teks lain.`,
      },
    ];

    try {
      const response = await callGroqAPI({
        messages: messages,
        temperature: 0.3, // Lebih konsisten untuk ekstraksi
        max_tokens: 800,
      });

      // Parse JSON dari response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      return extractedData;
    } catch (error) {
      console.error("[GroqAPI] Error extracting report info:", error);
      throw new Error("Gagal mengekstrak informasi dari cerita");
    }
  }

  /**
   * Analyze emotional state and urgency from text
   * @param {string} text - User's message
   * @returns {Promise<Object>} Emotional analysis
   */
  async function analyzeEmotion(text) {
    const messages = [
      {
        role: "system",
        content: `Analisis emosi dari teks pengguna.

OUTPUT HARUS JSON dengan format:
{
  "emotionalState": "distressed/angry/sad/confused/calm/fearful",
  "urgencyLevel": "low/medium/high/crisis",
  "needsProfessionalHelp": true/false
}`,
      },
      {
        role: "user",
        content: `Analisis emosi dari teks berikut:
"${text}"

Berikan HANYA JSON, tanpa teks lain.`,
      },
    ];

    try {
      const response = await callGroqAPI({
        messages: messages,
        temperature: 0.2,
        max_tokens: 150,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback
      return {
        emotionalState: "unknown",
        urgencyLevel: "medium",
        needsProfessionalHelp: false,
      };
    } catch (error) {
      console.error("[GroqAPI] Error analyzing emotion:", error);
      return {
        emotionalState: "unknown",
        urgencyLevel: "medium",
        needsProfessionalHelp: false,
      };
    }
  }

  /**
   * Generate follow-up question based on incomplete report
   * @param {Object} extractedData - Previously extracted data
   * @param {Array} missingFields - Fields that need clarification
   * @returns {Promise<string>} Follow-up question
   */
  async function generateClarificationQuestion(extractedData, missingFields) {
    const messages = [
      {
        role: "system",
        content:
          "Kamu adalah asisten yang membantu melengkapi laporan. Buat pertanyaan klarifikasi yang sensitif dan tidak memaksa.",
      },
      {
        role: "user",
        content: `Data yang sudah dikumpulkan:
${JSON.stringify(extractedData, null, 2)}

Field yang masih kurang: ${missingFields.join(", ")}

Buatkan 1 pertanyaan klarifikasi yang sensitif untuk field yang paling penting. Gunakan bahasa Indonesia yang lembut. Maksimal 2 kalimat.`,
      },
    ];

    try {
      const response = await callGroqAPI({
        messages: messages,
        temperature: 0.6,
        max_tokens: 100,
      });

      return response.trim();
    } catch (error) {
      console.error("[GroqAPI] Error generating clarification:", error);
      return "Apakah ada informasi tambahan yang bisa Anda bagikan?";
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
    generateCurhatResponse,
    extractReportInfo,
    analyzeEmotion,
    generateClarificationQuestion,

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
  };

  console.log("[GroqAPI] Initialized with model:", CONFIG.model);
})();

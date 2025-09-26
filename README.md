# Cortex Commerce: AI-Powered E-Commerce Simulation

Welcome to Cortex Commerce, a fully functional, AI-powered e-commerce store that runs entirely in your browser. This application leverages the Google Gemini API to autonomously manage a digital product business, from generating product ideas to running marketing campaigns.

This is a **frontend-only, "plug and play" application**. There is no complex backend server to set up.

---

## 🚀 Getting Started: Running Your Business

To run this application, you only need to provide your Google Gemini API key.

### Setup Instructions

1.  **Create a `.env` file:** In the root directory of this project, create a new file named `.env`.

2.  **Add your API Key:** Inside the `.env` file, add your Google Gemini API key like this:

    ```
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    **Important:** Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key from Google AI Studio.

3.  **Run the Application:** Serve the `index.html` file using a local development server. The AI will initialize and immediately begin generating its first product drafts for your review.

---

## 💡 Key Features

*   **AI Co-pilot Model:** You are in control. Command the AI to generate product concepts, then review them in the "Drafts" tab. When you publish a draft, the AI takes over to enrich it with details, generate a stunning image, and create a social media announcement. This workflow ensures stability and prevents API errors.
*   **AI-Powered Product Generation:** The AI creates unique digital products, including names, descriptions, features, pricing, and AI-generated images.
*   **Simulated Business Operations:** A detailed Admin Panel provides a real-time look at the store's performance, including a financial dashboard, a marketing campaign overview, and an activity log to monitor the AI's decisions.
*   **Realistic Checkout Flow:** The checkout process simulates a professional redirect to a "PayFast" payment gateway, providing an immersive and authentic e-commerce experience.
*   **AI Support Chatbot:** Customers can ask questions about products and get instant, context-aware answers from an AI-powered chatbot.
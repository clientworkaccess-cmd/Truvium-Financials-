
import { WEBHOOK_URL } from '../constants';

export const sendMessageToWebhook = async (
  message: string, 
  sessionId: string,
  userEmail: string,
  userName: string
): Promise<string> => {
  try {
    const payload = {
      message: message,
      sessionId: sessionId,
      email: userEmail,
      name: userName,
      timestamp: new Date().toISOString(),
      source: 'web-chat-interface'
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`);
    }

    // Attempt to parse JSON, fallback to text if n8n returns raw string
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      
      // n8n often returns an array of items: [{ "output": "..." }]
      let responseObj = data;
      if (Array.isArray(data)) {
        if (data.length > 0) {
          responseObj = data[0];
        } else {
          return ""; // Empty array returned
        }
      }

      // Check common fields in the object
      if (typeof responseObj === 'object' && responseObj !== null) {
        return responseObj.output || responseObj.text || responseObj.message || responseObj.response || JSON.stringify(responseObj);
      }

      return JSON.parse(responseObj);
    } else {
      return await response.text();
    }

  } catch (error) {
    console.error("Failed to send message to webhook:", error);
    throw error;
  }
};

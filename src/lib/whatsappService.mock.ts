/**
 * MOCK WHATSAPP SERVICE LAYER
 * Edify uses WhatsApp as the primary communication channel for parents in Uganda.
 * This mock simulates the API interaction with a provider like Twilio or Meta Graph API.
 */

export interface WhatsAppMessage {
  to: string; // Phone number
  templateName: string; // e.g., 'weekly_summary', 'absence_alert', 'exam_readiness'
  language?: 'en' | 'ug'; // English or Luganda
  variables: Record<string, string | number>;
}

export const WhatsAppMockService = {
  // Simulates sending a structured template message
  sendTemplateMessage: async (msg: WhatsAppMessage): Promise<{ id: string; status: 'sent' | 'failed' }> => {
    console.log(`[WhatsApp API] Sending ${msg.templateName} to ${msg.to}...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`[WhatsApp API] Message Sent Successfully!`);
    console.dir(msg.variables);
    
    return {
      id: `wa-msg-${Date.now()}`,
      status: 'sent'
    };
  },

  // Subscribes a user to WhatsApp updates (opt-in)
  optInUser: async (phoneNumber: string): Promise<boolean> => {
    console.log(`[WhatsApp API] User ${phoneNumber} opted in to notifications.`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
};

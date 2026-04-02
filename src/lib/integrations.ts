import { apiClient } from './api';
import { WebinarSession } from '../types'; // Adjust typing if needed

// Types 
export interface WhatsAppMessage {
  to: string;
  templateName: string;
  language?: 'en' | 'ug';
  variables: Record<string, string | number>;
}

export const IntegrationsService = {
  /**
   * Triggers a WhatsApp payload securely by hitting the backend proxy endpoint
   */
  sendWhatsAppTemplate: async (msg: WhatsAppMessage): Promise<{ id: string; status: 'sent' | 'failed' }> => {
    try {
      const resp = await apiClient.post('/notifications/notification/send-whatsapp/', msg);
      return resp.data;
    } catch (e) {
      console.error("Failed to route WhatsApp to Backend Proxy", e);
      throw e;
    }
  },

  /**
   * Provisions a Google Meet and Calendar link via the backend service
   */
  provisionWebinar: async (params: Partial<WebinarSession>): Promise<Pick<WebinarSession, 'meetingUrl' | 'calendarEventId'>> => {
    try {
      const resp = await apiClient.post('/live-sessions/live-session/provision-webinar/', {
        title: params.title || 'Edify Live Session',
        description: params.description,
        startTime: params.scheduledStart,
        endTime: params.scheduledEnd
      });
      return resp.data;
    } catch (e) {
      console.error("Failed to provision Google Workspace resources via proxy", e);
      throw e;
    }
  }
};

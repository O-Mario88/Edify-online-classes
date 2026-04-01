import { WebinarSession } from '../types';

export interface CalendarEventPayload {
  title: string;
  description: string;
  startTime: string; // ISO
  endTime: string; // ISO
  attendeeEmails: string[];
}

export const GoogleWorkspaceMockService = {
  /**
   * Generates a mock Google Meet Link
   */
  generateMeetLink: async (): Promise<string> => {
    console.log('[Google API Mock] Generating Meet Link...');
    // Real delay simulator
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // e.g. https://meet.google.com/abc-mnop-xyz
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const randomStr = (len: number) => Array.from({length: len}, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
    
    return `https://meet.google.com/${randomStr(3)}-${randomStr(4)}-${randomStr(3)}`;
  },

  /**
   * Creates a mock Google Calendar Event and returns the Event ID
   */
  createCalendarEvent: async (payload: CalendarEventPayload): Promise<string> => {
    console.log('[Google Calendar API Mock] Creating Event:', payload.title);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return `ext-cal-${Date.now().toString(36)}`;
  },

  /**
   * Orchestrates the creation of a full Webinar Session
   * In a real app, this runs on the backend to keep API keys secure.
   */
  provisionWebinar: async (params: Partial<WebinarSession>): Promise<Pick<WebinarSession, 'meetingUrl' | 'calendarEventId'>> => {
    try {
      const meetingUrl = await GoogleWorkspaceMockService.generateMeetLink();
      const calendarEventId = await GoogleWorkspaceMockService.createCalendarEvent({
        title: params.title || 'Edify Live Session',
        description: `${params.description}\n\nJoin Link: ${meetingUrl}`,
        startTime: params.scheduledStart!,
        endTime: params.scheduledEnd!,
        attendeeEmails: [] // Sync happens later
      });
      
      return {
        meetingUrl,
        calendarEventId
      };
    } catch (e) {
      console.error('Failed to provision Google Workspace resources');
      throw e;
    }
  }
};

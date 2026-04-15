import { toast } from 'sonner';

export type NotificationChannel = 'sms' | 'email' | 'push' | 'in_app';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'delivered';

export interface NotificationPayload {
  id: string;
  recipientId: string;
  recipientContact: string; // phone number, device token, or email
  channel: NotificationChannel;
  templateType: string;
  content: string;
  timestamp: number;
  status: NotificationStatus;
}

class NotificationEngineService {
  private notificationLog: NotificationPayload[] = [];
  
  /**
   * Dispatches a notification. In a real system, this hits an SMS/Email provider API.
   * Here, we simulate the delivery lifecycle to provide truthful observability logs.
   */
  public async send(
    channel: NotificationChannel, 
    recipientId: string, 
    contactInfo: string, 
    template: string, 
    content: string,
    fallbackToasts: boolean = true
  ): Promise<NotificationPayload> {
    
    const notification: NotificationPayload = {
      id: `ntf-${Math.random().toString(36).substring(2, 9)}`,
      recipientId,
      recipientContact: contactInfo,
      channel,
      templateType: template,
      content,
      timestamp: Date.now(),
      status: 'queued'
    };
    
    // Add to outbound queue
    this.notificationLog.push(notification);

    if (fallbackToasts && channel === 'in_app') {
       toast(content, { description: `Via ${template}` });
       notification.status = 'delivered';
       
       // Persist to backend without blocking
       apiClient.post('/notifications/', {
          payload: { title: template, message: content },
          channel: channel
       }).catch(console.error);
       
       return notification;
    }

    // Persist to actual backend endpoint
    try {
      const res = await apiClient.post('/notifications/', {
         payload: { title: template, message: content, recipientInfo: contactInfo },
         channel: channel
      });
      const target = this.notificationLog.find(n => n.id === notification.id);
      if (target) target.status = 'delivered';
      
      if (fallbackToasts) {
         toast.success(`[Outbound ${channel.toUpperCase()}] Logged accurately to backend database`, { description: content });
      }
    } catch (err) {
      const target = this.notificationLog.find(n => n.id === notification.id);
      if (target) target.status = 'failed';
      if (fallbackToasts) {
         toast.error(`[Outbound ${channel.toUpperCase()}] Delivery failed!`, { description: `Could not reach ${contactInfo}` });
      }
    }

    return notification;
  }

  /**
   * For the Admin Observability Dashboard
   */
  public getLogs(): NotificationPayload[] {
    // Return a copy sorted by newest first
    return [...this.notificationLog].sort((a, b) => b.timestamp - a.timestamp);
  }

  public getStats() {
    const total = this.notificationLog.length;
    const delivered = this.notificationLog.filter(n => n.status === 'delivered').length;
    const failed = this.notificationLog.filter(n => n.status === 'failed').length;
    const queued = this.notificationLog.filter(n => n.status === 'queued').length;
    
    return { total, delivered, failed, queued };
  }
}

export const NotificationEngine = new NotificationEngineService();

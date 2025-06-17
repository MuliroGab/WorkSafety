export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = "default";

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission(): void {
    if ("Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if ("Notification" in window) {
      this.permission = await Notification.requestPermission();
    }
    return this.permission;
  }

  public async showNotification(options: NotificationOptions): Promise<void> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return;
    }

    if (this.permission === "denied") {
      console.warn("Notifications are denied");
      return;
    }

    if (this.permission === "default") {
      await this.requestPermission();
    }

    if (this.permission === "granted") {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/icon-192.png",
        badge: options.badge || "/icon-192.png",
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
      });
    }
  }

  public showSafetyAlert(message: string, area?: string): void {
    this.showNotification({
      title: "🚨 Safety Alert",
      body: area ? `${message} (${area})` : message,
      tag: "safety-alert",
      requireInteraction: true,
    });
  }

  public showTrainingReminder(courseName: string): void {
    this.showNotification({
      title: "📚 Training Reminder",
      body: `Don't forget to complete: ${courseName}`,
      tag: "training-reminder",
    });
  }

  public showMaintenanceAlert(equipment: string, area: string): void {
    this.showNotification({
      title: "🔧 Maintenance Required",
      body: `${equipment} in ${area} requires maintenance`,
      tag: "maintenance-alert",
      requireInteraction: true,
    });
  }
}

export const notificationService = NotificationService.getInstance();

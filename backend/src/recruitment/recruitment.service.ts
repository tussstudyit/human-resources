import { Injectable } from '@nestjs/common';

@Injectable()
export class RecruitmentService {
  private n8nWebhookUrl =
    process.env.N8N_INTERVIEW_WEBHOOK || 'http://localhost:5678/webhook/interview-schedule';

  async scheduleInterview(data: any) {
    try {
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return { success: response.ok };
    } catch (error: any) {
      console.error('Failed to trigger n8n interview webhook:', error.message);
      return { success: false, error: error.message };
    }
  }
}

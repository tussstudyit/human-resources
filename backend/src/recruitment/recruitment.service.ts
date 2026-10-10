import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecruitmentService {
  private n8nWebhookUrl = process.env.N8N_INTERVIEW_WEBHOOK || 'http://localhost:5678/webhook/interview-schedule';

  async triggerInterviewWebhook(data: { candidateName: string; candidateEmail: string; position: string; interviewTime: string; meetingLink: string }) {
    try {
      const response = await axios.post(this.n8nWebhookUrl, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to trigger n8n interview webhook:', error.message);
      return { success: false, error: error.message };
    }
  }
}

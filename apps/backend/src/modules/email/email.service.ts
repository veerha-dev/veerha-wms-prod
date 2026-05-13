import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import {
  welcomeEmail,
  inviteEmail,
  passwordResetEmail,
  approvalRequestEmail,
} from './templates';

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private from: string = '';
  private appUrl: string = '';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('SMTP_HOST');
    this.from = this.config.get<string>('SMTP_FROM') || 'Veerha WMS <noreply@veerha.com>';
    this.appUrl = this.config.get<string>('APP_URL') || 'http://localhost:8080';

    if (!host) {
      this.logger.warn('SMTP_HOST not configured — EmailService running in NO-OP mode (emails will be logged only)');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(this.config.get<string>('SMTP_PORT') || '587', 10),
      secure: this.config.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    this.logger.log(`EmailService initialised — sending via ${host}`);
  }

  async send(params: SendMailParams): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[NO-OP EMAIL] to=${params.to} subject="${params.subject}"`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
      this.logger.log(`Email sent to ${params.to} — "${params.subject}"`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${params.to}`, err as Error);
      throw err;
    }
  }

  // ─── High-level helpers ─────────────────────────────────────────────

  async sendWelcomeEmail(params: {
    to: string;
    fullName: string;
    tempPassword?: string;
    tenantName?: string;
  }) {
    const loginUrl = `${this.appUrl}/login`;
    const html = welcomeEmail({
      fullName: params.fullName,
      email: params.to,
      tempPassword: params.tempPassword,
      tenantName: params.tenantName,
      loginUrl,
    });
    await this.send({
      to: params.to,
      subject: 'Welcome to Veerha WMS — get started',
      html,
    });
  }

  async sendInviteEmail(params: {
    to: string;
    fullName: string;
    tempPassword: string;
    role: string;
    warehouseName?: string;
    invitedByName?: string;
  }) {
    const loginUrl = `${this.appUrl}/login`;
    const html = inviteEmail({
      fullName: params.fullName,
      email: params.to,
      tempPassword: params.tempPassword,
      role: params.role,
      warehouseName: params.warehouseName,
      invitedByName: params.invitedByName,
      loginUrl,
    });
    await this.send({
      to: params.to,
      subject: `You've been invited to Veerha WMS as ${params.role}`,
      html,
    });
  }

  async sendPasswordResetEmail(params: { to: string; fullName: string; tempPassword: string }) {
    const loginUrl = `${this.appUrl}/login`;
    const html = passwordResetEmail({
      fullName: params.fullName,
      tempPassword: params.tempPassword,
      loginUrl,
    });
    await this.send({
      to: params.to,
      subject: 'Your Veerha WMS password has been reset',
      html,
    });
  }

  async sendApprovalRequestEmail(params: {
    to: string;
    fullName: string;
    requestType: string;
    requestedBy: string;
    detail: string;
    linkPath: string;
  }) {
    const link = `${this.appUrl}${params.linkPath}`;
    const html = approvalRequestEmail({
      fullName: params.fullName,
      requestType: params.requestType,
      requestedBy: params.requestedBy,
      detail: params.detail,
      link,
    });
    await this.send({
      to: params.to,
      subject: `Approval required: ${params.requestType}`,
      html,
    });
  }
}

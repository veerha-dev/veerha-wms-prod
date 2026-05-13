// Plain-HTML email templates. Kept dependency-free so they compile with the rest of the backend.
// Designed for transactional clarity, not visual fanciness.

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #f7f7f9;
  padding: 32px 16px;
  color: #1a1a1a;
  line-height: 1.5;
`;
const cardStyles = `
  max-width: 560px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px;
`;
const codeBlock = `
  display: inline-block;
  background: #f1f5f9;
  padding: 8px 14px;
  border-radius: 6px;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  letter-spacing: 0.5px;
`;
const btn = `
  display: inline-block;
  background: #0f172a;
  color: #ffffff !important;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 8px;
`;

function wrap(inner: string) {
  return `<div style="${baseStyles}"><div style="${cardStyles}">${inner}<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="font-size:12px;color:#64748b;">Veerha WMS · Automated message · Please do not reply.</p></div></div>`;
}

export function welcomeEmail(p: {
  fullName: string;
  email: string;
  tempPassword?: string;
  tenantName?: string;
  loginUrl: string;
}) {
  const pwBlock = p.tempPassword
    ? `<p>Temporary password: <span style="${codeBlock}">${p.tempPassword}</span></p>
       <p>You'll be asked to choose a new password on first login.</p>`
    : '';
  return wrap(`
    <h2 style="margin:0 0 16px 0;">Welcome to Veerha WMS${p.tenantName ? `, ${p.tenantName}` : ''}!</h2>
    <p>Hi ${escape(p.fullName)},</p>
    <p>Your Veerha WMS account is ready. Sign in to start setting up your warehouse.</p>
    <p>Login email: <span style="${codeBlock}">${escape(p.email)}</span></p>
    ${pwBlock}
    <p><a href="${p.loginUrl}" style="${btn}">Sign in to Veerha</a></p>
  `);
}

export function inviteEmail(p: {
  fullName: string;
  email: string;
  tempPassword: string;
  role: string;
  warehouseName?: string;
  invitedByName?: string;
  loginUrl: string;
}) {
  return wrap(`
    <h2 style="margin:0 0 16px 0;">You've been invited to Veerha WMS</h2>
    <p>Hi ${escape(p.fullName)},</p>
    <p>${p.invitedByName ? `${escape(p.invitedByName)} has invited you` : "You've been invited"} to join as <strong>${escape(p.role)}</strong>${p.warehouseName ? ` for the warehouse <strong>${escape(p.warehouseName)}</strong>` : ''}.</p>
    <p>Login email: <span style="${codeBlock}">${escape(p.email)}</span></p>
    <p>Temporary password: <span style="${codeBlock}">${p.tempPassword}</span></p>
    <p>You'll be asked to set your own password on first login.</p>
    <p><a href="${p.loginUrl}" style="${btn}">Accept invitation</a></p>
  `);
}

export function passwordResetEmail(p: { fullName: string; tempPassword: string; loginUrl: string }) {
  return wrap(`
    <h2 style="margin:0 0 16px 0;">Your password has been reset</h2>
    <p>Hi ${escape(p.fullName)},</p>
    <p>An administrator has reset your Veerha WMS password.</p>
    <p>Temporary password: <span style="${codeBlock}">${p.tempPassword}</span></p>
    <p>You'll be asked to choose a new password on next login.</p>
    <p><a href="${p.loginUrl}" style="${btn}">Sign in</a></p>
    <p style="font-size:13px;color:#64748b;">If you did not expect this, contact your administrator immediately.</p>
  `);
}

export function approvalRequestEmail(p: {
  fullName: string;
  requestType: string;
  requestedBy: string;
  detail: string;
  link: string;
}) {
  return wrap(`
    <h2 style="margin:0 0 16px 0;">Approval required</h2>
    <p>Hi ${escape(p.fullName)},</p>
    <p>${escape(p.requestedBy)} has submitted a <strong>${escape(p.requestType)}</strong> that requires your approval.</p>
    <p style="background:#f8fafc;padding:12px 16px;border-radius:8px;">${escape(p.detail)}</p>
    <p><a href="${p.link}" style="${btn}">Review and approve</a></p>
  `);
}

function escape(s: string | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

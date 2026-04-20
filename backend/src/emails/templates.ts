// Plain HTML email templates. Not polished — functional enough for an assessment.
// In a real product these would use a proper template engine (MJML, React Email, etc.)

export function jobScheduledEmail(data: {
  technicianName: string;
  jobTitle: string;
  scheduledAt: Date | string;
  cost: number;
}): { subject: string; html: string } {
  return {
    subject: `New Job Assigned: ${data.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You have a new job assignment</h2>
        <p>Hi ${data.technicianName},</p>
        <p>A new job has been assigned to you:</p>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px; font-weight:bold;">Job</td><td>${data.jobTitle}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Scheduled</td><td>${new Date(data.scheduledAt).toLocaleString()}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Cost</td><td>$${data.cost}</td></tr>
        </table>
        <p>Please make sure you are on time.</p>
      </div>`,
  };
}

export function jobEnRouteEmail(data: {
  clientName: string;
  jobTitle: string;
}): { subject: string; html: string } {
  return {
    subject: `Your technician is on the way — ${data.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your technician is on the way</h2>
        <p>Hi ${data.clientName},</p>
        <p>The technician assigned to <strong>${data.jobTitle}</strong> is now en route to your location.</p>
        <p>Please make sure someone is available to receive them.</p>
      </div>`,
  };
}

export function jobCompletedEmail(data: {
  clientName: string;
  jobTitle: string;
}): { subject: string; html: string } {
  return {
    subject: `Job Completed: ${data.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your job has been completed</h2>
        <p>Hi ${data.clientName},</p>
        <p><strong>${data.jobTitle}</strong> has been marked as completed.</p>
        <p>We hope everything went well! You can now leave a review from your dashboard.</p>
      </div>`,
  };
}

export function jobCancelledEmail(data: {
  recipientName: string;
  jobTitle: string;
}): { subject: string; html: string } {
  return {
    subject: `Job Cancelled: ${data.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>A job has been cancelled</h2>
        <p>Hi ${data.recipientName},</p>
        <p>The job <strong>${data.jobTitle}</strong> has been cancelled.</p>
        <p>If you have questions, please contact support.</p>
      </div>`,
  };
}

export function jobRequestedEmail(data: {
  jobTitle: string;
  jobId: string;
}): { subject: string; html: string } {
  return {
    subject: `New Job Request: ${data.jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>A new job has been requested</h2>
        <p>A client has submitted a new job request that needs to be reviewed and scheduled.</p>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px; font-weight:bold;">Job</td><td>${data.jobTitle}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">ID</td><td>${data.jobId}</td></tr>
        </table>
        <p>Please log in to the admin panel to assign a technician.</p>
      </div>`,
  };
}

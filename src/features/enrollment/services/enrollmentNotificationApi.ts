import { api } from "@/services/api";

export type EnrollmentNotificationChannel = "in_app" | "sms";

export interface NotificationEligibility {
  eligible: boolean;
  reason?: string;
}

export interface NotificationRecipientPreview {
  enrollment_id: string;
  name: string;
  masked_phone: string | null;
  status: string;
  registration_type: string;
  eligibility: Record<EnrollmentNotificationChannel, NotificationEligibility>;
}

export interface NotificationSkipReason {
  channel: EnrollmentNotificationChannel;
  code: string;
  label: string;
  count: number;
}

export interface EnrollmentNotificationPreview {
  selected_count: number;
  recipients: NotificationRecipientPreview[];
  channels: {
    in_app: {
      available: true;
      eligible_count: number;
      skipped_count: number;
    };
    sms: {
      available: boolean;
      reason_code?: string;
      reason?: string;
      eligible_count: number;
      skipped_count: number;
      invalid_phone_count: number;
      sms_disabled_count: number;
    };
  };
  skipped_count: number;
  skip_reasons: NotificationSkipReason[];
}

export interface EnrollmentNotificationSendResult {
  selected_count: number;
  in_app_success_count: number;
  sms_queued_count: number;
  skipped_count: number;
  channel_stats: {
    in_app: { success_count: number; skipped_count: number };
    sms: { queued_count: number; skipped_count: number };
  };
  skip_reasons: NotificationSkipReason[];
  idempotent_replay: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function previewEnrollmentNotification(input: {
  eventId: string;
  enrollmentIds: string[];
  channels: EnrollmentNotificationChannel[];
}): Promise<EnrollmentNotificationPreview> {
  const response = await api.post<ApiResponse<EnrollmentNotificationPreview>>(
    "/api/notification/notify/preview",
    {
      event_id: input.eventId,
      enrollment_ids: input.enrollmentIds,
      channels: input.channels,
    },
  );
  return response.data;
}

export async function sendEnrollmentNotification(input: {
  eventId: string;
  enrollmentIds: string[];
  channels: EnrollmentNotificationChannel[];
  idempotencyKey: string;
  inApp?: { title: string; message: string };
}): Promise<EnrollmentNotificationSendResult> {
  const response = await api.post<ApiResponse<EnrollmentNotificationSendResult>>(
    "/api/notification/notify",
    {
      event_id: input.eventId,
      enrollment_ids: input.enrollmentIds,
      channels: input.channels,
      idempotency_key: input.idempotencyKey,
      in_app: input.inApp
        ? { title: input.inApp.title, message: input.inApp.message }
        : undefined,
    },
  );
  return response.data;
}

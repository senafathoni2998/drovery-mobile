// ==================== STEP TYPES ====================

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface StatusIndicator {
  label: string;
  color: string;
  description: string;
}

// Base step — all step types share these fields
interface BaseStep {
  id: string;
  title: string;
  instruction: string;
  next_label: string;
}

export interface ChecklistStepData extends BaseStep {
  type: "checklist";
  items: ChecklistItem[];
}

export interface QRDisplayStepData extends BaseStep {
  type: "qr_display";
  hint: string; // short hint below the QR code
}

export interface InstructionStepData extends BaseStep {
  type: "instruction";
  icon: string; // Ionicons name
  icon_color: string;
}

export interface DroneButtonStepData extends BaseStep {
  type: "drone_button";
  icon: string;
}

export interface StatusCheckStepData extends BaseStep {
  type: "status_check";
  indicator: StatusIndicator;
}

export interface QRScanStepData extends BaseStep {
  type: "qr_scan";
  hint: string; // short hint shown below the scan button
}

export type WorkflowStep =
  | ChecklistStepData
  | QRDisplayStepData
  | QRScanStepData
  | InstructionStepData
  | DroneButtonStepData
  | StatusCheckStepData;

// ==================== WORKFLOW ====================

export interface Workflow {
  id: string;
  title: string;
  subtitle: string;
  steps: WorkflowStep[];
}

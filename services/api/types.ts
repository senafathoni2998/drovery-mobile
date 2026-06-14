// ==================== Auth ====================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: { id: string; email: string; name: string };
  accessToken: string;
  refreshToken: string;
}

// ==================== Deliveries ====================

export type DeliveryStatus =
  | 'SCHEDULED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'DRONE_ASSIGNED'
  | 'PICKUP_IN_PROGRESS'
  | 'IN_TRANSIT'
  | 'AWAITING_HANDOFF'
  | 'DELIVERED'
  | 'CANCELED'
  // Exception branches (off the happy path). RETURNING is transient (the drone is
  // flying the package home); the other two are terminal.
  | 'RETURNING'
  | 'DELIVERY_FAILED'
  | 'RETURNED_TO_BASE';

// Why a delivery ended as RETURNING / DELIVERY_FAILED / RETURNED_TO_BASE; null on
// the happy path. Mirrors the backend DeliveryFailureReason enum.
export type DeliveryFailureReason =
  | 'RECIPIENT_UNAVAILABLE'
  | 'WEATHER_ABORT'
  | 'UNSAFE_DROP_ZONE'
  | 'MECHANICAL'
  | 'ADMIN_ABORT'
  | 'OTHER';

export interface ApiDelivery {
  id: string;
  trackingId: string;
  userId: string;
  status: DeliveryStatus;
  // Set on an exception outcome (RETURNING/DELIVERY_FAILED/RETURNED_TO_BASE); null
  // on the happy path.
  failureReason: DeliveryFailureReason | null;
  fromAddress: string;
  toAddress: string;
  fromLat: number | null;
  fromLng: number | null;
  toLat: number | null;
  toLng: number | null;
  receiver: string;
  packages: string;
  packageSize: string;
  packageWeight: number;
  packageTypes: string[];
  pickupDate: string;
  pickupTime: string;
  estimatedDelivery: string | null;
  estimatedPrice: number;
  createdAt: string;
  updatedAt: string;
  tracking?: ApiDeliveryTracking | null;
  workflowSteps?: ApiWorkflowStepCompletion[];
  payment?: ApiPayment | null;
  proofOfDelivery?: ApiProofOfDelivery | null;
}

export interface ApiProofOfDelivery {
  id: string;
  deliveryId: string;
  photoUrl: string;
  recipientName: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  capturedAt: string;
}

/**
 * The shape POST /deliveries returns — ApiDelivery PLUS the plaintext 6-digit
 * handoff code, which the API returns EXACTLY ONCE (never persisted, never
 * returned on any later read). Distinct from ApiDelivery so read paths can't
 * accidentally expect a code that isn't there.
 */
export interface ApiCreatedDelivery extends ApiDelivery {
  handoffCode: string;
}

export interface ApiDeliveryTracking {
  id: string;
  deliveryId: string;
  droneLat: number | null;
  droneLng: number | null;
  droneStatus: string | null;
  routeJson: unknown | null;
  eta: string | null;
}

export interface CreateDeliveryDto {
  fromAddress: string;
  toAddress: string;
  receiver: string;
  packages: string;
  packageSize: string;
  packageWeight: number;
  packageTypes: string[];
  pickupDate: string;
  pickupTime: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}

export interface DeliveryQueryParams {
  page?: number;
  limit?: number;
  status?: 'current' | 'completed' | 'canceled';
  q?: string;
  sort?: 'recent' | 'title' | 'status';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Pricing ====================

export interface EstimatePriceDto {
  fromAddress?: string;
  toAddress?: string;
  packageSize: string;
  packageWeight: number;
  packageTypes: string[];
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}

export interface PriceEstimate {
  baseFee: number;
  sizeFee: number;
  weightFee: number;
  typeFee: number;
  distanceKm: number;
  distanceFee: number;
  total: number;
}

// ==================== Workflows ====================

export interface ApiWorkflowStep {
  id: string;
  type: 'checklist' | 'qr_display' | 'qr_scan' | 'instruction' | 'drone_button' | 'status_check';
  title: string;
  instruction: string;
  nextLabel: string;
  items?: { id: string; label: string }[];
  hint?: string;
  icon?: string;
  iconColor?: string;
  indicator?: { label: string; color: string; description: string };
}

export interface ApiWorkflow {
  id: string;
  title: string;
  subtitle: string;
  steps: ApiWorkflowStep[];
}

export interface ApiWorkflowStepCompletion {
  id: string;
  deliveryId: string;
  workflowId: string;
  stepId: string;
  completedAt: string;
}

// ==================== Payments ====================

export interface ApiPaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  network: string;
  last4: string;
  holderName: string;
  expiry: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ApiPayment {
  id: string;
  deliveryId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

// ==================== Notifications ====================

export interface ApiNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: unknown | null;
  read: boolean;
  createdAt: string;
}

// ==================== Support ====================

export interface ApiFaq {
  id: string;
  question: string;
  answer: string;
}

// ==================== User Stats ====================

export interface UserStats {
  total: number;
  active: number;
  completed: number;
}

// ==================== Geo ====================

export interface GeoCodeResult {
  data: { lat: number; lng: number } | null;
}

export interface ReverseGeoResult {
  data: string | null;
}

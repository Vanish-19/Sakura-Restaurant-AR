import swaggerJsdoc from 'swagger-jsdoc';

const API_PREFIX = '/api/v1';
const OBJECT_ID_PATTERN = '^[0-9a-fA-F]{24}$';

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const clean = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null),
  );

const jsonRequest = (schema) => ({
  required: true,
  content: {
    'application/json': { schema },
  },
});

const multipartRequest = (schema) => ({
  required: true,
  content: {
    'multipart/form-data': { schema },
  },
});

const jsonResponse = (description, schema) =>
  clean({
    description,
    content: schema
      ? {
          'application/json': { schema },
        }
      : undefined,
  });

const redirectResponse = (description) => ({
  description,
});

const envelope = (dataSchema, extraProperties = {}) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: 'Success' },
    data: dataSchema,
    ...extraProperties,
  },
});

const listEnvelope = (itemSchema) =>
  envelope(
    {
      type: 'array',
      items: itemSchema,
    },
    {
      count: { type: 'integer', example: 1 },
    },
  );

const objectIdParam = (name = 'id', description = 'MongoDB ObjectId') => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: {
    type: 'string',
    pattern: OBJECT_ID_PATTERN,
    example: '665f3f3a64c3f1d61f0f1a11',
  },
});

const pathParam = (name, description, example) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: {
    type: 'string',
    example,
  },
});

const queryParam = (name, schema, description) => ({
  name,
  in: 'query',
  required: false,
  description,
  schema,
});

const errorResponse = (description) => jsonResponse(description, ref('ApiError'));

const commonErrorResponses = {
  400: errorResponse('Bad request or validation error'),
  401: errorResponse('Missing or invalid token'),
  403: errorResponse('Permission denied'),
  404: errorResponse('Resource not found'),
  409: errorResponse('Conflict'),
  429: errorResponse('Rate limit exceeded'),
  500: errorResponse('Internal server error'),
};

const operation = ({
  tags,
  summary,
  description,
  operationId,
  security,
  parameters,
  requestBody,
  responses,
}) =>
  clean({
    tags,
    summary,
    description,
    operationId,
    security,
    parameters,
    requestBody,
    responses: {
      ...responses,
      ...commonErrorResponses,
    },
  });

const adminSecurity = [{ AdminBearerAuth: [] }];
const userSecurity = [{ UserBearerAuth: [] }];
const tableSecurity = [{ TableSessionBearerAuth: [] }];

const orderStatusSchema = {
  type: 'string',
  enum: ['pending', 'cooking', 'served', 'ready', 'picked_up', 'paid', 'cancelled'],
};

const orderItemStatusSchema = {
  type: 'string',
  enum: ['pending', 'cooking', 'ready', 'served', 'cancelled'],
};

const configuredServerUrl = String(
  process.env.BACKEND_PUBLIC_URL ||
    process.env.API_PUBLIC_URL ||
    process.env.SERVER_PUBLIC_URL ||
    '',
).trim().replace(/\/$/, '');

const swaggerServers = [
  {
    url: '/',
    description: 'Same origin as the API docs page',
  },
  {
    url: configuredServerUrl || `http://localhost:${process.env.PORT || 3000}`,
    description: configuredServerUrl ? 'Configured backend public URL' : 'Local development server',
  },
];

const createOrderBody = ref('CreateOrderRequest');
const createTakeawayBody = ref('CreateTakeawayOrderRequest');
const updateStatusBody = {
  type: 'object',
  required: ['status'],
  properties: {
    status: orderStatusSchema,
  },
};

const uploadModelBody = {
  type: 'object',
  required: ['model'],
  properties: {
    model: {
      type: 'string',
      format: 'binary',
      description: '.glb or .usdz file, max 10MB',
    },
  },
};

const uploadArticleImageBody = {
  type: 'object',
  required: ['image'],
  properties: {
    image: {
      type: 'string',
      format: 'binary',
      description: 'Image file, max 5MB',
    },
  },
};

const careerApplicationBody = {
  type: 'object',
  required: ['fullName', 'email', 'phone', 'position', 'workType', 'experience', 'referralSource'],
  properties: {
    fullName: { type: 'string', example: 'Nguyen Van A' },
    email: { type: 'string', format: 'email', example: 'applicant@example.com' },
    phone: { type: 'string', example: '0900000000' },
    birthDate: { type: 'string', format: 'date', example: '1998-01-15' },
    address: { type: 'string' },
    nationality: { type: 'string' },
    linkedIn: { type: 'string' },
    position: { type: 'string', example: 'Service Staff' },
    workType: { type: 'string', enum: ['full-time', 'part-time'] },
    experience: { type: 'string', example: '1-2 years' },
    expectedSalary: { type: 'string' },
    availableStartDate: { type: 'string', format: 'date' },
    referralSource: { type: 'string', example: 'Website' },
    coverLetter: { type: 'string', maxLength: 1000 },
    resume: {
      type: 'string',
      format: 'binary',
      description: 'PDF, DOC, or DOCX file, max 5MB',
    },
    introductionLetter: {
      type: 'string',
      format: 'binary',
      description: 'Optional PDF, DOC, or DOCX file, max 5MB',
    },
  },
};

const paths = {
  [`${API_PREFIX}/tables/scan`]: {
    post: operation({
      tags: ['Tables'],
      summary: 'Start a table session from a QR hash',
      requestBody: jsonRequest(ref('ScanTableRequest')),
      responses: {
        200: jsonResponse('Table session started', envelope(ref('TableSessionResponse'))),
      },
    }),
  },

  [`${API_PREFIX}/menu/items`]: {
    get: operation({
      tags: ['Menu'],
      summary: 'List available menu items',
      parameters: [
        queryParam('category', { type: 'string', example: 'Sushi' }, 'Filter by category name'),
      ],
      responses: {
        200: jsonResponse('Menu items fetched', listEnvelope(ref('MenuItem'))),
      },
    }),
  },

  [`${API_PREFIX}/menu/items/{id}`]: {
    get: operation({
      tags: ['Menu'],
      summary: 'Get a menu item by id',
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Menu item fetched', envelope(ref('MenuItem'))),
      },
    }),
  },

  [`${API_PREFIX}/orders`]: {
    post: operation({
      tags: ['Orders'],
      summary: 'Create a dine-in order for the current table session',
      security: tableSecurity,
      requestBody: jsonRequest(createOrderBody),
      responses: {
        201: jsonResponse('Order created', envelope(ref('Order'))),
      },
    }),
    get: operation({
      tags: ['Orders'],
      summary: 'List active dine-in orders for kitchen/admin',
      security: adminSecurity,
      parameters: [
        queryParam('status', orderStatusSchema, 'Optional order status filter'),
      ],
      responses: {
        200: jsonResponse('Active orders fetched', listEnvelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/orders/my`]: {
    get: operation({
      tags: ['Orders'],
      summary: 'List orders for the current table session',
      security: tableSecurity,
      responses: {
        200: jsonResponse('Table orders fetched', listEnvelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/orders/{id}/status`]: {
    patch: operation({
      tags: ['Orders'],
      summary: 'Update a dine-in order status',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest({
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['pending', 'cooking', 'served', 'paid'] },
        },
      }),
      responses: {
        200: jsonResponse('Order status updated', envelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/reservations`]: {
    post: operation({
      tags: ['Reservations'],
      summary: 'Create a public table reservation',
      requestBody: jsonRequest(ref('CreateReservationRequest')),
      responses: {
        201: jsonResponse('Reservation created', envelope(ref('Reservation'))),
      },
    }),
  },

  [`${API_PREFIX}/takeaway/orders`]: {
    post: operation({
      tags: ['Takeaway'],
      summary: 'Create a takeaway or delivery order',
      security: userSecurity,
      requestBody: jsonRequest(createTakeawayBody),
      responses: {
        201: jsonResponse('Takeaway order created', envelope(ref('Order'))),
      },
    }),
    get: operation({
      tags: ['Takeaway'],
      summary: 'List current user takeaway orders',
      security: userSecurity,
      parameters: [
        queryParam('phone', { type: 'string', example: '0900000000' }, 'Optional phone filter'),
      ],
      responses: {
        200: jsonResponse('Takeaway orders fetched', listEnvelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/takeaway/orders/{id}`]: {
    get: operation({
      tags: ['Takeaway'],
      summary: 'Get a takeaway order by id',
      security: userSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Takeaway order fetched', envelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/takeaway/orders/{id}/cancel`]: {
    patch: operation({
      tags: ['Takeaway'],
      summary: 'Cancel a current user takeaway order',
      security: userSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('CancelOrderRequest')),
      responses: {
        200: jsonResponse('Takeaway order cancelled', envelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/auth/register`]: {
    post: operation({
      tags: ['User Auth'],
      summary: 'Register a customer account',
      requestBody: jsonRequest(ref('RegisterUserRequest')),
      responses: {
        201: jsonResponse('User registered', envelope(ref('UserAuthPayload'))),
      },
    }),
  },

  [`${API_PREFIX}/auth/login`]: {
    post: operation({
      tags: ['User Auth'],
      summary: 'Login with email or phone and password',
      requestBody: jsonRequest(ref('LoginUserRequest')),
      responses: {
        200: jsonResponse('User logged in', envelope(ref('UserAuthPayload'))),
      },
    }),
  },

  [`${API_PREFIX}/auth/phone-token`]: {
    post: operation({
      tags: ['User Auth'],
      summary: 'Issue a customer token from phone number',
      requestBody: jsonRequest(ref('PhoneTokenRequest')),
      responses: {
        200: jsonResponse('Phone token issued', envelope(ref('UserAuthPayload'))),
      },
    }),
  },

  [`${API_PREFIX}/auth/google`]: {
    get: operation({
      tags: ['User Auth'],
      summary: 'Start Google OAuth flow',
      parameters: [
        queryParam('redirect', { type: 'string', example: '/cart' }, 'Frontend path after OAuth'),
      ],
      responses: {
        302: redirectResponse('Redirects to Google OAuth'),
      },
    }),
  },

  [`${API_PREFIX}/auth/google/callback`]: {
    get: operation({
      tags: ['User Auth'],
      summary: 'Google OAuth callback',
      parameters: [
        queryParam('code', { type: 'string' }, 'Google authorization code'),
        queryParam('state', { type: 'string' }, 'Signed OAuth state'),
      ],
      responses: {
        302: redirectResponse('Redirects back to frontend OAuth callback'),
      },
    }),
  },

  [`${API_PREFIX}/auth/refresh`]: {
    post: operation({
      tags: ['User Auth'],
      summary: 'Refresh customer tokens',
      requestBody: jsonRequest(ref('RefreshTokenRequest')),
      responses: {
        200: jsonResponse('User token refreshed', envelope(ref('UserAuthPayload'))),
      },
    }),
  },

  [`${API_PREFIX}/auth/me`]: {
    get: operation({
      tags: ['User Auth'],
      summary: 'Get current customer profile',
      security: userSecurity,
      responses: {
        200: jsonResponse('Current user fetched', envelope(ref('User'))),
      },
    }),
  },

  [`${API_PREFIX}/auth/logout`]: {
    post: operation({
      tags: ['User Auth'],
      summary: 'Logout current customer',
      security: userSecurity,
      responses: {
        200: jsonResponse('User logged out', ref('GenericSuccess')),
      },
    }),
  },

  [`${API_PREFIX}/user/orders/history`]: {
    get: operation({
      tags: ['User Orders'],
      summary: 'List current customer order history',
      security: userSecurity,
      responses: {
        200: jsonResponse('Order history fetched', listEnvelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/user/orders/{id}/cancel`]: {
    patch: operation({
      tags: ['User Orders'],
      summary: 'Cancel a current customer order',
      security: userSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('CancelOrderRequest')),
      responses: {
        200: jsonResponse('Order cancelled', envelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/careers/applications`]: {
    post: operation({
      tags: ['Careers'],
      summary: 'Submit a career application',
      requestBody: multipartRequest(careerApplicationBody),
      responses: {
        201: jsonResponse('Career application submitted', envelope(ref('CareerApplicationResult'))),
      },
    }),
  },

  [`${API_PREFIX}/static-pages/public/{slug}`]: {
    get: operation({
      tags: ['Static Pages'],
      summary: 'Get public static page content',
      parameters: [pathParam('slug', 'Static page slug', 'about')],
      responses: {
        200: jsonResponse('Static page fetched', envelope(ref('StaticPage'))),
      },
    }),
  },

  [`${API_PREFIX}/static-pages/admin`]: {
    get: operation({
      tags: ['Static Pages'],
      summary: 'List static pages for admin editing',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Static pages fetched', listEnvelope(ref('StaticPage'))),
      },
    }),
  },

  [`${API_PREFIX}/static-pages/admin/{slug}`]: {
    patch: operation({
      tags: ['Static Pages'],
      summary: 'Update static page content',
      security: adminSecurity,
      parameters: [pathParam('slug', 'Static page slug', 'privacy-policy')],
      requestBody: jsonRequest(ref('UpdateStaticPageRequest')),
      responses: {
        200: jsonResponse('Static page updated', envelope(ref('StaticPage'))),
      },
    }),
  },

  [`${API_PREFIX}/articles`]: {
    get: operation({
      tags: ['Articles'],
      summary: 'List published articles',
      responses: {
        200: jsonResponse('Published articles fetched', listEnvelope(ref('Article'))),
      },
    }),
  },

  [`${API_PREFIX}/articles/{id}`]: {
    get: operation({
      tags: ['Articles'],
      summary: 'Get a published article by id',
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Published article fetched', envelope(ref('Article'))),
      },
    }),
  },

  [`${API_PREFIX}/chat`]: {
    post: operation({
      tags: ['Chat'],
      summary: 'Send a message to the AI restaurant assistant',
      requestBody: jsonRequest(ref('ChatRequest')),
      responses: {
        200: jsonResponse('Chat response returned', envelope(ref('ChatResponse'))),
      },
    }),
  },

  [`${API_PREFIX}/loyalty/vouchers`]: {
    get: operation({
      tags: ['Loyalty'],
      summary: 'List public reward vouchers',
      responses: {
        200: jsonResponse('Reward vouchers fetched', listEnvelope(ref('RewardVoucher'))),
      },
    }),
  },

  [`${API_PREFIX}/loyalty/preview`]: {
    post: operation({
      tags: ['Loyalty'],
      summary: 'Preview loyalty points for a phone and subtotal',
      requestBody: jsonRequest(ref('PreviewLoyaltyRequest')),
      responses: {
        200: jsonResponse('Loyalty preview returned', envelope(ref('LoyaltyPreview'))),
      },
    }),
  },

  [`${API_PREFIX}/loyalty/me`]: {
    get: operation({
      tags: ['Loyalty'],
      summary: 'Get current customer loyalty profile',
      security: userSecurity,
      responses: {
        200: jsonResponse('Loyalty profile fetched', envelope(ref('LoyaltyProfile'))),
      },
    }),
  },

  [`${API_PREFIX}/payments/sepay/return`]: {
    get: operation({
      tags: ['Payments'],
      summary: 'Handle SePay return redirect',
      parameters: [
        queryParam('status', { type: 'string' }, 'SePay return status'),
        queryParam('orderCode', { type: 'string' }, 'Provider order code'),
      ],
      responses: {
        302: redirectResponse('Redirects back to the frontend cart/payment page'),
      },
    }),
  },

  [`${API_PREFIX}/payments/sepay/webhook`]: {
    post: operation({
      tags: ['Payments'],
      summary: 'Receive SePay payment webhook',
      description: 'Consumes provider webhook payloads and updates matching payments/orders.',
      requestBody: jsonRequest(ref('SepayWebhookRequest')),
      responses: {
        200: jsonResponse('Webhook accepted or acknowledged', ref('SepayWebhookResponse')),
        400: errorResponse('Webhook rejected'),
      },
    }),
  },

  [`${API_PREFIX}/admin/auth/login`]: {
    post: operation({
      tags: ['Admin Auth'],
      summary: 'Login admin account',
      requestBody: jsonRequest(ref('AdminLoginRequest')),
      responses: {
        200: jsonResponse('Admin logged in', envelope(ref('AdminAuthPayload'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/auth/register`]: {
    post: operation({
      tags: ['Admin Auth'],
      summary: 'Create an admin account',
      security: adminSecurity,
      requestBody: jsonRequest(ref('AdminRegisterRequest')),
      responses: {
        201: jsonResponse('Admin account created', envelope(ref('Admin'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/auth/refresh`]: {
    post: operation({
      tags: ['Admin Auth'],
      summary: 'Refresh admin tokens',
      requestBody: jsonRequest(ref('RefreshTokenRequest')),
      responses: {
        200: jsonResponse('Admin token refreshed', envelope(ref('AdminAuthPayload'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/auth/logout`]: {
    post: operation({
      tags: ['Admin Auth'],
      summary: 'Logout current admin',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Admin logged out', ref('GenericSuccess')),
      },
    }),
  },

  [`${API_PREFIX}/admin/dashboard/stats`]: {
    get: operation({
      tags: ['Admin Dashboard'],
      summary: 'Get admin dashboard stats',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Dashboard stats fetched', envelope(ref('DashboardStats'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/orders/stats`]: {
    get: operation({
      tags: ['Admin Orders'],
      summary: 'Get admin order statistics',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Order stats fetched', envelope(ref('OrderStats'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/orders`]: {
    get: operation({
      tags: ['Admin Orders'],
      summary: 'List orders',
      security: adminSecurity,
      parameters: [
        queryParam('status', orderStatusSchema, 'Filter by status'),
        queryParam('order_type', { type: 'string', enum: ['dine_in', 'takeaway'] }, 'Filter by order type'),
        queryParam('order_id', { type: 'string' }, 'Search by order id/code'),
        queryParam('page', { type: 'integer', minimum: 1, default: 1 }, 'Page number'),
        queryParam('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Page size'),
      ],
      responses: {
        200: jsonResponse('Orders fetched', listEnvelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/orders/{id}`]: {
    get: operation({
      tags: ['Admin Orders'],
      summary: 'Get an order by id',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Order fetched', envelope(ref('Order'))),
      },
    }),
    patch: operation({
      tags: ['Admin Orders'],
      summary: 'Update an order status',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(updateStatusBody),
      responses: {
        200: jsonResponse('Order updated', envelope(ref('Order'))),
      },
    }),
    delete: operation({
      tags: ['Admin Orders'],
      summary: 'Hard delete an order',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Order deleted', ref('GenericSuccess')),
      },
    }),
  },

  [`${API_PREFIX}/admin/orders/{id}/items/{itemId}/status`]: {
    patch: operation({
      tags: ['Admin Orders'],
      summary: 'Update a single order item status',
      security: adminSecurity,
      parameters: [
        objectIdParam('id', 'Order id'),
        objectIdParam('itemId', 'Order item id'),
      ],
      requestBody: jsonRequest({
        type: 'object',
        required: ['status'],
        properties: {
          status: orderItemStatusSchema,
        },
      }),
      responses: {
        200: jsonResponse('Order item status updated', envelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/orders/{id}/cancel`]: {
    patch: operation({
      tags: ['Admin Orders'],
      summary: 'Cancel an order',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('CancelOrderRequest')),
      responses: {
        200: jsonResponse('Order cancelled', envelope(ref('Order'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/tables`]: {
    get: operation({
      tags: ['Admin Tables'],
      summary: 'List restaurant tables',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Tables fetched', listEnvelope(ref('Table'))),
      },
    }),
    post: operation({
      tags: ['Admin Tables'],
      summary: 'Create a restaurant table',
      security: adminSecurity,
      requestBody: jsonRequest(ref('CreateTableRequest')),
      responses: {
        201: jsonResponse('Table created', envelope(ref('Table'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/tables/{id}`]: {
    patch: operation({
      tags: ['Admin Tables'],
      summary: 'Update a restaurant table',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('UpdateTableRequest')),
      responses: {
        200: jsonResponse('Table updated', envelope(ref('Table'))),
      },
    }),
    delete: operation({
      tags: ['Admin Tables'],
      summary: 'Delete a restaurant table',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Table deleted', ref('GenericSuccess')),
      },
    }),
  },

  [`${API_PREFIX}/admin/tables/{id}/reservations`]: {
    get: operation({
      tags: ['Admin Tables'],
      summary: 'List reservations for a table',
      security: adminSecurity,
      parameters: [objectIdParam('id', 'Table id')],
      responses: {
        200: jsonResponse('Table reservations fetched', listEnvelope(ref('Reservation'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/tables/{id}/reservations/{reservationId}/status`]: {
    patch: operation({
      tags: ['Admin Tables'],
      summary: 'Update a table reservation status',
      security: adminSecurity,
      parameters: [
        objectIdParam('id', 'Table id'),
        objectIdParam('reservationId', 'Reservation id'),
      ],
      requestBody: jsonRequest({
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['seated', 'completed', 'cancelled', 'no_show'] },
        },
      }),
      responses: {
        200: jsonResponse('Reservation status updated', envelope(ref('Reservation'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/tables/{id}/reset`]: {
    post: operation({
      tags: ['Admin Tables'],
      summary: 'Reset a table after service',
      security: adminSecurity,
      parameters: [objectIdParam('id', 'Table id')],
      responses: {
        200: jsonResponse('Table reset', envelope(ref('Table'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/payments`]: {
    get: operation({
      tags: ['Admin Payments'],
      summary: 'List payments',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Payments fetched', listEnvelope(ref('Payment'))),
      },
    }),
    post: operation({
      tags: ['Admin Payments'],
      summary: 'Create a payment for an order',
      security: adminSecurity,
      requestBody: jsonRequest(ref('CreatePaymentRequest')),
      responses: {
        201: jsonResponse('Payment created', envelope(ref('Payment'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/payments/{orderId}`]: {
    get: operation({
      tags: ['Admin Payments'],
      summary: 'Get a payment by order id',
      security: adminSecurity,
      parameters: [objectIdParam('orderId', 'Order id')],
      responses: {
        200: jsonResponse('Payment fetched', envelope(ref('Payment'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/payments/{id}/refund`]: {
    post: operation({
      tags: ['Admin Payments'],
      summary: 'Refund a payment',
      security: adminSecurity,
      parameters: [objectIdParam('id', 'Payment id')],
      responses: {
        200: jsonResponse('Payment refunded', envelope(ref('Payment'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/payments/{id}/confirm-cod`]: {
    post: operation({
      tags: ['Admin Payments'],
      summary: 'Confirm cash-on-delivery payment',
      security: adminSecurity,
      parameters: [objectIdParam('id', 'Payment id')],
      responses: {
        200: jsonResponse('COD payment confirmed', envelope(ref('Payment'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/foods`]: {
    get: operation({
      tags: ['Admin Foods'],
      summary: 'List all foods',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Foods fetched', listEnvelope(ref('MenuItem'))),
      },
    }),
    post: operation({
      tags: ['Admin Foods'],
      summary: 'Create a food/menu item',
      security: adminSecurity,
      requestBody: jsonRequest(ref('CreateFoodRequest')),
      responses: {
        201: jsonResponse('Food created', envelope(ref('MenuItem'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/foods/upload-model`]: {
    post: operation({
      tags: ['Admin Foods'],
      summary: 'Upload a 3D model for AR food preview',
      security: adminSecurity,
      requestBody: multipartRequest(uploadModelBody),
      responses: {
        200: jsonResponse('Model uploaded', envelope(ref('UploadedAsset'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/foods/{id}`]: {
    get: operation({
      tags: ['Admin Foods'],
      summary: 'Get a food/menu item by id',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Food fetched', envelope(ref('MenuItem'))),
      },
    }),
    patch: operation({
      tags: ['Admin Foods'],
      summary: 'Update a food/menu item',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('UpdateFoodRequest')),
      responses: {
        200: jsonResponse('Food updated', envelope(ref('MenuItem'))),
      },
    }),
    delete: operation({
      tags: ['Admin Foods'],
      summary: 'Delete a food/menu item',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Food deleted', ref('GenericSuccess')),
      },
    }),
  },

  [`${API_PREFIX}/admin/food-categories`]: {
    get: operation({
      tags: ['Admin Food Categories'],
      summary: 'List food categories',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Food categories fetched', listEnvelope(ref('FoodCategory'))),
      },
    }),
    post: operation({
      tags: ['Admin Food Categories'],
      summary: 'Create a food category',
      security: adminSecurity,
      requestBody: jsonRequest(ref('FoodCategoryRequest')),
      responses: {
        201: jsonResponse('Food category created', envelope(ref('FoodCategory'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/food-categories/{id}`]: {
    get: operation({
      tags: ['Admin Food Categories'],
      summary: 'Get a food category by id',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Food category fetched', envelope(ref('FoodCategory'))),
      },
    }),
    patch: operation({
      tags: ['Admin Food Categories'],
      summary: 'Update a food category',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('FoodCategoryRequest')),
      responses: {
        200: jsonResponse('Food category updated', envelope(ref('FoodCategory'))),
      },
    }),
    delete: operation({
      tags: ['Admin Food Categories'],
      summary: 'Delete a food category',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('DeleteFoodCategoryRequest')),
      responses: {
        200: jsonResponse('Food category deleted', ref('GenericSuccess')),
      },
    }),
  },

  [`${API_PREFIX}/admin/articles/stats`]: {
    get: operation({
      tags: ['Admin Articles'],
      summary: 'Get article statistics',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Article stats fetched', envelope(ref('ArticleStats'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/articles`]: {
    get: operation({
      tags: ['Admin Articles'],
      summary: 'List all articles',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Articles fetched', listEnvelope(ref('Article'))),
      },
    }),
    post: operation({
      tags: ['Admin Articles'],
      summary: 'Create an article',
      security: adminSecurity,
      requestBody: jsonRequest(ref('CreateArticleRequest')),
      responses: {
        201: jsonResponse('Article created', envelope(ref('Article'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/articles/upload-image`]: {
    post: operation({
      tags: ['Admin Articles'],
      summary: 'Upload an article image',
      security: adminSecurity,
      requestBody: multipartRequest(uploadArticleImageBody),
      responses: {
        200: jsonResponse('Image uploaded', envelope(ref('UploadedAsset'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/articles/{id}`]: {
    get: operation({
      tags: ['Admin Articles'],
      summary: 'Get an article by id',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Article fetched', envelope(ref('Article'))),
      },
    }),
    patch: operation({
      tags: ['Admin Articles'],
      summary: 'Update an article',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('UpdateArticleRequest')),
      responses: {
        200: jsonResponse('Article updated', envelope(ref('Article'))),
      },
    }),
    delete: operation({
      tags: ['Admin Articles'],
      summary: 'Delete an article',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Article deleted', ref('GenericSuccess')),
      },
    }),
  },

  [`${API_PREFIX}/admin/users/stats`]: {
    get: operation({
      tags: ['Admin Users'],
      summary: 'Get customer statistics',
      security: adminSecurity,
      responses: {
        200: jsonResponse('User stats fetched', envelope(ref('UserStats'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/users`]: {
    get: operation({
      tags: ['Admin Users'],
      summary: 'List customers',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Users fetched', listEnvelope(ref('User'))),
      },
    }),
    post: operation({
      tags: ['Admin Users'],
      summary: 'Create a customer',
      security: adminSecurity,
      requestBody: jsonRequest(ref('CreateUserRequest')),
      responses: {
        201: jsonResponse('User created', envelope(ref('User'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/users/{id}`]: {
    get: operation({
      tags: ['Admin Users'],
      summary: 'Get a customer by id',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('User fetched', envelope(ref('User'))),
      },
    }),
    patch: operation({
      tags: ['Admin Users'],
      summary: 'Update a customer',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('UpdateUserRequest')),
      responses: {
        200: jsonResponse('User updated', envelope(ref('User'))),
      },
    }),
    delete: operation({
      tags: ['Admin Users'],
      summary: 'Delete a customer',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('User deleted', ref('GenericSuccess')),
      },
    }),
  },

  [`${API_PREFIX}/admin/accounts`]: {
    get: operation({
      tags: ['Admin Accounts'],
      summary: 'List admin accounts',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Admin accounts fetched', listEnvelope(ref('Admin'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/accounts/stats`]: {
    get: operation({
      tags: ['Admin Accounts'],
      summary: 'Get admin account statistics',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Admin account stats fetched', envelope(ref('AdminAccountStats'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/accounts/{id}`]: {
    get: operation({
      tags: ['Admin Accounts'],
      summary: 'Get an admin account by id',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Admin account fetched', envelope(ref('Admin'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/accounts/{id}/toggle-status`]: {
    patch: operation({
      tags: ['Admin Accounts'],
      summary: 'Toggle an admin account status',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Admin account status updated', envelope(ref('Admin'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/accounts/{id}/password`]: {
    patch: operation({
      tags: ['Admin Accounts'],
      summary: 'Reset an admin account password',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('ResetAdminPasswordRequest')),
      responses: {
        200: jsonResponse('Admin password reset', envelope(ref('Admin'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/ai-monitoring/overview`]: {
    get: operation({
      tags: ['Admin AI Monitoring'],
      summary: 'Get AI monitoring overview',
      security: adminSecurity,
      responses: {
        200: jsonResponse('AI monitoring overview fetched', envelope(ref('AiMonitoringOverview'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/loyalty/overview`]: {
    get: operation({
      tags: ['Admin Loyalty'],
      summary: 'Get loyalty overview',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Loyalty overview fetched', envelope(ref('LoyaltyOverview'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/loyalty/profiles`]: {
    get: operation({
      tags: ['Admin Loyalty'],
      summary: 'List loyalty profiles',
      security: adminSecurity,
      parameters: [
        queryParam('search', { type: 'string' }, 'Search by customer name or phone'),
      ],
      responses: {
        200: jsonResponse('Loyalty profiles fetched', listEnvelope(ref('LoyaltyProfile'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/loyalty/vouchers`]: {
    get: operation({
      tags: ['Admin Loyalty'],
      summary: 'List reward vouchers',
      security: adminSecurity,
      responses: {
        200: jsonResponse('Reward vouchers fetched', listEnvelope(ref('RewardVoucher'))),
      },
    }),
    post: operation({
      tags: ['Admin Loyalty'],
      summary: 'Create a reward voucher',
      security: adminSecurity,
      requestBody: jsonRequest(ref('RewardVoucherRequest')),
      responses: {
        201: jsonResponse('Reward voucher created', envelope(ref('RewardVoucher'))),
      },
    }),
  },

  [`${API_PREFIX}/admin/loyalty/vouchers/{id}`]: {
    patch: operation({
      tags: ['Admin Loyalty'],
      summary: 'Update a reward voucher',
      security: adminSecurity,
      parameters: [objectIdParam()],
      requestBody: jsonRequest(ref('UpdateRewardVoucherRequest')),
      responses: {
        200: jsonResponse('Reward voucher updated', envelope(ref('RewardVoucher'))),
      },
    }),
    delete: operation({
      tags: ['Admin Loyalty'],
      summary: 'Delete a reward voucher',
      security: adminSecurity,
      parameters: [objectIdParam()],
      responses: {
        200: jsonResponse('Reward voucher deleted', ref('GenericSuccess')),
      },
    }),
  },
};

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Sakura Restaurant API',
    version: process.env.npm_package_version || '1.0.0',
    description:
      'REST API documentation for the AR restaurant backend. Authenticated endpoints use JWT bearer tokens.',
  },
  servers: swaggerServers,
  tags: [
    { name: 'Tables', description: 'Table QR scan and session APIs' },
    { name: 'Menu', description: 'Public menu browsing APIs' },
    { name: 'Orders', description: 'Dine-in ordering APIs' },
    { name: 'Reservations', description: 'Public reservation APIs' },
    { name: 'Takeaway', description: 'Customer takeaway/delivery APIs' },
    { name: 'User Auth', description: 'Customer authentication APIs' },
    { name: 'User Orders', description: 'Customer order history APIs' },
    { name: 'Careers', description: 'Career application APIs' },
    { name: 'Static Pages', description: 'Static content APIs' },
    { name: 'Articles', description: 'Public blog article APIs' },
    { name: 'Chat', description: 'AI assistant APIs' },
    { name: 'Loyalty', description: 'Customer loyalty APIs' },
    { name: 'Payments', description: 'Public payment callback/webhook APIs' },
    { name: 'Admin Auth', description: 'Admin authentication APIs' },
    { name: 'Admin Dashboard', description: 'Admin dashboard APIs' },
    { name: 'Admin Orders', description: 'Admin order management APIs' },
    { name: 'Admin Tables', description: 'Admin table management APIs' },
    { name: 'Admin Payments', description: 'Admin payment management APIs' },
    { name: 'Admin Foods', description: 'Admin food/menu management APIs' },
    { name: 'Admin Food Categories', description: 'Admin food category APIs' },
    { name: 'Admin Articles', description: 'Admin content management APIs' },
    { name: 'Admin Users', description: 'Admin customer management APIs' },
    { name: 'Admin Accounts', description: 'Admin account management APIs' },
    { name: 'Admin AI Monitoring', description: 'AI monitoring APIs' },
    { name: 'Admin Loyalty', description: 'Admin loyalty management APIs' },
  ],
  components: {
    securitySchemes: {
      AdminBearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Admin JWT from /api/v1/admin/auth/login.',
      },
      UserBearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Customer JWT from /api/v1/auth/login, /register, or /phone-token.',
      },
      TableSessionBearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Table session JWT returned by /api/v1/tables/scan.',
      },
    },
    schemas: {
      ObjectId: {
        type: 'string',
        pattern: OBJECT_ID_PATTERN,
        example: '665f3f3a64c3f1d61f0f1a11',
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          error: { type: 'string', example: 'Validation error' },
          message: { type: 'string', example: 'Validation error' },
          details: {
            oneOf: [
              { type: 'array', items: { type: 'string' } },
              { type: 'object', additionalProperties: true },
            ],
          },
        },
      },
      GenericSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: ref('ObjectId'),
          name: { type: 'string', example: 'Nguyen Van A' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          phone: { type: 'string', example: '0900000000' },
          avatar: { type: 'string' },
          role: { type: 'string', example: 'Guest' },
          status: { type: 'string', example: 'Verified' },
          last_login: { type: 'string', format: 'date-time' },
        },
      },
      Admin: {
        type: 'object',
        properties: {
          id: ref('ObjectId'),
          username: { type: 'string', example: 'admin' },
          name: { type: 'string', example: 'Admin User' },
          email: { type: 'string', format: 'email', example: 'admin@example.com' },
          role: { type: 'string', enum: ['admin', 'super_admin'], example: 'admin' },
          status: { type: 'string', example: 'Active' },
        },
      },
      UserAuthPayload: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: ref('User'),
        },
      },
      AdminAuthPayload: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          admin: ref('Admin'),
        },
      },
      RegisterUserRequest: {
        type: 'object',
        required: ['name', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'Nguyen Van A' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          phone: { type: 'string', example: '0900000000' },
          password: { type: 'string', minLength: 6, example: 'secret123' },
        },
      },
      LoginUserRequest: {
        type: 'object',
        required: ['identity', 'password'],
        properties: {
          identity: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      PhoneTokenRequest: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string', example: '0900000000' },
          name: { type: 'string', example: 'Guest User' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', minLength: 10 },
        },
      },
      AdminLoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      AdminRegisterRequest: {
        type: 'object',
        required: ['username', 'password', 'name', 'email'],
        properties: {
          username: { type: 'string', example: 'newadmin' },
          password: { type: 'string', minLength: 6, example: 'secret123' },
          name: { type: 'string', example: 'New Admin' },
          email: { type: 'string', format: 'email', example: 'newadmin@example.com' },
          role: { type: 'string', enum: ['admin', 'super_admin'], default: 'admin' },
        },
      },
      ResetAdminPasswordRequest: {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string', minLength: 6, example: 'newSecret123' },
        },
      },
      Table: {
        type: 'object',
        properties: {
          _id: ref('ObjectId'),
          id: ref('ObjectId'),
          name: { type: 'string', example: 'Table 1' },
          qr_hash: { type: 'string', example: 'table-1-qr' },
          zone: { type: 'string', example: 'Main hall' },
          capacity: { type: 'integer', example: 4 },
          status: { type: 'string', enum: ['empty', 'dining', 'reserved'], example: 'empty' },
        },
      },
      ScanTableRequest: {
        type: 'object',
        required: ['qr_hash'],
        properties: {
          qr_hash: { type: 'string', example: 'table-1-qr' },
        },
      },
      TableSessionResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          session: {
            type: 'object',
            properties: {
              id: ref('ObjectId'),
              expires_at: { type: 'string', format: 'date-time' },
            },
          },
          table: ref('Table'),
        },
      },
      CreateTableRequest: {
        type: 'object',
        required: ['name', 'qr_hash'],
        properties: {
          name: { type: 'string', example: 'Table 1' },
          qr_hash: { type: 'string', example: 'table-1-qr' },
          zone: { type: 'string', example: 'Main hall' },
          capacity: { type: 'integer', minimum: 1, example: 4 },
        },
      },
      UpdateTableRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Table 1' },
          qr_hash: { type: 'string', example: 'table-1-qr' },
          zone: { type: 'string', example: 'Main hall' },
          capacity: { type: 'integer', minimum: 1, example: 4 },
          status: { type: 'string', enum: ['empty', 'dining', 'reserved'] },
        },
      },
      MenuItem: {
        type: 'object',
        properties: {
          id: ref('ObjectId'),
          _id: ref('ObjectId'),
          name: { type: 'string', example: 'Salmon Sushi' },
          description: { type: 'string' },
          price: { type: 'number', example: 120000 },
          category: { type: 'string', example: 'Sushi' },
          image_url: { type: 'string', example: 'https://example.com/sushi.jpg' },
          is_best_seller: { type: 'boolean', example: true },
          is_available: { type: 'boolean', example: true },
          ingredients: { type: 'array', items: { type: 'string' } },
          allergens: { type: 'array', items: { type: 'string' } },
          recommended_for: { type: 'array', items: { type: 'string' } },
          ar_models: {
            type: 'object',
            properties: {
              glb_url: { type: 'string' },
              usdz_url: { type: 'string' },
            },
          },
          assets: {
            type: 'object',
            properties: {
              image_url: { type: 'string' },
              ar_models: {
                type: 'object',
                properties: {
                  glb: { type: 'string' },
                  usdz: { type: 'string' },
                },
              },
            },
          },
        },
      },
      CreateFoodRequest: {
        type: 'object',
        required: ['name', 'price', 'category'],
        properties: {
          name: { type: 'string', example: 'Salmon Sushi' },
          description: { type: 'string' },
          price: { type: 'number', minimum: 0, example: 120000 },
          category: { type: 'string', example: 'Sushi' },
          image_url: { type: 'string' },
          ar_models: {
            type: 'object',
            properties: {
              glb_url: { type: 'string' },
              usdz_url: { type: 'string' },
            },
          },
          ingredients: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          allergens: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          recommended_for: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          is_best_seller: { type: 'boolean' },
          is_available: { type: 'boolean' },
        },
      },
      UpdateFoodRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Salmon Sushi' },
          description: { type: 'string' },
          price: { type: 'number', minimum: 0, example: 120000 },
          category: { type: 'string', example: 'Sushi' },
          image_url: { type: 'string' },
          ar_models: {
            type: 'object',
            properties: {
              glb_url: { type: 'string' },
              usdz_url: { type: 'string' },
            },
          },
          ingredients: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          allergens: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          recommended_for: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          is_best_seller: { type: 'boolean' },
          is_available: { type: 'boolean' },
        },
      },
      FoodCategory: {
        type: 'object',
        properties: {
          _id: ref('ObjectId'),
          id: ref('ObjectId'),
          name: { type: 'string', example: 'Sushi' },
        },
      },
      FoodCategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Sushi' },
        },
      },
      DeleteFoodCategoryRequest: {
        type: 'object',
        properties: {
          replacementName: { type: 'string', example: 'Main dishes' },
        },
      },
      UploadedAsset: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'https://res.cloudinary.com/demo/file.glb' },
          secure_url: { type: 'string' },
          public_id: { type: 'string' },
        },
      },
      OrderItemInput: {
        type: 'object',
        required: ['menu_item_id'],
        properties: {
          menu_item_id: ref('ObjectId'),
          quantity: { type: 'integer', minimum: 1, default: 1, example: 2 },
          note: { type: 'string', example: 'No wasabi' },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['items'],
        properties: {
          customer_phone: { type: 'string', example: '0900000000' },
          reward_voucher_id: ref('ObjectId'),
          items: {
            type: 'array',
            minItems: 1,
            items: ref('OrderItemInput'),
          },
        },
      },
      CreateTakeawayOrderRequest: {
        allOf: [
          ref('CreateOrderRequest'),
          {
            type: 'object',
            required: ['customer_name', 'customer_phone', 'delivery_address', 'items'],
            properties: {
              customer_name: { type: 'string', example: 'Nguyen Van A' },
              customer_phone: { type: 'string', example: '0900000000' },
              delivery_address: { type: 'string', example: 'District 1, HCMC' },
              payment_method: { type: 'string', enum: ['online', 'cod'], example: 'cod' },
            },
          },
        ],
      },
      Order: {
        type: 'object',
        properties: {
          _id: ref('ObjectId'),
          order_id: { type: 'string', example: 'ORD-20260523-001' },
          table: ref('ObjectId'),
          user: ref('ObjectId'),
          order_type: { type: 'string', enum: ['dine_in', 'takeaway'] },
          status: orderStatusSchema,
          payment_status: { type: 'string', example: 'pending' },
          customer_name: { type: 'string' },
          customer_phone: { type: 'string' },
          delivery_address: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: ref('ObjectId'),
                menu_item: ref('MenuItem'),
                quantity: { type: 'integer' },
                note: { type: 'string' },
                status: orderItemStatusSchema,
              },
            },
          },
          subtotal: { type: 'number', example: 240000 },
          total_amount: { type: 'number', example: 240000 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CancelOrderRequest: {
        type: 'object',
        properties: {
          cancel_reason: { type: 'string', example: 'Customer requested cancellation' },
          cancelled_by: { type: 'string', enum: ['user', 'admin', 'system'], example: 'user' },
        },
      },
      CreateReservationRequest: {
        type: 'object',
        required: ['customer_name', 'customer_phone', 'party_size', 'reservation_time'],
        properties: {
          table: ref('ObjectId'),
          customer_name: { type: 'string', example: 'Nguyen Van A' },
          customer_phone: { type: 'string', example: '0900000000' },
          customer_email: { type: 'string', format: 'email' },
          party_size: { type: 'integer', minimum: 1, example: 4 },
          reservation_time: { type: 'string', format: 'date-time' },
          expected_duration_minutes: { type: 'integer', minimum: 30, example: 90 },
          source: { type: 'string', enum: ['contact', 'ai', 'admin'] },
          note: { type: 'string', maxLength: 1000 },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          _id: ref('ObjectId'),
          table: ref('Table'),
          customer_name: { type: 'string' },
          customer_phone: { type: 'string' },
          customer_email: { type: 'string' },
          party_size: { type: 'integer' },
          reservation_time: { type: 'string', format: 'date-time' },
          status: { type: 'string', example: 'pending' },
          note: { type: 'string' },
        },
      },
      CreatePaymentRequest: {
        type: 'object',
        required: ['order_id', 'method'],
        properties: {
          order_id: ref('ObjectId'),
          method: { type: 'string', enum: ['online', 'cod'], example: 'cod' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          _id: ref('ObjectId'),
          order: ref('ObjectId'),
          amount: { type: 'number', example: 240000 },
          method: { type: 'string', enum: ['online', 'cod'] },
          status: { type: 'string', example: 'pending' },
          transaction_id: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SepayWebhookRequest: {
        type: 'object',
        additionalProperties: true,
        properties: {
          transferType: { type: 'string' },
          status: { type: 'string' },
          amount: { type: 'number' },
          transferContent: { type: 'string' },
        },
      },
      SepayWebhookResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          code: { type: 'string', example: '00' },
          message: { type: 'string', example: 'Confirm Success' },
        },
      },
      Article: {
        type: 'object',
        properties: {
          _id: ref('ObjectId'),
          title: { type: 'string', example: 'Sakura seasonal menu' },
          content: { type: 'string' },
          category: { type: 'string', example: 'News' },
          author: { type: 'string', example: 'Sakura Team' },
          image_url: { type: 'string' },
          is_published: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateArticleRequest: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', example: 'Sakura seasonal menu' },
          content: { type: 'string' },
          category: { type: 'string' },
          author: { type: 'string' },
          image_url: { type: 'string' },
          is_published: { type: 'boolean' },
        },
      },
      UpdateArticleRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Sakura seasonal menu' },
          content: { type: 'string' },
          category: { type: 'string' },
          author: { type: 'string' },
          image_url: { type: 'string' },
          is_published: { type: 'boolean' },
        },
      },
      StaticPage: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'privacy-policy' },
          label: { type: 'string', example: 'Privacy Policy' },
          content: { type: 'object', additionalProperties: true },
          updatedBy: ref('ObjectId'),
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UpdateStaticPageRequest: {
        type: 'object',
        properties: {
          label: { type: 'string', example: 'Privacy Policy' },
          content: { type: 'object', additionalProperties: true },
        },
      },
      ChatRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', minLength: 1, maxLength: 500, example: 'Book a table for 4 tonight' },
          conversationId: { type: 'string', maxLength: 120 },
          currentPath: { type: 'string', maxLength: 200, example: '/contact' },
        },
      },
      ChatResponse: {
        type: 'object',
        additionalProperties: true,
        properties: {
          reply: { type: 'string' },
          conversationId: { type: 'string' },
        },
      },
      PreviewLoyaltyRequest: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string', example: '0900000000' },
          subtotal: { type: 'number', minimum: 0, default: 0, example: 240000 },
        },
      },
      LoyaltyPreview: {
        type: 'object',
        additionalProperties: true,
        properties: {
          phone: { type: 'string' },
          pointsEarned: { type: 'integer' },
          availableVouchers: { type: 'array', items: ref('RewardVoucher') },
        },
      },
      LoyaltyProfile: {
        type: 'object',
        properties: {
          _id: ref('ObjectId'),
          user: ref('User'),
          phone: { type: 'string' },
          points: { type: 'integer', example: 120 },
          tier: { type: 'string', example: 'silver' },
        },
      },
      RewardVoucher: {
        type: 'object',
        properties: {
          _id: ref('ObjectId'),
          code: { type: 'string', example: 'SAKURA10' },
          title: { type: 'string', example: '10% discount' },
          description: { type: 'string' },
          points_cost: { type: 'integer', example: 100 },
          discount_type: { type: 'string', enum: ['fixed_amount', 'percentage'] },
          discount_value: { type: 'number', example: 10 },
          min_order_amount: { type: 'number', example: 0 },
          max_discount_amount: { type: 'number', example: 50000 },
          quantity: { type: 'integer', example: 50 },
          is_active: { type: 'boolean', example: true },
          expires_at: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      RewardVoucherRequest: {
        type: 'object',
        required: ['code', 'title', 'points_cost', 'discount_type', 'discount_value'],
        properties: {
          code: { type: 'string', minLength: 2, example: 'SAKURA10' },
          title: { type: 'string', example: '10% discount' },
          description: { type: 'string', default: '' },
          points_cost: { type: 'integer', minimum: 1, example: 100 },
          discount_type: { type: 'string', enum: ['fixed_amount', 'percentage'] },
          discount_value: { type: 'number', minimum: 1, example: 10 },
          min_order_amount: { type: 'number', minimum: 0, default: 0 },
          max_discount_amount: { type: 'number', minimum: 0, default: 0 },
          quantity: { type: 'integer', minimum: 0, default: 0 },
          is_active: { type: 'boolean', default: true },
          expires_at: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      UpdateRewardVoucherRequest: {
        type: 'object',
        properties: {
          code: { type: 'string', minLength: 2, example: 'SAKURA10' },
          title: { type: 'string', example: '10% discount' },
          description: { type: 'string', default: '' },
          points_cost: { type: 'integer', minimum: 1, example: 100 },
          discount_type: { type: 'string', enum: ['fixed_amount', 'percentage'] },
          discount_value: { type: 'number', minimum: 1, example: 10 },
          min_order_amount: { type: 'number', minimum: 0, default: 0 },
          max_discount_amount: { type: 'number', minimum: 0, default: 0 },
          quantity: { type: 'integer', minimum: 0, default: 0 },
          is_active: { type: 'boolean', default: true },
          expires_at: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'Nguyen Van A' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          role: { type: 'string', example: 'Guest' },
          status: { type: 'string', example: 'Verified' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Nguyen Van A' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          role: { type: 'string', example: 'Guest' },
          status: { type: 'string', example: 'Verified' },
        },
      },
      CareerApplicationResult: {
        type: 'object',
        properties: {
          id: ref('ObjectId'),
          position: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      DashboardStats: {
        type: 'object',
        additionalProperties: true,
      },
      OrderStats: {
        type: 'object',
        additionalProperties: true,
      },
      ArticleStats: {
        type: 'object',
        additionalProperties: true,
      },
      UserStats: {
        type: 'object',
        additionalProperties: true,
      },
      AdminAccountStats: {
        type: 'object',
        additionalProperties: true,
      },
      AiMonitoringOverview: {
        type: 'object',
        additionalProperties: true,
      },
      LoyaltyOverview: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
  paths,
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js'],
});

export const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'Sakura Restaurant API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    tagsSorter: 'alpha',
    operationsSorter: 'method',
  },
};

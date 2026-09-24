import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Community Organization API',
      version: '1.0.0',
      description:
        'Production REST API for a community organization website.\n\n**Working Together. Growing Together. Winning Together.**',
      contact: { name: 'API Support', email: 'support@example.com' },
    },
    servers: [{ url: '/', description: 'API Server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'API health check' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Registrations', description: 'Public user registration' },
      { name: 'Posts', description: 'Public posts' },
      { name: 'Contact', description: 'Contact form' },
      { name: 'Admin - Dashboard', description: 'Admin dashboard statistics' },
      { name: 'Admin - Registrations', description: 'Registration management' },
      { name: 'Admin - Posts', description: 'Post management' },
      { name: 'Admin - Media', description: 'Media management' },
      { name: 'Admin - Contact', description: 'Contact message management' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

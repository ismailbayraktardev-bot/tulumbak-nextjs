import { NextRequest, NextResponse } from 'next/server'

// API Documentation - OpenAPI Specification
export async function GET(request: NextRequest) {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Tulumbak E-commerce API',
      version: '1.0.0',
      description: 'Complete e-commerce backend API with authentication, payments, and product management',
      contact: {
        name: 'API Support',
        email: 'api@tulumbak.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3006/api',
        description: 'Development server'
      },
      {
        url: 'https://api.tulumbak.com/api',
        description: 'Production server'
      }
    ],
    security: [
      {
        BearerAuth: []
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '+90 532 123 4567' },
            role: { type: 'string', enum: ['customer', 'admin', 'super_admin'], example: 'customer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Organic Honey' },
            description: { type: 'string', example: 'Pure organic honey from local farms' },
            price: { type: 'number', format: 'decimal', example: 45.99 },
            category_id: { type: 'integer', example: 1 },
            image_url: { type: 'string', example: 'https://example.com/honey.jpg' },
            stock: { type: 'integer', example: 100 },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Honey Products' },
            description: { type: 'string', example: 'All types of honey and honey products' },
            image_url: { type: 'string', example: 'https://example.com/honey-category.jpg' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', nullable: true, example: 123 },
            session_id: { type: 'string', nullable: true, example: 'guest-session-123' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/CartItem' }
            },
            total: { type: 'number', format: 'decimal', example: 125.50 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            cart_id: { type: 'integer', example: 1 },
            product_id: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            unit_price: { type: 'number', format: 'decimal', example: 45.99 },
            total_price: { type: 'number', format: 'decimal', example: 91.98 },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 123 },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'confirmed'
            },
            total: { type: 'number', format: 'decimal', example: 156.50 },
            shipping_address: { $ref: '#/components/schemas/Address' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' }
            },
            payment: { $ref: '#/components/schemas/Payment' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            order_id: { type: 'integer', example: 1 },
            product_id: { type: 'integer', example: 1 },
            product_name: { type: 'string', example: 'Organic Honey' },
            quantity: { type: 'integer', example: 2 },
            unit_price: { type: 'number', format: 'decimal', example: 45.99 },
            total_price: { type: 'number', format: 'decimal', example: 91.98 }
          }
        },
        Address: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Home' },
            name: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '+90 532 123 4567' },
            city: { type: 'string', example: 'İstanbul' },
            district: { type: 'string', example: 'Kadıköy' },
            neighborhood: { type: 'string', example: 'Caferağa' },
            address_line: { type: 'string', example: 'Street 123, Apartment 4' },
            postal_code: { type: 'string', example: '34710' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            order_id: { type: 'integer', example: 1 },
            merchant_oid: { type: 'string', example: 'ORD1234567890' },
            amount: { type: 'number', format: 'decimal', example: 156.50 },
            currency: { type: 'string', example: 'TRY' },
            status: {
              type: 'string',
              enum: ['pending', 'success', 'failed', 'cancelled'],
              example: 'success'
            },
            payment_method: { type: 'string', example: 'credit_card' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid input data' },
                details: { type: 'object' }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string', example: 'Operation completed successfully' }
          }
        }
      }
    },
    paths: {
      '/test': {
        get: {
          summary: 'Health check endpoint',
          description: 'Basic health check to verify API is working',
          tags: ['Health'],
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/test/rate-limit': {
        get: {
          summary: 'Test rate limiting',
          description: 'Test endpoint to verify rate limiting is working',
          tags: ['Testing'],
          responses: {
            200: {
              description: 'Rate limiting test successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            },
            429: {
              description: 'Rate limit exceeded',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/test/security': {
        get: {
          summary: 'Test security headers',
          description: 'Test endpoint to verify security headers are applied',
          tags: ['Testing'],
          responses: {
            200: {
              description: 'Security test successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/auth/register': {
        post: {
          summary: 'User registration',
          description: 'Register a new user account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name', 'phone'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    name: { type: 'string', minLength: 2 },
                    phone: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'User login',
          description: 'Authenticate user and return JWT tokens',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/categories': {
        get: {
          summary: 'Get all categories',
          description: 'Retrieve list of all product categories',
          tags: ['Products'],
          responses: {
            200: {
              description: 'Categories retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Category' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/products': {
        get: {
          summary: 'Get all products',
          description: 'Retrieve list of all products with optional filtering',
          tags: ['Products'],
          parameters: [
            {
              name: 'category_id',
              in: 'query',
              schema: { type: 'integer' },
              description: 'Filter by category ID'
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search products by name'
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Page number for pagination'
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
              description: 'Number of items per page'
            }
          ],
          responses: {
            200: {
              description: 'Products retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/products/{id}': {
        get: {
          summary: 'Get product by ID',
          description: 'Retrieve a single product by its ID',
          tags: ['Products'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'Product ID'
            }
          ],
          responses: {
            200: {
              description: 'Product retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Product not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/cart': {
        get: {
          summary: 'Get user cart',
          description: 'Retrieve the current user\'s shopping cart',
          tags: ['Cart'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Cart retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Cart' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        post: {
          summary: 'Add item to cart',
          description: 'Add a product to the user\'s shopping cart',
          tags: ['Cart'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['product_id', 'quantity'],
                  properties: {
                    product_id: { type: 'integer' },
                    quantity: { type: 'integer', minimum: 1 }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Item added to cart',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/payments/paytr/init': {
        post: {
          summary: 'Initiate PayTR payment',
          description: 'Start a new payment process with PayTR payment gateway',
          tags: ['Payments'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['order_id'],
                  properties: {
                    order_id: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Payment initiated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          payment_url: { type: 'string', example: 'https://www.paytr.com/odeme/...' },
                          token: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return NextResponse.json(spec, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
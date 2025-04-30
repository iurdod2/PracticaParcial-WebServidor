const swaggerJsdoc = require("swagger-jsdoc")

const options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Tracks - Express API with Swagger (OpenAPI 3.0)",
        version: "0.1.0",
        description:
          "This is a CRUD API application made with Express and documented with Swagger",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        
        // Rutas de autenticación
        contact: {
          name: "u-tad",
          url: "https://u-tad.com",
          email: "ricardo.palacios@u-tad.com",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
      components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer"
            },
        },
        schemas:{
            user: {
                type: "object",
                required: ["name", "age", "email", "password"],
                properties: {
                    name: {
                        type: "string",
                        example: "Menganito"
                    },
                    age: {
                        type: "integer",
                        example: 20
                    },
                    email: {
                        type: "string",
                        example: "miemail@google.com"
                    },
                    password: {
                        type: "string"
                    },
                },
            },
            login: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    example: "miemail@google.com"
                  },
                password: {
                    type: "string"
                  },
                }
            }
        },
      },
      paths: {
        // Rutas de almacenamiento
        "/storage/local": {
          post: {
            tags: ["Storage"],
            summary: "Upload file to local storage",
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      image: {
                        type: "string",
                        format: "binary"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: "File uploaded successfully"
              },
              400: {
                description: "Invalid input data"
              }
            }
          }
        },
        "/storage/memory": {
          post: {
            tags: ["Storage"],
            summary: "Upload file to memory storage",
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      image: {
                        type: "string",
                        format: "binary"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: "File uploaded successfully"
              },
              400: {
                description: "No se recibió ninguna imagen"
              }
            }
          }
        },
        "/storage/logo": {
          patch: {
            tags: ["Storage"],
            summary: "Update logo",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      image: {
                        type: "string",
                        format: "binary"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Logo updated successfully"
              },
              400: {
                description: "No se recibió ningún logo"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        
        // Rutas de onboarding
        "/onboarding/personal": {
          put: {
            tags: ["Onboarding"],
            summary: "Update personal data",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      firstName: {
                        type: "string",
                        example: "John"
                      },
                      lastName: {
                        type: "string",
                        example: "Doe"
                      },
                      phone: {
                        type: "string",
                        example: "+34600000000"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Personal data updated successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/onboarding/company": {
          patch: {
            tags: ["Onboarding"],
            summary: "Update company data",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      companyName: {
                        type: "string",
                        example: "Acme Inc."
                      },
                      industry: {
                        type: "string",
                        example: "Technology"
                      },
                      address: {
                        type: "string",
                        example: "123 Main St."
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Company data updated successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        
        // Rutas de invitaciones
        "/invitations/invite": {
          post: {
            tags: ["Invitations"],
            summary: "Invite a user",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: {
                        type: "string",
                        example: "user@example.com"
                      },
                      role: {
                        type: "string",
                        example: "editor"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Invitation sent successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/invitations/accept": {
          post: {
            tags: ["Invitations"],
            summary: "Accept an invitation",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: {
                        type: "string",
                        example: "invitationToken123"
                      },
                      password: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Invitation accepted successfully"
              },
              400: {
                description: "Invalid invitation token"
              }
            }
          }
        },
        
        // Rutas de recuperación de contraseña
        "/recovery/request": {
          post: {
            tags: ["Password Recovery"],
            summary: "Request password reset",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: {
                        type: "string",
                        example: "user@example.com"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Password reset request sent successfully"
              },
              400: {
                description: "Invalid email"
              }
            }
          }
        },
        "/recovery/reset": {
          post: {
            tags: ["Password Recovery"],
            summary: "Reset password with token",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: {
                        type: "string",
                        example: "resetToken123"
                      },
                      password: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Password reset successfully"
              },
              400: {
                description: "Invalid or expired token"
              }
            }
          }
        },
        
        // Rutas de albaranes (DeliveryNote)
        "/deliverynote": {
          post: {
            tags: ["Delivery Notes"],
            summary: "Create a delivery note",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      clientId: {
                        type: "string",
                        example: "60d21b4667d0d8992e610c85"
                      },
                      projectId: {
                        type: "string",
                        example: "60d21b4667d0d8992e610c86"
                      },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            description: {
                              type: "string",
                              example: "Product description"
                            },
                            quantity: {
                              type: "number",
                              example: 2
                            },
                            price: {
                              type: "number",
                              example: 100.50
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: "Delivery note created successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              }
            }
          },
          get: {
            tags: ["Delivery Notes"],
            summary: "Get all delivery notes",
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              200: {
                description: "List of delivery notes",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string"
                          },
                          clientId: {
                            type: "string"
                          },
                          projectId: {
                            type: "string"
                          },
                          status: {
                            type: "string"
                          },
                          items: {
                            type: "array"
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time"
                          }
                        }
                      }
                    }
                  }
                }
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/deliverynote/{id}": {
          get: {
            tags: ["Delivery Notes"],
            summary: "Get a specific delivery note",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Delivery Note ID"
              }
            ],
            responses: {
              200: {
                description: "Delivery note data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Delivery note not found"
              }
            }
          },
          put: {
            tags: ["Delivery Notes"],
            summary: "Update a delivery note",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Delivery Note ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      clientId: {
                        type: "string"
                      },
                      projectId: {
                        type: "string"
                      },
                      items: {
                        type: "array",
                        items: {
                          type: "object"
                        }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Delivery note updated successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Delivery note not found"
              }
            }
          },
          delete: {
            tags: ["Delivery Notes"],
            summary: "Delete a delivery note",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Delivery Note ID"
              }
            ],
            responses: {
              200: {
                description: "Delivery note deleted successfully"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Delivery note not found"
              }
            }
          }
        },
        "/deliverynote/{id}/status": {
          patch: {
            tags: ["Delivery Notes"],
            summary: "Change delivery note status",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Delivery Note ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: {
                        type: "string",
                        example: "completed"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Status updated successfully"
              },
              400: {
                description: "Invalid status"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Delivery note not found"
              }
            }
          }
        },
        "/deliverynote/pdf/{id}": {
          get: {
            tags: ["Delivery Notes"],
            summary: "Generate and download PDF",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Delivery Note ID"
              }
            ],
            responses: {
              200: {
                description: "PDF file",
                content: {
                  "application/pdf": {
                    schema: {
                      type: "string",
                      format: "binary"
                    }
                  }
                }
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Delivery note not found"
              }
            }
          }
        },
        "/deliverynote/{id}/sign": {
          post: {
            tags: ["Delivery Notes"],
            summary: "Sign delivery note",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Delivery Note ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      signature: {
                        type: "string",
                        format: "binary"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Delivery note signed successfully"
              },
              400: {
                description: "Invalid signature"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Delivery note not found"
              }
            }
          }
        },
        "/deliverynote/{id}/guest": {
          post: {
            tags: ["Delivery Notes"],
            summary: "Add guest access",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Delivery Note ID"
              }
            ],
            responses: {
              200: {
                description: "Guest access added successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        accessToken: {
                          type: "string"
                        }
                      }
                    }
                  }
                }
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Delivery note not found"
              }
            }
          }
        },
        "/deliverynote/{id}/safe": {
          delete: {
            tags: ["Delivery Notes"],
            summary: "Safe delete delivery note (only if not signed)",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Delivery Note ID"
              }
            ],
            responses: {
              200: {
                description: "Delivery note deleted successfully"
              },
              400: {
                description: "Cannot delete signed delivery note"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Delivery note not found"
              }
            }
          }
        },
        
        // Rutas de proyectos
        "/projects": {
          post: {
            tags: ["Projects"],
            summary: "Create a project",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        example: "Project Name"
                      },
                      description: {
                        type: "string",
                        example: "Project Description"
                      },
                      client: {
                        type: "string",
                        example: "60d21b4667d0d8992e610c85"
                      },
                      status: {
                        type: "string",
                        example: "active"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: "Project created successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              }
            }
          },
          get: {
            tags: ["Projects"],
            summary: "Get all projects",
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              200: {
                description: "List of projects",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string"
                          },
                          name: {
                            type: "string"
                          },
                          description: {
                            type: "string"
                          },
                          client: {
                            type: "string"
                          },
                          status: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/projects/{id}": {
          get: {
            tags: ["Projects"],
            summary: "Get a specific project",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Project ID"
              }
            ],
            responses: {
              200: {
                description: "Project data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Project not found"
              }
            }
          },
          put: {
            tags: ["Projects"],
            summary: "Update a project (full update)",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Project ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string"
                      },
                      description: {
                        type: "string"
                      },
                      client: {
                        type: "string"
                      },
                      status: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Project updated successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Project not found"
              }
            }
          },
          patch: {
            tags: ["Projects"],
            summary: "Update a project (partial update)",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Project ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string"
                      },
                      description: {
                        type: "string"
                      },
                      client: {
                        type: "string"
                      },
                      status: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Project updated successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Project not found"
              }
            }
          },
          delete: {
            tags: ["Projects"],
            summary: "Delete a project",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Project ID"
              }
            ],
            responses: {
              200: {
                description: "Project deleted successfully"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Project not found"
              }
            }
          }
        },
        "/projects/{id}/archive": {
          put: {
            tags: ["Projects"],
            summary: "Archive a project",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Project ID"
              }
            ],
            responses: {
              200: {
                description: "Project archived successfully"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Project not found"
              }
            }
          }
        },
        "/projects/archived/list": {
          get: {
            tags: ["Projects"],
            summary: "Get archived projects",
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              200: {
                description: "List of archived projects"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/projects/{id}/restore": {
          put: {
            tags: ["Projects"],
            summary: "Restore an archived project",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Project ID"
              }
            ],
            responses: {
              200: {
                description: "Project restored successfully"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Project not found"
              }
            }
          }
        },
        
        // Rutas de clientes
        "/clients": {
          post: {
            tags: ["Clients"],
            summary: "Create a client",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        example: "Client Name"
                      },
                      email: {
                        type: "string",
                        example: "client@example.com"
                      },
                      phone: {
                        type: "string",
                        example: "+34600000000"
                      },
                      address: {
                        type: "string",
                        example: "Client Address"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: "Client created successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              }
            }
          },
          get: {
            tags: ["Clients"],
            summary: "Get all clients",
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              200: {
                description: "List of clients",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string"
                          },
                          name: {
                            type: "string"
                          },
                          email: {
                            type: "string"
                          },
                          phone: {
                            type: "string"
                          },
                          address: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/clients/{id}": {
          get: {
            tags: ["Clients"],
            summary: "Get a specific client",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Client ID"
              }
            ],
            responses: {
              200: {
                description: "Client data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Client not found"
              }
            }
          },
          put: {
            tags: ["Clients"],
            summary: "Update a client (full update)",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Client ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string"
                      },
                      email: {
                        type: "string"
                      },
                      phone: {
                        type: "string"
                      },
                      address: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Client updated successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Client not found"
              }
            }
          },
          patch: {
            tags: ["Clients"],
            summary: "Update a client (partial update)",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Client ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string"
                      },
                      email: {
                        type: "string"
                      },
                      phone: {
                        type: "string"
                      },
                      address: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Client updated successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Client not found"
              }
            }
          },
          delete: {
            tags: ["Clients"],
            summary: "Delete a client",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Client ID"
              }
            ],
            responses: {
              200: {
                description: "Client deleted successfully"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Client not found"
              }
            }
          }
        },
        "/clients/{id}/archive": {
          put: {
            tags: ["Clients"],
            summary: "Archive a client",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Client ID"
              }
            ],
            responses: {
              200: {
                description: "Client archived successfully"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Client not found"
              }
            }
          }
        },
        "/clients/archived/list": {
          get: {
            tags: ["Clients"],
            summary: "Get archived clients",
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              200: {
                description: "List of archived clients"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/clients/{id}/restore": {
          put: {
            tags: ["Clients"],
            summary: "Restore an archived client",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "Client ID"
              }
            ],
            responses: {
              200: {
                description: "Client restored successfully"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "Client not found"
              }
            }
          }
        },
        
        // Rutas de autenticación
        "/auth/register": {
          post: {
            tags: ["Authentication"],
            summary: "Register a new user",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/user"
                  }
                }
              }
            },
            responses: {
              201: {
                description: "User registered successfully"
              },
              400: {
                description: "Invalid input data"
              }
            }
          }
        },
        "/auth/login": {
          post: {
            tags: ["Authentication"],
            summary: "Login with user credentials",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/login"
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Login successful",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        token: {
                          type: "string"
                        }
                      }
                    }
                  }
                }
              },
              401: {
                description: "Invalid credentials"
              }
            }
          }
        },
        "/auth/validation": {
          put: {
            tags: ["Authentication"],
            summary: "Validate user email",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      code: {
                        type: "string",
                        example: "123456"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Email validated successfully"
              },
              400: {
                description: "Invalid code"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/auth/resend-code": {
          post: {
            tags: ["Authentication"],
            summary: "Resend verification code",
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              200: {
                description: "Verification code resent successfully"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        // Rutas de usuarios
        "/users": {
          get: {
            tags: ["Users"],
            summary: "Get all users",
            responses: {
              200: {
                description: "List of users",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/user"
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            tags: ["Users"],
            summary: "Create a new user",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/user"
                  }
                }
              }
            },
            responses: {
              201: {
                description: "User created successfully"
              },
              400: {
                description: "Invalid input data"
              }
            }
          }
        },
        "/users/me": {
          get: {
            tags: ["Users"],
            summary: "Get current user information",
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              200: {
                description: "Current user information",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/user"
                    }
                  }
                }
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        },
        "/users/{id}": {
          get: {
            tags: ["Users"],
            summary: "Get user by ID",
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "User ID"
              }
            ],
            responses: {
              200: {
                description: "User information",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/user"
                    }
                  }
                }
              },
              404: {
                description: "User not found"
              }
            }
          },
          put: {
            tags: ["Users"],
            summary: "Update user information",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "User ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/user"
                  }
                }
              }
            },
            responses: {
              200: {
                description: "User updated successfully"
              },
              400: {
                description: "Invalid input data"
              },
              401: {
                description: "Unauthorized"
              },
              404: {
                description: "User not found"
              }
            }
          },
          delete: {
            tags: ["Users"],
            summary: "Delete user by ID",
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "User ID"
              }
            ],
            responses: {
              200: {
                description: "User deleted successfully"
              },
              404: {
                description: "User not found"
              }
            }
          }
        },
        "/users/role/{id}": {
          put: {
            tags: ["Users"],
            summary: "Update user role (admin only)",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                in: "path",
                name: "id",
                required: true,
                schema: {
                  type: "string"
                },
                description: "User ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      role: {
                        type: "string",
                        example: "admin"
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: "User role updated successfully"
              },
              401: {
                description: "Unauthorized"
              },
              403: {
                description: "Forbidden - Admin role required"
              },
              404: {
                description: "User not found"
              }
            }
          }
        },
        "/users/account": {
          delete: {
            tags: ["Users"],
            summary: "Delete current user account",
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              200: {
                description: "Account deleted successfully"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        }
      }
    },
    apis: ["../routes/*.js"],
  };
  
module.exports = swaggerJsdoc(options)
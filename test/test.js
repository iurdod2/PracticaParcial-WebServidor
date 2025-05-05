const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../app'); // Asumiendo que app.js exporta app y server
const { encrypt } = require('../utils/handlePassword'); // Para encriptar contraseñas
const { tokenSign } = require('../utils/handleJwt'); // Para generar tokens JWT
const models = require('../models'); // Importando todos los modelos

const api = supertest(app);

// Variables globales para los tests
let adminToken = '';
let adminId = '';
let userId = '';
let userToken = '';
let clientId = '';
let projectId = '';
let deliveryNoteId = '';

// Datos de prueba
const adminUser = {
  name: "Admin Test",
  email: "admin_test@example.com",
  password: "AdminTest123!",
  role: ["admin"]
};

const regularUser = {
  name: "User Test",
  email: "user_test@example.com",
  password: "UserTest123!",
  role: ["user"]
};

const clientData = {
  name: "Test Client",
  email: "client_test@example.com",
  phone: "123456789",
  contactPerson: "Contact Test",
  nif: "B12345678",
  address: "Test Address, 123"
};

const projectData = {
  name: "Test Project",
  description: "Project for testing purposes",
  startDate: new Date(),
  status: "in-progress"
};

const deliveryNoteData = {
  number: "DN-001",
  date: new Date(),
  description: "Test delivery note",
  hoursEntries: [
    {
      hours: 8,
      description: "Development work"
    }
  ],
  materialEntries: [
    {
      name: "Material Test",
      quantity: 10,
      unit: "unit",
      price: 50,
      description: "Test material"
    }
  ],
  isSimple: false,
  status: "draft"
};

// Configuración antes de todos los tests
beforeAll(async () => {
  // Esperar a que mongoose se conecte
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  
  // Limpiar las colecciones en la base de datos de prueba
  await models.usersModel.deleteMany({});
  await models.ClientSchema.deleteMany({});
  await models.ProjectSchema.deleteMany({});
  await models.DeliveryNoteSchema.deleteMany({});
  
  // Crear usuario administrador para los tests
  const adminPassword = await encrypt(adminUser.password);
  const adminData = { ...adminUser, password: adminPassword, verified: true };
  const createdAdmin = await models.usersModel.create(adminData);
  adminId = createdAdmin._id;
  
  // Generar token para el admin
  adminToken = await tokenSign(createdAdmin, process.env.JWT_SECRET);
  
  // Crear usuario regular para los tests
  const userPassword = await encrypt(regularUser.password);
  const userData = { ...regularUser, password: userPassword, verified: true };
  const createdUser = await models.usersModel.create(userData);
  userId = createdUser._id;
  
  // Generar token para el usuario regular
  userToken = await tokenSign(createdUser, process.env.JWT_SECRET);
});

// Limpiar después de todos los tests
afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

// Grupos de tests
describe('Authentication Tests', () => {
  it('should login with admin credentials', async () => {
    const response = await api
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password
      })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toEqual(adminUser.email);
    expect(response.body.user.role).toContain('admin');
  });

  it('should fail login with wrong credentials', async () => {
    await api
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: 'wrongPassword'
      })
      .expect(401);
  });

  it('should get profile with valid token', async () => {
    const response = await api
      .get('/api/auth/profile') // Asumiendo que tienes este endpoint
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body.email).toEqual(adminUser.email);
  });

  it('should reject access with invalid token', async () => {
    await api
      .get('/api/auth/profile')
      .auth('invalid-token', { type: 'bearer' })
      .expect(401);
  });
});

describe('Users Tests', () => {
  it('should get all users as admin', async () => {
    const response = await api
      .get('/api/users')
      .auth(adminToken, { type: 'bearer' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.length).toBeGreaterThanOrEqual(2); // Admin + Regular user
  });

  it('should not get users as regular user (if restricted)', async () => {
    // Este test depende de tu lógica de autorización
    // Si los usuarios regulares no pueden ver a todos los usuarios, debería fallar
    // Si pueden, deberías ajustar esta prueba
    await api
      .get('/api/users')
      .auth(userToken, { type: 'bearer' })
      .expect(403); // Asumiendo que devuelves 403 Forbidden
  });

  it('should update user profile', async () => {
    const updatedData = {
      name: "Updated User",
      companyName: "New Company"
    };

    const response = await api
      .put(`/api/users/${userId}`) // O el endpoint correcto para actualizar
      .auth(adminToken, { type: 'bearer' })
      .send(updatedData)
      .expect(200);

    expect(response.body.name).toEqual(updatedData.name);
    expect(response.body.companyName).toEqual(updatedData.companyName);
  });
});

describe('Clients Tests', () => {
  it('should create a new client', async () => {
    const response = await api
      .post('/api/clients')
      .auth(adminToken, { type: 'bearer' })
      .send(clientData)
      .expect(201);  // Asumiendo que usas 201 para creación exitosa

    expect(response.body.name).toEqual(clientData.name);
    expect(response.body.email).toEqual(clientData.email);
    clientId = response.body._id;
  });

  it('should get all clients', async () => {
    const response = await api
      .get('/api/clients')
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body.some(client => client._id === clientId)).toBeTruthy();
  });

  it('should get a specific client', async () => {
    const response = await api
      .get(`/api/clients/${clientId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body._id).toEqual(clientId);
    expect(response.body.name).toEqual(clientData.name);
  });

  it('should update a client', async () => {
    const updatedData = {
      name: "Updated Client",
      address: "New Address, 456"
    };

    const response = await api
      .put(`/api/clients/${clientId}`)
      .auth(adminToken, { type: 'bearer' })
      .send(updatedData)
      .expect(200);

    expect(response.body.name).toEqual(updatedData.name);
    expect(response.body.address).toEqual(updatedData.address);
  });

  it('should archive a client', async () => {
    const response = await api
      .patch(`/api/clients/${clientId}/archive`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body.isArchived).toBeTruthy();
  });
});

describe('Projects Tests', () => {
  it('should create a new project', async () => {
    const projectWithClient = {
      ...projectData,
      clientId
    };

    const response = await api
      .post('/api/projects')
      .auth(adminToken, { type: 'bearer' })
      .send(projectWithClient)
      .expect(201);

    expect(response.body.name).toEqual(projectData.name);
    expect(response.body.clientId).toEqual(clientId);
    projectId = response.body._id;
  });

  it('should get all projects', async () => {
    const response = await api
      .get('/api/projects')
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body.some(project => project._id === projectId)).toBeTruthy();
  });

  it('should get projects by client', async () => {
    const response = await api
      .get(`/api/projects/client/${clientId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].clientId).toEqual(clientId);
  });

  it('should update project status', async () => {
    const response = await api
      .patch(`/api/projects/${projectId}/status`)
      .auth(adminToken, { type: 'bearer' })
      .send({ status: 'completed' })
      .expect(200);

    expect(response.body.status).toEqual('completed');
  });
});

describe('Delivery Notes Tests', () => {
  it('should create a new delivery note', async () => {
    const deliveryNoteWithIds = {
      ...deliveryNoteData,
      projectId,
      clientId,
      hoursEntries: [
        {
          ...deliveryNoteData.hoursEntries[0],
          userId: adminId
        }
      ]
    };

    const response = await api
      .post('/api/deliverynotes')
      .auth(adminToken, { type: 'bearer' })
      .send(deliveryNoteWithIds)
      .expect(201);

    expect(response.body.projectId).toEqual(projectId);
    expect(response.body.clientId).toEqual(clientId);
    deliveryNoteId = response.body._id;
  });

  it('should get all delivery notes', async () => {
    const response = await api
      .get('/api/deliverynotes')
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should get delivery notes by project', async () => {
    const response = await api
      .get(`/api/deliverynotes/project/${projectId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].projectId).toEqual(projectId);
  });

  it('should update delivery note status', async () => {
    const response = await api
      .patch(`/api/deliverynotes/${deliveryNoteId}/status`)
      .auth(adminToken, { type: 'bearer' })
      .send({ status: 'sent' })
      .expect(200);

    expect(response.body.status).toEqual('sent');
  });

  it('should add hours entry to delivery note', async () => {
    const newHoursEntry = {
      userId: adminId,
      hours: 4,
      description: "Additional work"
    };

    const response = await api
      .post(`/api/deliverynotes/${deliveryNoteId}/hours`)
      .auth(adminToken, { type: 'bearer' })
      .send(newHoursEntry)
      .expect(200);

    expect(response.body.hoursEntries.length).toEqual(2);
    expect(response.body.hoursEntries[1].hours).toEqual(newHoursEntry.hours);
  });

  it('should add material entry to delivery note', async () => {
    const newMaterialEntry = {
      name: "Additional Material",
      quantity: 5,
      unit: "kg",
      price: 25,
      description: "Extra materials"
    };

    const response = await api
      .post(`/api/deliverynotes/${deliveryNoteId}/materials`)
      .auth(adminToken, { type: 'bearer' })
      .send(newMaterialEntry)
      .expect(200);

    expect(response.body.materialEntries.length).toEqual(2);
    expect(response.body.materialEntries[1].name).toEqual(newMaterialEntry.name);
  });
});

describe('Negative Test Cases', () => {
  it('should fail to create client with invalid data', async () => {
    await api
      .post('/api/clients')
      .auth(adminToken, { type: 'bearer' })
      .send({ name: "Invalid Client" }) // Falta el email que es requerido
      .expect(400);
  });

  it('should fail to create project without client', async () => {
    await api
      .post('/api/projects')
      .auth(adminToken, { type: 'bearer' })
      .send({ name: "Project without client" }) // Falta clientId que es requerido
      .expect(400);
  });

  it('should handle invalid ObjectId in URL', async () => {
    await api
      .get('/api/clients/invalid-id')
      .auth(adminToken, { type: 'bearer' })
      .expect(400); // Asumiendo que manejas errores de ObjectId inválido
  });

  it('should reject request with invalid token format', async () => {
    await api
      .get('/api/users')
      .set('Authorization', 'Bearer invalidtokenformat')
      .expect(401);
  });

  it('should reject unauthorized access to protected routes', async () => {
    await api
      .get('/api/users')
      .expect(401); // Sin token debería rechazar
  });
});

describe('Cleanup Tests', () => {
  it('should delete delivery note', async () => {
    await api
      .delete(`/api/deliverynotes/${deliveryNoteId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
  });

  it('should delete project', async () => {
    await api
      .delete(`/api/projects/${projectId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
  });

  it('should delete client', async () => {
    await api
      .delete(`/api/clients/${clientId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
  });

  it('should delete user', async () => {
    await api
      .delete(`/api/users/${userId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
  });

  it('verify databases are clean after tests', async () => {
    // Opcional: verificar que se limpiaron los datos
    const clients = await models.ClientSchema.find({ _id: clientId });
    expect(clients.length).toEqual(0);
    
    const projects = await models.ProjectSchema.find({ _id: projectId });
    expect(projects.length).toEqual(0);
    
    const deliveryNotes = await models.DeliveryNoteSchema.find({ _id: deliveryNoteId });
    expect(deliveryNotes.length).toEqual(0);
  });
});
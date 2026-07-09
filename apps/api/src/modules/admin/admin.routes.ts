import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import * as adminController from './admin.controller.js';

export const adminRoutes = Router();

// All admin routes require auth + admin role
adminRoutes.use(authenticate);
adminRoutes.use(requireAdmin);

// User management
adminRoutes.get('/users', adminController.listUsers);
adminRoutes.get('/users/:id', adminController.getUserDetail);
adminRoutes.patch('/users/:id/status', adminController.updateUserStatus);
adminRoutes.post('/users', adminController.createUser);
adminRoutes.patch('/users/:id/ai-toggle', adminController.toggleUserAI);

// Balance control
adminRoutes.get('/balances', adminController.getBalancesSummary);
adminRoutes.get('/balances/:id', adminController.getAccountBalance);
adminRoutes.patch('/balances/:id', adminController.adjustBalance);

// Transaction oversight
adminRoutes.get('/transactions', adminController.listAllTransactions);
adminRoutes.post('/transactions/:id/approve', adminController.approveTransaction);
adminRoutes.post('/transactions/:id/reject', adminController.rejectTransaction);
adminRoutes.get('/transactions/export/csv', adminController.exportTransactionsCSV);

// AI control
adminRoutes.get('/ai/params', adminController.getAIParams);
adminRoutes.patch('/ai/params', adminController.updateAIParams);
adminRoutes.get('/ai/overrides', adminController.listAIOverrides);
adminRoutes.post('/ai/overrides/:userId', adminController.setAIOverride);
adminRoutes.delete('/ai/overrides/:userId', adminController.removeAIOverride);
adminRoutes.post('/ai/emergency-stop', adminController.emergencyStop);
adminRoutes.post('/ai/emergency-resume', adminController.emergencyResume);
adminRoutes.get('/ai/stats', adminController.getAIStats);

// Audit log
adminRoutes.get('/audit-log', adminController.getAuditLog);

// RBAC routes
adminRoutes.get('/roles', adminController.listRoles);
adminRoutes.get('/permissions', adminController.listPermissions);
adminRoutes.post('/roles/:roleId/permissions', adminController.addPermission);
adminRoutes.delete('/roles/:roleId/permissions/:permId', adminController.removePermission);

// CRM routes
adminRoutes.get("/clients", adminController.listClients);
adminRoutes.get("/clients/:id", adminController.getClient);
adminRoutes.post('/clients', adminController.createClient);
adminRoutes.patch('/clients/:id', adminController.updateClient);
adminRoutes.delete("/clients/:id", adminController.deleteClient);

// Import
adminRoutes.post('/import/clients', adminController.importClients);

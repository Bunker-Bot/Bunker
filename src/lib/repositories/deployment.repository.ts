import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';
import type { CreateDeploymentInput, UpdateDeploymentInput } from '../../modules/deployments/types/deployments';

export const DeploymentRepository = {
  async getDeploymentsByProject(projectId?: string | null) {
    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('deployments')
        .select('id, project_id, environment, frontend_url, backend_url, api_url, admin_url, portal_url, status, version, notes, deployed_at, created_at, updated_at, projects(id, name)')
        .order('deployed_at', { ascending: false });

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }, 'low');
  },

  async createDeployment(input: CreateDeploymentInput) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('deployments')
        .insert({
          project_id: input.projectId,
          environment: input.environment,
          frontend_url: input.frontendUrl || null,
          backend_url: input.backendUrl || null,
          api_url: input.apiUrl || null,
          admin_url: input.adminUrl || null,
          portal_url: input.portalUrl || null,
          status: input.status || 'successful',
          version: input.version || 'v1.0.0',
          notes: input.notes || null,
          deployed_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }, 'high');
  },

  async updateDeployment(input: UpdateDeploymentInput) {
    return requestQueue.enqueue(async () => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (input.environment !== undefined) updates.environment = input.environment;
      if (input.frontendUrl !== undefined) updates.frontend_url = input.frontendUrl;
      if (input.backendUrl !== undefined) updates.backend_url = input.backendUrl;
      if (input.apiUrl !== undefined) updates.api_url = input.apiUrl;
      if (input.adminUrl !== undefined) updates.admin_url = input.adminUrl;
      if (input.portalUrl !== undefined) updates.portal_url = input.portalUrl;
      if (input.status !== undefined) updates.status = input.status;
      if (input.version !== undefined) updates.version = input.version;
      if (input.notes !== undefined) updates.notes = input.notes;

      const { data, error } = await supabase
        .from('deployments')
        .update(updates)
        .eq('id', input.id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }, 'high');
  },

  async deleteDeployment(id: string) {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase
        .from('deployments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }, 'high');
  },
};

export default DeploymentRepository;

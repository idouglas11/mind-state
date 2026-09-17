// Stand-in for Base44's hosted backend SDK, backed by a real Postgres table
// in Supabase (see supabaseClient.js). Every entity shares one generic
// `app_records` table (columns: id, entity, data jsonb, created_date,
// updated_date) so no per-entity migration is needed as the app grows.
// Exposes the same `base44.entities.<Entity>.list/filter/create/update/delete`
// shape the pages already call.
import { supabase } from '@/lib/supabaseClient';

function toRecord(row) {
  return {
    id: row.id,
    created_date: row.created_date,
    updated_date: row.updated_date,
    ...row.data,
  };
}

function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  if (field === 'created_date' || field === 'updated_date') {
    return query.order(field, { ascending: !desc });
  }
  return query.order(`data->>${field}`, { ascending: !desc });
}

function makeEntity(entityName) {
  return {
    async list(sort, limit) {
      let query = supabase.from('app_records').select('*').eq('entity', entityName);
      query = applySort(query, sort);
      if (typeof limit === 'number') query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data.map(toRecord);
    },
    async filter(queryFields = {}, sort, limit) {
      let query = supabase.from('app_records').select('*').eq('entity', entityName);
      for (const [key, value] of Object.entries(queryFields)) {
        if (key === 'id') {
          query = query.eq('id', value);
        } else {
          query = query.eq(`data->>${key}`, String(value));
        }
      }
      query = applySort(query, sort);
      if (typeof limit === 'number') query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data.map(toRecord);
    },
    async create(data) {
      const { data: row, error } = await supabase
        .from('app_records')
        .insert({ entity: entityName, data })
        .select()
        .single();
      if (error) throw error;
      return toRecord(row);
    },
    async update(id, data) {
      const { data: existing, error: fetchError } = await supabase
        .from('app_records')
        .select('data')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;
      const mergedData = { ...existing.data, ...data };
      const { data: row, error } = await supabase
        .from('app_records')
        .update({ data: mergedData, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toRecord(row);
    },
    async delete(id) {
      const { error } = await supabase.from('app_records').delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
  };
}

export const base44 = {
  entities: new Proxy(
    {},
    {
      get(_target, entityName) {
        return makeEntity(String(entityName));
      },
    }
  ),
};

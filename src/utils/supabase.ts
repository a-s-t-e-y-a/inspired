import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Initialization:');
console.log('  URL:', supabaseUrl);
console.log('  Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  const error = 'Missing Supabase configuration. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your .env file';
  console.error('❌ ' + error);
  throw new Error(error);
}

console.log('✅ Supabase credentials loaded successfully');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export const db = {
  // Insert a new contact
  async insertContact(data: {
    full_name: string;
    country: string;
    email: string;
    phone: string;
    source: 'contact_form' | 'need_help';
    document_url?: string;
  }) {
    console.log('📝 Inserting contact with data:', {
      full_name: data.full_name,
      country: data.country,
      email: data.email,
      phone: data.phone,
      source: data.source,
      document_url: data.document_url || 'None',
    });

    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .insert([
          {
            full_name: data.full_name,
            country: data.country,
            email: data.email,
            phone: data.phone,
            source: data.source,
            document_url: data.document_url || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error inserting contact:', error);
        throw error;
      }

      console.log('✅ Contact inserted successfully with ID:', contact.id);
      console.log('   Full response:', contact);
      return contact;
    } catch (error) {
      console.error('❌ Exception in insertContact:', error);
      throw error;
    }
  },

  // Upload a medical document
  async uploadMedicalDocument(file: File): Promise<string> {
    console.log('📄 Uploading medical document:', file.name);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data, error } = await supabase.storage
        .from('medical_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Database error uploading document:', error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('medical_documents')
        .getPublicUrl(filePath);

      console.log('✅ Document uploaded successfully. URL:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('❌ Exception in uploadMedicalDocument:', error);
      throw error;
    }
  },

  // Insert a medical request
  async insertMedicalRequest(data: {
    contact_id: string;
    medical_condition: string;
    document_url?: string;
  }) {
    console.log('📝 Inserting medical request with data:', {
      contact_id: data.contact_id,
      medical_condition: data.medical_condition.substring(0, 100) + '...',
      document_url: data.document_url || 'None',
    });

    try {
      const { data: medicalRequest, error } = await supabase
        .from('medical_requests')
        .insert([
          {
            contact_id: data.contact_id,
            medical_condition: data.medical_condition,
            document_url: data.document_url || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error inserting medical request:', error);
        throw error;
      }

      console.log('✅ Medical request inserted successfully with ID:', medicalRequest.id);
      console.log('   Full response:', medicalRequest);
      return medicalRequest;
    } catch (error) {
      console.error('❌ Exception in insertMedicalRequest:', error);
      throw error;
    }
  },

  // Log a search query
  async logSearchQuery(query: string) {
    console.log('🔍 Logging search query:', query);

    try {
      const { data, error } = await supabase
        .from('search_logs')
        .insert([
          {
            query: query.trim() || '',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error logging search query:', error);
        throw error;
      }

      console.log('✅ Search query logged successfully with ID:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Exception in logSearchQuery:', error);
      throw error;
    }
  },

  // Get search results (if you add a search_results table later)
  async searchHospitals(query: string): Promise<any[]> {
    // This is a placeholder for future search functionality
    // You can implement full-text search or filter operations here
    console.log(`Searching for: ${query}`);
    return [];
  },
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

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
  // Unified backend inquiry submission
  async submitInquiry(data: {
    fullName: string;
    country: string;
    email: string;
    phone: string;
    medicalCondition?: string;
    documentUrl?: string;
    source: 'contact_form' | 'need_help';
  }) {
    console.log('📝 Submitting inquiry to backend:', data);

    try {
      const response = await fetch(`${apiUrl}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ API error submitting inquiry:', errorData || response.statusText);
        throw new Error(errorData?.message || 'Failed to submit inquiry');
      }

      const result = await response.json();
      console.log('✅ Inquiry submitted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Exception in submitInquiry:', error);
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

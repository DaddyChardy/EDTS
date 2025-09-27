import { createClient } from '@supabase/supabase-js';
import { Document, User } from '../types';
import { USERS } from '../constants';

const supabaseUrl = 'https://iykviztdoelnxaqhcvyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a3ZpenRkb2VsbnhhcWhjdnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MzU2NDYsImV4cCI6MjA3NDUxMTY0Nn0.ITCLGdHXKOlcgt3rU5msgWD8eA39T9uGePCGIgJjzuc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Seeding function to populate initial data if tables are empty
export const seedDatabase = async () => {
    const { data: users, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
        console.error("Error checking users for seeding:", error);
        return;
    }

    if (!users || users.length === 0) {
        console.log("Database empty, seeding users...");
        const { error: seedError } = await supabase.from('users').insert(USERS);
        if (seedError) {
            console.error("Error seeding users:", seedError);
        } else {
            console.log("Users seeded successfully.");
        }
    }
};

// Data fetching functions
export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    return data || [];
};

export const getDocuments = async (): Promise<Document[]> => {
    // Fetch documents and join the sender's user data using the foreign key relationship.
    // The result is aliased to `sender` to match the application's `Document` type.
    // Using a left join (no '!') so that if sender_id is null, the document is still returned.
    const { data, error } = await supabase.from('documents').select('*, sender:users(id, name, office, role)');
    
    if (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
    
    // The query returns `sender` as an object, which matches the `Document` type.
    return (data as Document[]) || [];
};


// Data manipulation functions
export const addUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
    const newUser = { ...user, id: `user-${Date.now()}` };
    const { data, error } = await supabase.from('users').insert(newUser).select().single();
    if (error) {
        console.error('Error adding user:', error);
        return null;
    }
    return data;
};

export const deleteUser = async (userId: string): Promise<void> => {
    // By adding .select(), the response will contain the deleted data.
    // This allows us to confirm that a row was actually deleted.
    const { data, error } = await supabase.from('users').delete().eq('id', userId).select();

    if (error) {
        console.error('Error deleting user:', error);
        throw new Error(`Failed to delete user. Database error: ${error.message}`);
    }

    // Check if any rows were actually deleted. If not, it's a silent failure.
    if (!data || data.length === 0) {
        console.warn('Delete operation completed with no error, but no user was deleted. This is likely a Row Level Security (RLS) issue.');
        throw new Error('Could not delete user. Please check your database permissions. If Row Level Security is enabled on the `users` table, you need a policy that allows public delete operations.');
    }

    console.log('Successfully deleted user:', data);
};

export const addDocument = async (doc: Document): Promise<Document | null> => {
    const { sender, ...rest } = doc;
    const dbDocPayload = { ...rest, sender_id: sender!.id }; // New docs must have a sender
    
    const { error } = await supabase.from('documents').insert(dbDocPayload);
    if (error) {
        console.error('Error adding document:', error);
        return null;
    }
    // Return the original doc with the full sender object to update local state without a refetch
    return doc;
};

export const updateDocument = async (doc: Document): Promise<Document | null> => {
    const { sender, ...rest } = doc;
    const dbDocPayload = { ...rest, sender_id: sender?.id ?? null };

    const { error } = await supabase.from('documents').update(dbDocPayload).eq('id', doc.id);
    if (error) {
        console.error('Error updating document:', error);
        return null;
    }
    // Return the original doc to update local state
    return doc;
};

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document, User } from '../types';
import { USERS } from '../constants';

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iykviztdoelnxaqhcvyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a3ZpenRkb2VsbnhhcWhjdnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MzU2NDYsImV4cCI6MjA3NDUxMTY0Nn0.ITCLGdHXKOlcgt3rU5msgWD8eA39T9uGePCGIgJjzuc';

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);


// Checks if the database is empty and seeds it with initial users.
export const seedDatabase = async (): Promise<void> => {
    try {
        const { count, error: checkError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (checkError) {
            console.error("Error checking users for seeding:", checkError);
            return;
        }

        if (count === 0) {
            console.log("Database empty, seeding users...");
            const { error: insertError } = await supabase.from('users').insert(USERS);
            if (insertError) {
                console.error("Error seeding users:", insertError);
            }
        }
    } catch (e) {
        console.error("Error during seeding check:", e);
    }
};

// Fetches all users from the database.
export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error("Error fetching users:", error);
        return [];
    }
    return data || [];
};

// Fetches all documents, joining the sender's user data.
// Assumes a 'sender_id' foreign key in the 'documents' table pointing to 'users.id'.
export const getDocuments = async (): Promise<Document[]> => {
    const { data, error } = await supabase
        .from('documents')
        .select('*, sender:users(*)');
    
    if (error) {
        console.error("Error fetching documents:", error);
        return [];
    }
    return (data as any[]) || [];
};

// Adds a new user to the database.
export const addUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
    
    if (error) {
        console.error("Error adding user:", error);
        return null;
    }
    return data;
};

// Deletes a user after nullifying their references in the documents table.
export const deleteUser = async (userId: string): Promise<void> => {
    // Set sender_id to null for documents created by this user to avoid foreign key constraints.
    const { error: updateDocError } = await supabase
        .from('documents')
        .update({ sender_id: null })
        .eq('sender_id', userId);

    if (updateDocError) {
        console.error("Error nullifying sender on documents:", updateDocError);
    }
    
    const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (deleteUserError) {
        console.error("Error deleting user:", deleteUserError);
        throw deleteUserError;
    }
};

// Updates an existing user's details.
export const updateUser = async (user: User): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .update({ name: user.name, office: user.office, role: user.role })
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating user:", error);
        return null;
    }
    return data;
};

// Helper to format the Document object for DB insertion/update by replacing the `sender` object with `sender_id`.
const mapDocForDb = (doc: Document) => {
    const { sender, ...rest } = doc;
    return { ...rest, sender_id: sender ? sender.id : null };
};

// Adds a new document to the database.
export const addDocument = async (doc: Document): Promise<Document | null> => {
    const docForDb = mapDocForDb(doc);

    const { data: insertData, error: insertError } = await supabase
        .from('documents')
        .insert([docForDb])
        .select() // Select the full row
        .single();

    if (insertError || !insertData) {
        console.error("Error adding document:", insertError);
        return null;
    }
    
    // The inserted data should already be what we want, but we need to re-fetch to join the sender object.
    const { data: newDoc, error: selectError } = await supabase
        .from('documents')
        .select('*, sender:users(*)')
        .eq('id', insertData.id)
        .single();
    
    if(selectError) {
        console.error("Error fetching new document:", selectError);
        // Fallback to returning the inserted data without the sender object if the refetch fails
        return { ...insertData, sender: doc.sender } as any;
    }
    return newDoc as any;
};

// Updates an existing document.
export const updateDocument = async (doc: Document): Promise<Document | null> => {
    const docForDb = mapDocForDb(doc);

    const { data, error } = await supabase
        .from('documents')
        .update(docForDb)
        .eq('id', doc.id)
        .select('*, sender:users(*)')
        .single();

    if (error) {
        console.error("Error updating document:", error);
        return null;
    }
    return data as any;
};

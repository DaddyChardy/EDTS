import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document, User, Office } from '../types';
import { USERS } from '../constants';

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iykviztdoelnxaqhcvyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a3ZpenRkb2VsbnhhcWhjdnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MzU2NDYsImV4cCI6MjA3NDUxMTY0Nn0.ITCLGdHXKOlcgt3rU5msgWD8eA39T9uGePCGIgJjzuc';

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Checks if the database is empty and seeds it with initial users.
// Office seeding should be done via the Supabase SQL editor as per instructions
// to avoid client-side RLS issues.
export const seedDatabase = async (): Promise<void> => {
    try {
        // Seed Users
        // FIX: Corrected a syntax error in the Supabase query.
        const { count: userCount, error: userCheckError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (userCheckError) throw userCheckError;
        if (userCount === 0) {
            console.log("Database empty, seeding users...");
            const { error: insertError } = await supabase.from('users').insert(USERS);
            if (insertError) throw insertError;
        }

    } catch (e: any) {
        console.error("Error during database seeding:", e.message || e);
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

// Uploads a new avatar for a user to the 'avatars' storage bucket.
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true }); // upsert: true allows overwriting

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError.message);
        throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
};


// Updates an existing user's details.
export const updateUser = async (user: User): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .update({ name: user.name, office: user.office, role: user.role, position: user.position, avatar_url: user.avatar_url })
        .eq('id', user.id)
        .select('*') // Select all columns to get the updated row
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

// Fetches all offices from the database.
export const getOffices = async (): Promise<Office[]> => {
    const { data, error } = await supabase.from('offices').select('*').order('name');
    if (error) {
        console.error("Error fetching offices:", error);
        return [];
    }
    return data || [];
};

// Adds a new office to the database.
export const addOffice = async (officeName: string): Promise<Office> => {
    const { data, error } = await supabase
        .from('offices')
        .insert([{ name: officeName }])
        .select()
        .single();
    
    if (error) {
        console.error("Error adding office:", error.message);
        throw new Error(error.message);
    }
    return data;
};

// Deletes an office, but only if it's not in use by any user.
export const deleteOffice = async (officeName: string): Promise<void> => {
    const { count, error: checkError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('office', officeName);

    if (checkError) {
        console.error("Error checking office usage:", checkError.message);
        throw new Error(`Could not verify if office is in use: ${checkError.message}`);
    }

    if (count !== null && count > 0) {
        throw new Error(`Cannot delete "${officeName}". It is assigned to ${count} user(s).`);
    }

    const { error: deleteError } = await supabase
        .from('offices')
        .delete()
        .eq('name', officeName);

    if (deleteError) {
        console.error("Error deleting office:", deleteError.message);
        throw new Error(deleteError.message);
    }
};
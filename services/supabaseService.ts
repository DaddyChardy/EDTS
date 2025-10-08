import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document, User, Office, Notification } from '../types';
import { USERS } from '../constants';

// Initialize the Supabase client with the provided credentials
const supabaseUrl = 'https://iykviztdoelnxaqhcvyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a3ZpenRkb2VsbnhhcWhjdnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MzU2NDYsImV4cCI6MjA3NDUxMTY0Nn0.ITCLGdHXKOlcgt3rU5msgWD8eA39T9uGePCGIgJjzuc';

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const handleSupabaseError = (error: any, context: string): string => {
    const errorMessage = error?.message || 'An unknown error occurred.';
    console.error(`Error ${context}:`, errorMessage);

    if (typeof errorMessage === 'string') {
        // Specific check for the missing 'notifications' table
        if (errorMessage.includes("relation \"public.notifications\" does not exist") || errorMessage.includes("Could not find the table 'public.notifications'")) {
            console.error(
`--------------------------------------------------------------------------------
[DATABASE SETUP REQUIRED] The 'notifications' table is missing.
--------------------------------------------------------------------------------
The application tried to access the notifications table, but it doesn't exist
in your Supabase database. Please run the following SQL script in your
Supabase SQL Editor to create the table and set the required permissions.

-- 1. Create the 'notifications' table
CREATE TABLE public.notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif_' || substr(md5(random()::text), 0, 15)),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS) for the new table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow the application (using the anon key) to access the table
CREATE POLICY "Allow anon full access to notifications"
ON public.notifications
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

--------------------------------------------------------------------------------`
            );
            return `Database setup required: The 'notifications' table is missing. Check the developer console for the fix.`;
        }

        // Generic hint for other Row Level Security (RLS) issues
        if (errorMessage.includes('security policy') || errorMessage.includes('violates row-level security')) {
            console.error(
                `[RLS Hint] This error is likely due to a Row Level Security (RLS) policy on the table involved in the '${context}' action. ` +
                `Since the app uses anonymous access (anon key), you may need to create policies that allow the 'anon' role to perform this action. ` +
                `For example, to allow all actions on a table for anonymous users, you can run a SQL command like:
      
      CREATE POLICY "Allow anon full access" 
      ON public.your_table_name_here
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true);
      `
            );
        }
    }
    return errorMessage;
};


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
        handleSupabaseError(error, "fetching users");
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
        handleSupabaseError(error, "fetching documents");
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
        handleSupabaseError(error, "adding user");
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
        handleSupabaseError(updateDocError, "nullifying sender on documents");
    }
    
    const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (deleteUserError) {
        throw new Error(handleSupabaseError(deleteUserError, "deleting user"));
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
        throw new Error(handleSupabaseError(uploadError, "uploading avatar"));
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
        handleSupabaseError(error, "updating user");
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
        handleSupabaseError(insertError, "adding document");
        return null;
    }
    
    // The inserted data should already be what we want, but we need to re-fetch to join the sender object.
    const { data: newDoc, error: selectError } = await supabase
        .from('documents')
        .select('*, sender:users(*)')
        .eq('id', insertData.id)
        .single();
    
    if(selectError) {
        handleSupabaseError(selectError, "fetching new document");
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
        handleSupabaseError(error, "updating document");
        return null;
    }
    return data as any;
};

// Fetches all offices from the database.
export const getOffices = async (): Promise<Office[]> => {
    const { data, error } = await supabase.from('offices').select('*').order('name');
    if (error) {
        handleSupabaseError(error, "fetching offices");
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
        throw new Error(handleSupabaseError(error, "adding office"));
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
        throw new Error(handleSupabaseError(checkError, "checking office usage"));
    }

    if (count !== null && count > 0) {
        throw new Error(`Cannot delete "${officeName}". It is assigned to ${count} user(s).`);
    }

    const { error: deleteError } = await supabase
        .from('offices')
        .delete()
        .eq('name', officeName);

    if (deleteError) {
        throw new Error(handleSupabaseError(deleteError, "deleting office"));
    }
};

// NOTIFICATIONS

// Fetches notifications for a specific user, newest first.
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        handleSupabaseError(error, "fetching notifications");
        return [];
    }
    return data || [];
};

// Adds a new notification to the database.
export const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification | null> => {
    const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();
    
    if (error) {
        handleSupabaseError(error, "adding notification");
        return null;
    }
    return data;
};

// Marks all unread notifications for a user as read.
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        handleSupabaseError(error, "marking all notifications as read");
        return false;
    }
    return true;
};

// Marks a single notification as read.
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) {
        handleSupabaseError(error, "marking notification as read");
        return false;
    }
    return true;
};
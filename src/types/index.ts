export type UserRole = 'user' | 'moderator' | 'admin' | 'banned';

export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    role: UserRole;
    karma: number;
    organization: string | null;
    cargo: string | null;
    user_type: 'individual' | 'company' | 'ong' | 'government' | null;
    created_at: string;
    updated_at: string;
}

export interface Post {
    id: string;
    author_id: string;
    title: string;
    content: string | null;
    url: string | null;
    category: string;
    karma: number;
    comment_count: number;
    is_locked: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface PostWithRelations extends Post {
    author: {
        username: string;
        avatar_url: string | null;
        karma: number;
    } | null;
    votes?: Vote[];
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    karma: number;
    parent_id: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface CommentWithRelations extends Comment {
    author: {
        username: string;
        avatar_url: string | null;
        karma?: number;
        display_name?: string | null;
    } | null;
}

export interface Vote {
    id: string;
    user_id: string;
    target_id: string;
    target_type: 'post' | 'comment';
    vote_type: number; // 1 or -1
    created_at: string;
}

export interface Report {
    id: string;
    reporter_id: string;
    target_id: string;
    target_type: 'post' | 'comment' | 'profile';
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    reporter?: {
        username: string;
    } | null;
}

export interface Ban {
    id: string;
    user_id: string;
    moderator_id: string;
    reason: string | null;
    expires_at: string | null;
    created_at: string;
}

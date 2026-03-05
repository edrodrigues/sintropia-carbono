export type UserRole = 'user' | 'moderator' | 'admin' | 'banned';

export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    role: UserRole | null;
    karma: number | null;
    organization: string | null;
    cargo: string | null;
    user_type: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface Post {
    id: string;
    author_id: string;
    title: string;
    content: string | null;
    url: string | null;
    category: string;
    keywords: string[] | null;
    karma: number | null;
    comment_count: number | null;
    is_locked: boolean | null;
    is_deleted: boolean | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface PostWithRelations extends Post {
    author: {
        username: string;
        avatar_url: string | null;
        karma: number;
        linkedin_url?: string | null;
        user_type?: string | null;
    } | null;
    votes?: Vote[];
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    karma: number | null;
    parent_id: string | null;
    is_deleted: boolean | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface CommentWithRelations extends Comment {
    author: {
        username: string;
        avatar_url: string | null;
        karma?: number;
        display_name?: string | null;
        linkedin_url?: string | null;
        user_type?: string | null;
    } | null;
}

export interface Vote {
    id: string;
    user_id: string;
    target_id: string;
    target_type: 'post' | 'comment';
    vote_type: number;
    created_at: string | null;
}

export interface Report {
    id: string;
    reporter_id: string;
    target_id: string;
    target_type: 'post' | 'comment' | 'profile';
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string | null;
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
    created_at: string | null;
}

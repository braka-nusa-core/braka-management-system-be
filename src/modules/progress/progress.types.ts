export type ProjectStatus =
    | "planning"
    | "design"
    | "development"
    | "revision"
    | "testing"
    | "completed";

export interface MilestoneInput {
    title: string;
    completed: boolean;
}

export interface CreateProgressInput {
    client: string;
    projectName: string;
    status?: ProjectStatus;
    progress?: number;
    description?: string;
    milestones?: MilestoneInput[];
}

export interface UpdateProgressInput {
    client?: string;
    projectName?: string;
    status?: ProjectStatus;
    progress?: number;
    description?: string;
    milestones?: MilestoneInput[];
}

export interface ProgressQuery {
    search?: string;
    status?: ProjectStatus;
    client?: string;
    page?: string;
    limit?: string;
}
import { UsersService } from "./users.service";
import { type CreateUserDto, type ListUsersQueryDto, type UpdateUserDto } from "./dto/user.dto";
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    findAll(query: ListUsersQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        name: string;
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        emailVerified: import(".prisma/client").$Enums.EmailVerificationStatus;
        jobTitle: string | null;
        location: string | null;
        bio: string | null;
        website: string | null;
        twoFactorStatus: import(".prisma/client").$Enums.TwoFactorStatus;
        lastLoginAt: Date | null;
        lastActiveAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        emailVerified: import(".prisma/client").$Enums.EmailVerificationStatus;
        jobTitle: string | null;
        location: string | null;
        bio: string | null;
        website: string | null;
        twoFactorStatus: import(".prisma/client").$Enums.TwoFactorStatus;
        lastLoginAt: Date | null;
        lastActiveAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        [x: string]: unknown;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        emailVerified: import(".prisma/client").$Enums.EmailVerificationStatus;
        jobTitle: string | null;
        location: string | null;
        bio: string | null;
        website: string | null;
        twoFactorStatus: import(".prisma/client").$Enums.TwoFactorStatus;
        lastLoginAt: Date | null;
        lastActiveAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

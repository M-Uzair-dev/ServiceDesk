import { Role } from "../../types";
export declare function login(email: string, password: string, role: Role): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
    };
}>;
export declare function refresh(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare function logout(userId: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map
interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string | null;
    picture: string | null;
    isActive: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
}

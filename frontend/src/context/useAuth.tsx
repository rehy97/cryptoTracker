import React, { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginAPI, registerAPI } from "../utils/api";
import { toast } from "react-toastify";
import axios from "axios";
import { UserProfile } from "../models/User";

type UserContextType = {
    user: UserProfile | null;
    token: string | null;
    registerUser: (
        username: string,
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        dateOfBirth: string
    ) => Promise<void>;
    loginUser: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoggedIn: () => boolean;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: Props) => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }

        setIsReady(true);
    }, []);

    const registerUser = async (
        username: string,
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        dateOfBirth: string
    ) => {
        try {
            const response = await registerAPI(username, firstName, lastName, email, password, dateOfBirth);
            if (response && response.data) {
                const userObj = {
                    username: response.data.username,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    dateOfBirth: response.data.dateOfBirth,
                };
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(userObj));
                setToken(response.data.token);
                setUser(userObj);
                toast.success("User registered successfully");
                navigate("/dashboard");
            } else {
                throw new Error(response);
            }
        } catch (e: any) {
            if (e.message) {
                throw new Error(e.message);
            } else {
                throw new Error("Server error occurred");
            }
        }
    };  

    const loginUser = async (username: string, password: string) => {
        try {
            const response = await loginAPI(username, password);
            if (response) {
                const userObj = {
                    username: response.data.username,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    dateOfBirth: response.data.dateOfBirth,
                };
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(userObj));
                setToken(response.data.token);
                setUser(userObj);
                toast.success("User logged in successfully");
                navigate("/dashboard");
            }
        } catch (e) {
            toast.warning("Server error occurred");
        }
    };

    const isLoggedIn = () => {
        return !!user;
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        navigate("/");
    };

    return (
        <UserContext.Provider value={{ loginUser, user, token, logout, isLoggedIn, registerUser }}>
            {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(UserContext);
};

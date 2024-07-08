import axios from 'axios';
import { handleError } from '../helpers/ErrorHandler';
import { UserProfileToken } from '../models/User';

const api = "http://localhost:5221/api";

export const fetchCryptoList = async (currency: string = 'usd') => {
    try {
        const response = await fetch(`${api}/Coin/list?currency=${currency}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

export const loginAPI = async (username: string, password: string) => {
    try {
        const data = await axios.post<UserProfileToken>(`${api}/User/login`, {
            username,
            password,
        });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export const registerAPI = async (username: string, firstName: string, lastName: string, email: string, password: string, dateOfBirth: string) => {
    try {
        const data = await axios.post<UserProfileToken>(`${api}/User/register`, {
            username,
            firstName,
            lastName,
            email,
            password,
            dateOfBirth,
        });
        return data;
    } catch (error : any) {
        handleError(error);
        return error.response.data;
    }
}
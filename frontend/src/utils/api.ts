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
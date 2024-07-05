import { useState, useEffect } from 'react';

const useValidations = (formData: any) => {
  const [validations, setValidations] = useState({
    username: false,
    firstName: false,
    lastName: false,
    email: false,
    passwordLength: false,
    passwordUppercase: false,
    passwordNumber: false,
    passwordMatch: false,
    ageValid: false,
  });

  useEffect(() => {
    const { username, firstName, lastName, email, password, confirmPassword, dateOfBirth } = formData;
    const calculateAge = (dob: string) => {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      return age;
    };

    setValidations({
      username: username.length >= 3,
      firstName: firstName.length > 0,
      lastName: lastName.length > 0,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      passwordLength: password.length >= 8,
      passwordUppercase: /[A-Z]/.test(password),
      passwordNumber: /\d/.test(password),
      passwordMatch: password === confirmPassword,
      ageValid: dateOfBirth ? calculateAge(dateOfBirth) >= 18 : false,
    });
  }, [formData]);

  return validations;
};

export default useValidations;

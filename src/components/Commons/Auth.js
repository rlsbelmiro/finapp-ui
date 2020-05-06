export const isLogged = () => {
    let token = localStorage.getItem('token');
    if (token === null)
        return false;
    else
        return true;
};
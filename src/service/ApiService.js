const api = 'https://localhost:44399/api/';
const getToken = () => {
    return "Bearer " + localStorage.getItem('token');
};

export const ApiService = {
    get(endpoint) {
        return fetch(`${api}${endpoint}`, {
            headers: {
                'authorization': getToken()
            }
        }).then(
            response => response.json()
        ).catch(
            function () {
                return {
                    sucess: false,
                    message: "Erro ao fazer requisição para o servidor",
                    data: null
                }
            }
        )
    },
    getById(endpoint, id) {
        return fetch(`${api}${endpoint}/${id}`, {
            headers: {
                'authorization': getToken()
            }
        }).then(
            response => response.json()
        ).catch(
            function () {
                return {
                    sucess: false,
                    message: "Erro ao fazer requisição para o servidor",
                    data: null
                }
            }
        )
    },
    post(endpoint, data) {
        return fetch(`${api}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': getToken()
            },
            method: "POST",
            body: JSON.stringify(data)
        }).then(
            response => response.json()
        ).catch(function () {
            return {
                sucess: false,
                message: "Erro ao fazer requisição para o servidor",
                data: null
            }
        }
        )
    },
    delete(endpoint, id) {
        return fetch(`${api}${endpoint}/${id}`, {
            headers: {
                'Authorization': getToken()
            },
            method: "DELETE"
        }).then(
            response => response.json()
        ).catch(
            function () {
                return {
                    sucess: false,
                    message: "Erro ao fazer requisição para o servidor",
                    data: null
                }
            }
        )
    },
    put(endpoint, data, id) {
        return fetch(`${api}${endpoint}/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': getToken()
            },
            method: "PUT",
            body: JSON.stringify(data)
        }).then(
            response => response.json()
        ).catch(
            function () {
                return {
                    sucess: false,
                    message: "Erro ao fazer requisição para o servidor",
                    data: null
                }
            }
        )
    },
    postForm(endpoint, data) {
        var formBody = [];
        for (var property in data) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        return fetch(`${api}${endpoint}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: "POST",
            body: formBody
        }).then(
            response => response.json()
        ).catch(
            function () {
                return {
                    sucess: false,
                    message: "Erro ao fazer requisição para o servidor",
                    data: null
                }
            }
        )
    }
}
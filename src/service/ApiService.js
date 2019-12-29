const api = 'http://localhost:8080/finapp-api/rest/';

export const ApiService = {
    get(endpoint){
        return fetch(`${api}${endpoint}`).then(
            response => response.json()
        )
    },
    getById(endpoint,id){
        return fetch(`${api}${endpoint}/${id}`).then(
            response => response.json()
        )
    },
    post(endpoint, data){
        return fetch(`${api}${endpoint}`,{
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',                  
            },
            method: "POST",
            body: JSON.stringify(data)
        }).then(
            response => response.json()
        )
    },
    delete(endpoint,id){
        return fetch(`${api}${endpoint}/${id}`,{
            method: "DELETE"
        }).then(
            response => response.json()
        )
    },
    put(endpoint, data, id){
        return fetch(`${api}${endpoint}/${id}`,{
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',                  
            },
            method: "PUT",
            body: JSON.stringify(data)
        }).then(
            response => response.json()
        )
    }
}
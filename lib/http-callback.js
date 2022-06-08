
const httpCallBuild = function(axios) {
    this.get = axios.get;
}

module.exports = httpCallBuild;
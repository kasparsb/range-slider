function config(data) {
    this.data = data ? data : {};
}
config.prototype = {
    get(name, defaultValue) {
        return typeof this.data[name] === 'undefined' ? defaultValue : this.data[name]
    }
}

export default config
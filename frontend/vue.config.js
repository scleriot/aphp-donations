module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    devServer: {
        disableHostCheck: true,
        proxy: 'http://localhost:1337'
    }
}

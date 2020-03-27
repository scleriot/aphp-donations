module.exports = {
    "transpileDependencies": [
        "vuetify",
        "vuetify-dialog",
        "vue-kanban",
        "strapi-sdk-javascript",
        "unfetch"
    ],
    devServer: {
        disableHostCheck: true,
        proxy: 'http://localhost:1337'
    }
}

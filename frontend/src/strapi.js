import Strapi from 'strapi-sdk-javascript/build/main'

const apiUrl = process.env.VUE_APP_STRAPI_URL || '/'
const strapi = new Strapi(apiUrl)

export default strapi;
export { apiUrl }
